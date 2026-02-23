import { useState, useEffect } from 'react'
import './App.css'
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest, graphConfig } from "./authConfig";
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  LayoutDashboard, Package, History, LogOut, Plus, Search, 
  Laptop, CheckCircle, UserCheck, AlertTriangle, RotateCcw, 
  ChevronDown, ChevronUp, Box, Calendar, Activity, MousePointerClick
} from 'lucide-react';

const hardwareOptions = {
  "Laptop": {
    "Lenovo": ["ThinkPad T14", "ThinkPad X1 Carbon"],
    "HP": ["EliteBook 840", "ProBook 450"]
  },
  "Telefon": {
    "Samsung": ["Galaxy S24", "Galaxy A55"],
    "Apple": ["iPhone 15", "iPhone 14"]
  },
  "Monitor": {
    "Dell": ["P2422H", "U2723QE"],
    "HP": ["E24 G5", "Z27k G3"]
  },
  "Stacja dokująca": {
    "Lenovo": ["ThinkPad Universal USB-C Dock"],
    "HP": ["USB-C Dock G5"]
  }
};

function App() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const [isAdmin, setIsAdmin] = useState(false);
  const [activeView, setActiveView] = useState(() => localStorage.getItem('activeView') || 'my_assets');

  const [assets, setAssets] = useState([]);
  const [azureUsers, setAzureUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, assigned: 0, broken: 0, recent: [] });
  
  const [searchTerm, setSearchTerm] = useState(""); 
  const [historySearchTerm, setHistorySearchTerm] = useState(""); 
  const [filterCategory, setFilterCategory] = useState("");
  const [filterManufacturer, setFilterManufacturer] = useState("");
  const [filterUser, setFilterUser] = useState("");

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addCategory, setAddCategory] = useState("");
  const [addManufacturer, setAddManufacturer] = useState("");
  const [addModel, setAddModel] = useState("");
  const [newItem, setNewItem] = useState({ serialNumber: '', status: 'AVAILABLE', assignedTo: '' });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  
  const [expandedAssetId, setExpandedAssetId] = useState(null);
  const [bulkHistoryCache, setBulkHistoryCache] = useState({});

  useEffect(() => {
    localStorage.setItem('activeView', activeView);
  }, [activeView]);

  useEffect(() => {
    if (isAuthenticated && accounts[0]) {
      const claims = accounts[0].idTokenClaims;
      const isAdminRole = claims?.roles && claims.roles.includes("AppAdmin");
      setIsAdmin(isAdminRole);
      
      if (isAdminRole) {
         if (activeView === 'my_assets') setActiveView('dashboard');
      } else {
         setActiveView('my_assets');
      }

      fetchAssets();
      fetchAzureUsers();
      fetchStats();
    } else {
      setIsAdmin(false);
    }
  }, [isAuthenticated, accounts]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
        fetchAssets();
        fetchStats();
        if (expandedAssetId) {
            fetch(`/api/assets/${expandedAssetId}/history`)
                .then(r => r.json())
                .then(data => {
                    setBulkHistoryCache(prev => {
                        if (JSON.stringify(prev[expandedAssetId]) !== JSON.stringify(data)) {
                            return { ...prev, [expandedAssetId]: data };
                        }
                        return prev;
                    });
                })
                .catch(console.error);
        }
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, expandedAssetId]);

  const fetchAzureUsers = () => {
    instance.acquireTokenSilent({ ...loginRequest, account: accounts[0] }).then(res => {
        callMsGraph(res.accessToken).then(r => { if(r && r.value) setAzureUsers(r.value); });
    }).catch(console.error);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard-stats');
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error(e); }
  };

  async function callMsGraph(token) {
      const headers = new Headers(); headers.append("Authorization", `Bearer ${token}`);
      return fetch(graphConfig.graphUsersEndpoint, { method: "GET", headers }).then(r => r.json());
  }

  const fetchAssets = () => fetch('/api/assets').then(r => r.json()).then(setAssets).catch(console.error);

  const handleLogin = () => instance.loginRedirect(loginRequest);
  const handleLogout = () => {
      localStorage.removeItem('activeView');
      instance.logoutRedirect();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterCategory("");
    setFilterManufacturer("");
    setFilterUser("");
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const fullName = `${addManufacturer} ${addModel}`;
    const payload = { 
        name: fullName,
        serialNumber: newItem.serialNumber,
        status: newItem.status,
        assignedTo: newItem.status === 'ASSIGNED' ? newItem.assignedTo : null
    };
    fetch('/api/assets', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)})
    .then(res => { 
        if(res.ok) { 
            fetchAssets(); 
            fetchStats();
            setNewItem({ serialNumber: '', status: 'AVAILABLE', assignedTo: '' });
            setAddCategory(""); setAddManufacturer(""); setAddModel("");
            setIsAddModalOpen(false); 
        }
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const payload = { ...editingItem };
    if (payload.status !== 'ASSIGNED') payload.assignedTo = null;
    fetch(`/api/assets/${editingItem.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)})
    .then(res => { if(res.ok) { fetchAssets(); fetchStats(); setIsEditModalOpen(false); setEditingItem(null); }});
  };

  const confirmDelete = () => {
    if(!idToDelete) return;
    fetch(`/api/assets/${idToDelete}`, { method: 'DELETE' }).then(res => { if(res.ok) { fetchAssets(); fetchStats(); setIsDeleteModalOpen(false); setIdToDelete(null); }});
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
    setSortConfig({ key, direction });
  };

  const filteredAssets = assets.filter(asset => {
    if (searchTerm !== "") {
        const lower = searchTerm.toLowerCase();
        const matchesSearch = (asset.name || "").toLowerCase().includes(lower) || 
                              (asset.serialNumber || "").toLowerCase().includes(lower) || 
                              (asset.assignedTo || "").toLowerCase().includes(lower);
        if (!matchesSearch) return false;
    }
    if (filterCategory !== "") {
        const manufacturers = Object.keys(hardwareOptions[filterCategory] || {});
        const matchesCategory = manufacturers.some(man => (asset.name || "").includes(man));
        if (!matchesCategory) return false;
    }
    if (filterManufacturer !== "") {
        if (!(asset.name || "").includes(filterManufacturer)) return false;
    }
    if (filterUser !== "") {
        if (!(asset.assignedTo || "").toLowerCase().includes(filterUser.toLowerCase())) return false;
    }
    return true;
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (sortConfig.key) {
      let aValue = a[sortConfig.key] || "";
      let bValue = b[sortConfig.key] || "";
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });
  
  const filteredHistoryAssets = assets.filter(asset => {
    if(historySearchTerm === "") return true;
    const lower = historySearchTerm.toLowerCase();
    return (asset.serialNumber || "").toLowerCase().includes(lower) || (asset.name || "").toLowerCase().includes(lower);
  });
  
  const myDevices = assets.filter(a => a.assignedTo === accounts[0]?.name);

  const toggleHistoryExpand = (id) => {
    if (expandedAssetId === id) {
        setExpandedAssetId(null);
        return;
    }
    setExpandedAssetId(id);
    fetch(`/api/assets/${id}/history`)
        .then(r => r.json())
        .then(d => setBulkHistoryCache(p => ({...p, [id]:d})))
        .catch(console.error);
  };

  const openEditModal = (a) => { setEditingItem({...a, assignedTo: a.assignedTo||''}); setIsEditModalOpen(true); };
  const openDeleteModal = (id) => { setIdToDelete(id); setIsDeleteModalOpen(true); };

  const renderDashboard = () => {
    const pieData = [
      { name: 'Dostępne', value: stats.available },
      { name: 'Przypisane', value: stats.assigned },
      { name: 'Uszkodzone', value: stats.broken },
    ];
    const COLORS = ['#10B981', '#3B82F6', '#EF4444'];

    return (
      <div className="dashboard-container fade-in">
        <h2 className="page-header">Panel Główny</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="icon-wrapper indigo"><Laptop size={24} /></div>
            <div>
              <p className="stat-label">Wszystkie Zasoby</p>
              <h3 className="stat-value">{stats.total}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="icon-wrapper green"><CheckCircle size={24} /></div>
            <div>
              <p className="stat-label">Dostępne</p>
              <h3 className="stat-value">{stats.available}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="icon-wrapper blue"><UserCheck size={24} /></div>
            <div>
              <p className="stat-label">Przypisane</p>
              <h3 className="stat-value">{stats.assigned}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="icon-wrapper red"><AlertTriangle size={24} /></div>
            <div>
              <p className="stat-label">Uszkodzone</p>
              <h3 className="stat-value">{stats.broken}</h3>
            </div>
          </div>
        </div>

        <div className="charts-section">
          <div className="chart-card">
            <h3>Status Sprzętu</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <h3>Ostatnio dodane</h3>
            <table className="recent-table">
              <thead><tr><th>Nazwa</th><th>S/N</th><th>Status</th></tr></thead>
              <tbody>
                {stats.recent.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td className="text-muted">{item.serialNumber}</td>
                    <td><span className={`status-dot ${item.status.toLowerCase()}`}></span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) return (
      <div className="login-container">
         <div className="login-box">
             <h1>Magazyn IT</h1>
             <p>Zaloguj się, aby uzyskać dostęp do panelu.</p>
             <button className="login-btn" onClick={handleLogin}>Zaloguj (Microsoft)</button>
         </div>
      </div>
  );

  return (
    <div className="app-layout">
      <datalist id="azure-users-list">{azureUsers.map(u => <option key={u.id} value={u.displayName}>{u.userPrincipalName}</option>)}</datalist>

      <aside className="sidebar">
        <div className="sidebar-top">
           <h2>Magazyn IT</h2>
           <p className="role-badge">{isAdmin ? 'Administrator' : 'Użytkownik'}</p>
        </div>
        
        <nav style={{ flex: 1 }}>
          {isAdmin ? (
            <>
              <button className={`nav-btn ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>
                <LayoutDashboard size={20} /> Dashboard
              </button>
              <button className={`nav-btn ${activeView === 'assets' ? 'active' : ''}`} onClick={() => setActiveView('assets')}>
                <Package size={20} /> Baza Sprzętu
              </button>
              <button className={`nav-btn ${activeView === 'history' ? 'active' : ''}`} onClick={() => setActiveView('history')}>
                <History size={20} /> Pełna Historia
              </button>
            </>
          ) : (
             <button className={`nav-btn ${activeView === 'my_assets' ? 'active' : ''}`} onClick={() => setActiveView('my_assets')}>
                <Laptop size={20} /> Mój Sprzęt
             </button>
          )}
        </nav>
        
        {isAdmin && (
            <div className="add-btn-wrapper">
                <button className="add-btn-main" onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={18}/> Dodaj Sprzęt
                </button>
            </div>
        )}

        <div className="bottom-section">
          <div className="user-info">
             <div className="avatar">{accounts[0]?.name.charAt(0)}</div>
             <div className="user-details">
                <span className="user-label">Zalogowano jako</span>
                <span className="user-name">{accounts[0]?.name}</span>
             </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}><LogOut size={16}/> Wyloguj</button>
        </div>
      </aside>

      <main className="main-content">
        {activeView === 'dashboard' && renderDashboard()}
        
        {activeView === 'my_assets' && (
            <div className="view-container">
                <div className="page-header"><h2>Mój przypisany sprzęt</h2></div>
                <div className="card">
                    <table>
                        <thead><tr><th>Nazwa / Model</th><th>Numer Seryjny</th><th>Status</th></tr></thead>
                        <tbody>
                            {myDevices.length > 0 ? myDevices.map(device => (
                                <tr key={device.id}>
                                    <td><span style={{fontWeight:'bold'}}>{device.name}</span></td>
                                    <td>{device.serialNumber}</td>
                                    <td><span className="status-badge assigned">PRZYPISANY</span></td>
                                </tr>
                            )) : <tr><td colSpan="3" className="empty-state">Brak sprzętu.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {isAdmin && activeView === 'assets' && (
          <div className="view-container">
             <div className="filters-bar">
                <div className="search-wrapper">
                   <Search size={18} className="search-icon"/>
                   <input type="text" placeholder="Szukaj (S/N, Nazwa)..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
                </div>

                <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setFilterManufacturer(""); }} className="filter-select">
                    <option value="">Wszystkie Kategorie</option>
                    {Object.keys(hardwareOptions).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                
                <select value={filterManufacturer} onChange={e => setFilterManufacturer(e.target.value)} disabled={!filterCategory} className="filter-select">
                    <option value="">Wszyscy Producenci</option>
                    {filterCategory && hardwareOptions[filterCategory] && Object.keys(hardwareOptions[filterCategory]).map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
                
                <input type="text" placeholder="Filtruj po użytkowniku..." value={filterUser} onChange={e => setFilterUser(e.target.value)} className="filter-input" list="azure-users-list" />
                
                <button className="reset-btn" onClick={resetFilters} title="Wyczyść filtry">
                    <RotateCcw size={18} />
                </button>
             </div>

             <div className="card">
                <div className="table-toolbar">
                    <h3>Lista urządzeń</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('name')} className="sortable">Nazwa / Producent</th>
                            <th onClick={() => requestSort('serialNumber')} className="sortable">S/N</th>
                            <th onClick={() => requestSort('assignedTo')} className="sortable">Status / Osoba</th>
                            <th style={{textAlign:'right'}}>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAssets.length > 0 ? sortedAssets.map(asset => (
                            <>
                                <tr key={asset.id} className={expandedAssetId === asset.id ? 'expanded-row-parent' : ''}>
                                    <td>{asset.name}</td>
                                    <td>{asset.serialNumber}</td>
                                    <td>
                                        <span className={`status-badge ${asset.status.toLowerCase()}`}>
                                        {asset.status === 'AVAILABLE' ? 'Dostępny' : asset.status === 'ASSIGNED' ? 'Przypisany' : 'Uszkodzony'}
                                        </span>
                                        {asset.status === 'ASSIGNED' && asset.assignedTo && <div className="assigned-user-small">{asset.assignedTo}</div>}
                                    </td>
                                    <td>
                                        <div className="action-buttons right-align">
                                            <button 
                                                className={`text-btn history-btn ${expandedAssetId === asset.id ? 'active' : ''}`} 
                                                onClick={() => toggleHistoryExpand(asset.id)}
                                            >
                                                Historia {expandedAssetId === asset.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                            </button>
                                            <button className="text-btn edit-btn" onClick={()=>openEditModal(asset)}>Edytuj</button>
                                            <button className="text-btn delete-btn" onClick={()=>openDeleteModal(asset.id)}>Usuń</button>
                                        </div>
                                    </td>
                                </tr>
                                
                                {expandedAssetId === asset.id && (
                                    <tr className="history-expansion-row">
                                        <td colSpan="4">
                                            <div className="history-expansion-content">
                                                <h4 style={{marginBottom: '8px'}}>Ostatnia aktywność:</h4>
                                                {bulkHistoryCache[asset.id] ? (
                                                    bulkHistoryCache[asset.id].length > 0 ? (
                                                        <div className="latest-history-item">
                                                            <div className="hl-date">
                                                                {new Date(bulkHistoryCache[asset.id][0].createdAt).toLocaleString()}
                                                            </div>
                                                            <div className="hl-action">
                                                                <strong>{bulkHistoryCache[asset.id][0].action}</strong>: {bulkHistoryCache[asset.id][0].description}
                                                            </div>
                                                        </div>
                                                    ) : <p className="text-muted">Brak historii dla tego sprzętu.</p>
                                                ) : (
                                                    <p className="loading-text">Ładowanie...</p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        )) : <tr><td colSpan="4" className="empty-state">Brak wyników.</td></tr>}
                    </tbody>
                </table>
             </div>
          </div>
        )}

        {isAdmin && activeView === 'history' && (
            <div className="view-container" style={{height: '100%'}}>
               <div className="page-header">
                   <h2>Historia zmian</h2>
                   <div className="search-wrapper">
                       <Search size={18} className="search-icon"/>
                       <input type="text" placeholder="Szukaj w historii (S/N, Nazwa)..." value={historySearchTerm} onChange={e=>setHistorySearchTerm(e.target.value)}/>
                   </div>
               </div>
               
               <div className="history-split-container">
                   <div className="history-list-side">
                       {filteredHistoryAssets.length > 0 ? filteredHistoryAssets.map(a => (
                           <div 
                               key={a.id} 
                               className={`history-list-card ${expandedAssetId===a.id?'active':''}`} 
                               onClick={()=>toggleHistoryExpand(a.id)}
                           >
                               <div className="hl-icon-wrapper">
                                   <Box size={20} />
                               </div>
                               <div className="hl-info">
                                   <div className="asset-name">{a.name}</div>
                                   <div className="asset-sn">{a.serialNumber}</div>
                               </div>
                           </div>
                       )) : <div className="empty-state">Brak wyników</div>}
                   </div>

                   <div className="history-content-side">
                       {expandedAssetId && bulkHistoryCache[expandedAssetId] ? (
                           bulkHistoryCache[expandedAssetId].length > 0 ? (
                               <div className="timeline">
                                   {bulkHistoryCache[expandedAssetId].map(h => {
                                       let actionType = 'update';
                                       if (h.action.includes('UTWORZENIE') || h.action.includes('CREATE')) actionType = 'create';
                                       if (h.action.includes('USUNIĘCIE') || h.action.includes('DELETE')) actionType = 'delete';

                                       return (
                                           <div key={h.id} className={`timeline-item ${actionType}`}>
                                               <div className="timeline-dot"></div>
                                               <div className="timeline-date">
                                                   <Calendar size={12} />
                                                   {new Date(h.createdAt).toLocaleString()}
                                               </div>
                                               <div className="timeline-card">
                                                   <div className="timeline-header" style={{
                                                       color: actionType === 'create' ? '#059669' : 
                                                              actionType === 'delete' ? '#DC2626' : '#2563EB'
                                                   }}>
                                                       {h.action}
                                                   </div>
                                                   <div className="timeline-desc">
                                                       {h.description}
                                                   </div>
                                               </div>
                                           </div>
                                       );
                                   })}
                               </div>
                           ) : (
                               <div className="history-placeholder">
                                   <Activity size={48} opacity={0.2} />
                                   <p>Brak historii dla tego urządzenia.</p>
                               </div>
                           )
                       ) : (
                           <div className="history-placeholder">
                               <MousePointerClick size={64} strokeWidth={1} />
                               <h3>Wybierz sprzęt</h3>
                               <p>Kliknij element na liście po lewej,<br/>aby zobaczyć jego pełną historię.</p>
                           </div>
                       )}
                   </div>
               </div>
            </div>
        )}
      </main>

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Dodaj nowy sprzęt</h3>
            <form onSubmit={handleAddSubmit}>
              <select value={addCategory} onChange={e => { setAddCategory(e.target.value); setAddManufacturer(""); setAddModel(""); }} required>
                <option value="">-- Wybierz kategorię --</option>
                {Object.keys(hardwareOptions).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <select value={addManufacturer} onChange={e => { setAddManufacturer(e.target.value); setAddModel(""); }} disabled={!addCategory} required>
                <option value="">-- Wybierz producenta --</option>
                {addCategory && hardwareOptions[addCategory] && Object.keys(hardwareOptions[addCategory]).map(man => <option key={man} value={man}>{man}</option>)}
              </select>
              <select value={addModel} onChange={e => setAddModel(e.target.value)} disabled={!addManufacturer} required>
                <option value="">-- Wybierz model --</option>
                {addCategory && addManufacturer && hardwareOptions[addCategory][addManufacturer].map(mod => <option key={mod} value={mod}>{mod}</option>)}
              </select>
              <input type="text" placeholder="Numer Seryjny" value={newItem.serialNumber} onChange={e => setNewItem({...newItem, serialNumber: e.target.value})} required />
              <select value={newItem.status} onChange={e => setNewItem({...newItem, status: e.target.value})}>
                <option value="AVAILABLE">Dostępny</option><option value="ASSIGNED">Przypisany</option><option value="BROKEN">Uszkodzony</option>
              </select>
              {newItem.status === 'ASSIGNED' && <input type="text" list="azure-users-list" placeholder="Użytkownik..." value={newItem.assignedTo} onChange={e => setNewItem({...newItem, assignedTo: e.target.value})} />}
              <div className="modal-actions"><button type="button" className="cancel-btn" onClick={() => setIsAddModalOpen(false)}>Anuluj</button><button type="submit" className="confirm-btn">Dodaj</button></div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edycja</h3>
            <form onSubmit={handleEditSubmit}>
                <input type="text" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} placeholder="Nazwa urządzenia"/>
                <input type="text" value={editingItem.serialNumber} onChange={e => setEditingItem({...editingItem, serialNumber: e.target.value})} placeholder="Numer seryjny"/>
                <select value={editingItem.status} onChange={e => setEditingItem({...editingItem, status: e.target.value})}>
                    <option value="AVAILABLE">Dostępny</option><option value="ASSIGNED">Przypisany</option><option value="BROKEN">Uszkodzony</option>
                </select>
                {editingItem.status === 'ASSIGNED' && <input list="azure-users-list" value={editingItem.assignedTo} onChange={e => setEditingItem({...editingItem, assignedTo: e.target.value})} placeholder="Użytkownik..."/>}
                <div className="modal-actions"><button type="button" className="cancel-btn" onClick={()=>setIsEditModalOpen(false)}>Anuluj</button><button type="submit" className="confirm-btn">Zapisz</button></div>
            </form>
          </div>
        </div>
      )}
      
      {isDeleteModalOpen && (<div className="modal-overlay"><div className="modal-content"><p>Usunąć trwale?</p><div className="modal-actions"><button className="cancel-btn" onClick={()=>setIsDeleteModalOpen(false)}>Nie</button><button className="confirm-btn delete" onClick={confirmDelete}>Tak</button></div></div></div>)}
    </div>
  )
}

export default App