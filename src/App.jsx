import { useState, useEffect } from 'react'
import './App.css'
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest, graphConfig } from "./authConfig";

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
      if (!isAdminRole && (activeView === 'assets' || activeView === 'history')) {
        setActiveView('my_assets');
      }
      fetchAssets();
      fetchAzureUsers();
    } else {
      setIsAdmin(false);
    }
  }, [isAuthenticated, accounts]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
        fetchAssets();
        if (expandedAssetId && activeView === 'history') {
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
    }, 2000);
    return () => clearInterval(interval);
  }, [isAuthenticated, expandedAssetId, activeView]);

  const fetchAzureUsers = () => {
    instance.acquireTokenSilent({ ...loginRequest, account: accounts[0] }).then(res => {
        callMsGraph(res.accessToken).then(r => { if(r && r.value) setAzureUsers(r.value); });
    }).catch(console.error);
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
    .then(res => { if(res.ok) { fetchAssets(); setIsEditModalOpen(false); setEditingItem(null); }});
  };

  const confirmDelete = () => {
    if(!idToDelete) return;
    fetch(`/api/assets/${idToDelete}`, { method: 'DELETE' }).then(res => { if(res.ok) { fetchAssets(); setIsDeleteModalOpen(false); setIdToDelete(null); }});
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
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
    if(expandedAssetId === id) return;
    setExpandedAssetId(id);
    fetch(`/api/assets/${id}/history`).then(r=>r.json()).then(d => setBulkHistoryCache(p => ({...p, [id]:d})));
  };

  const openEditModal = (a) => { setEditingItem({...a, assignedTo: a.assignedTo||''}); setIsEditModalOpen(true); };
  const openDeleteModal = (id) => { setIdToDelete(id); setIsDeleteModalOpen(true); };

  if (!isAuthenticated) return (
      <div className="login-container">
         <h1>Magazyn IT</h1>
         <p style={{marginBottom: '30px', color: '#6b7280'}}>Zaloguj się, aby uzyskać dostęp do panelu.</p>
         <button className="login-btn" onClick={handleLogin}>Zaloguj (Microsoft)</button>
      </div>
  );

  return (
    <div className="app-layout">
      {/* TĘ LISTĘ WYKORZYSTUJEMY TERAZ TAKŻE W FILTRACH */}
      <datalist id="azure-users-list">{azureUsers.map(u => <option key={u.id} value={u.displayName}>{u.userPrincipalName}</option>)}</datalist>

      <aside className="sidebar">
        <h2>Magazyn IT</h2>
        <nav>
          {isAdmin ? (
            <>
              <button className={`nav-btn ${activeView === 'assets' ? 'active' : ''}`} onClick={() => setActiveView('assets')}>
                <span>📦</span> Baza Sprzętu
              </button>
              <button className={`nav-btn ${activeView === 'history' ? 'active' : ''}`} onClick={() => setActiveView('history')}>
                <span>📜</span> Pełna Historia
              </button>
            </>
          ) : (
             <button className={`nav-btn ${activeView === 'my_assets' ? 'active' : ''}`} onClick={() => setActiveView('my_assets')}>
                <span>💻</span> Mój Sprzęt
             </button>
          )}
        </nav>
        {isAdmin && <button className="nav-btn action-btn" onClick={() => setIsAddModalOpen(true)}><span>➕</span> Dodaj Sprzęt</button>}
        <div className="bottom-section">
          <div style={{fontSize:'0.85rem', marginBottom:'10px', color:'#9ca3af'}}>Zalogowano jako:<br/><strong style={{color:'white'}}>{accounts[0]?.name}</strong></div>
          <button className="logout-btn" style={{width:'100%'}} onClick={handleLogout}>Wyloguj</button>
        </div>
      </aside>

      <main className="main-content">
        
        {activeView === 'my_assets' && (
            <div className="dashboard-view">
                <div className="page-header"><h2>Mój przypisany sprzęt</h2></div>
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>Nazwa / Model</th><th>Numer Seryjny</th><th>Status</th></tr></thead>
                        <tbody>
                            {myDevices.length > 0 ? myDevices.map(device => (
                                <tr key={device.id}>
                                    <td><span style={{fontWeight:'bold'}}>{device.name}</span></td>
                                    <td>{device.serialNumber}</td>
                                    <td><span className="status assigned">PRZYPISANY</span></td>
                                </tr>
                            )) : <tr><td colSpan="3" style={{textAlign:'center', padding:'20px', color:'#9ca3af'}}>Brak sprzętu.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {isAdmin && activeView === 'assets' && (
          <div className="dashboard-view">
             
             {/* PASEK FILTRÓW Z PODPOWIADANIEM UŻYTKOWNIKA */}
             <div className="filters-bar">
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

                {/* TUTAJ DODANO list="azure-users-list" */}
                <input 
                    type="text" 
                    placeholder="Filtruj po użytkowniku..." 
                    value={filterUser} 
                    onChange={e => setFilterUser(e.target.value)} 
                    className="filter-input"
                    list="azure-users-list" 
                />
             </div>

             <div className="table-wrapper">
                <div className="table-toolbar">
                    <h3>Lista urządzeń</h3>
                    <input type="text" className="search-input" placeholder="Szukaj ogólnie (S/N, Nazwa)..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
                </div>
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('name')} className="sortable">Nazwa / Producent {sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                            <th onClick={() => requestSort('serialNumber')} className="sortable">S/N {sortConfig.key === 'serialNumber' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                            <th onClick={() => requestSort('assignedTo')} className="sortable">Status / Osoba {sortConfig.key === 'assignedTo' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                            <th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAssets.length > 0 ? sortedAssets.map(asset => (
                            <tr key={asset.id}>
                                <td>{asset.name}</td>
                                <td>{asset.serialNumber}</td>
                                <td>
                                    <span className={`status ${asset.status ? asset.status.toLowerCase() : ''}`}>{asset.status}</span>
                                    {asset.status === 'ASSIGNED' && asset.assignedTo && <div style={{fontSize:'0.8rem', fontWeight:'600'}}>👤 {asset.assignedTo}</div>}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="edit-btn" onClick={()=>openEditModal(asset)}>Edytuj</button>
                                        <button className="delete-btn" onClick={()=>openDeleteModal(asset.id)}>Usuń</button>
                                    </div>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="4" style={{textAlign:'center', padding:'30px', color:'#9ca3af'}}>Brak wyników dla wybranych filtrów.</td></tr>}
                    </tbody>
                </table>
             </div>
          </div>
        )}

        {isAdmin && activeView === 'history' && (
            <div className="history-view">
               <div className="page-header">
                   <h2>Historia zmian</h2>
                   <div className="search-input-wrapper"><input type="text" className="search-input" placeholder="Szukaj..." value={historySearchTerm} onChange={e=>setHistorySearchTerm(e.target.value)}/><span className="search-icon">🔍</span></div>
               </div>
               <div className="history-split-container">
                   <div className="history-list-side">
                       {filteredHistoryAssets.length > 0 ? filteredHistoryAssets.map(a => (
                           <div key={a.id} className={`history-list-card ${expandedAssetId===a.id?'active':''}`} onClick={()=>toggleHistoryExpand(a.id)}>
                               <div style={{fontWeight:'bold'}}>{a.name}</div><div style={{fontSize:'0.85rem',color:'#6b7280'}}>{a.serialNumber}</div>
                           </div>
                       )) : <div style={{padding:'20px', textAlign:'center', color:'#9ca3af'}}>Brak wyników</div>}
                   </div>
                   <div className="history-content-side">
                       {expandedAssetId && bulkHistoryCache[expandedAssetId] ? bulkHistoryCache[expandedAssetId].map(h => (
                           <div key={h.id} style={{padding:'15px', borderBottom:'1px solid #eee'}}>
                               <strong>{h.action}</strong> <span style={{fontSize:'0.8rem', color:'#888'}}>{new Date(h.createdAt).toLocaleString()}</span>
                               <p>{h.description}</p>
                           </div>
                       )) : <div style={{padding:'20px', textAlign:'center'}}>Wybierz sprzęt z listy...</div>}
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
      
      {isDeleteModalOpen && (<div className="modal-overlay"><div className="modal-content"><p>Usunąć?</p><div className="modal-actions"><button className="cancel-btn" onClick={()=>setIsDeleteModalOpen(false)}>Nie</button><button className="confirm-btn" onClick={confirmDelete}>Tak</button></div></div></div>)}
    </div>
  )
}

export default App