import { useState, useEffect } from 'react'
import './App.css'
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest, graphConfig } from "./authConfig";

function App() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  // --- STANY ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'assets' | 'history'

  const [assets, setAssets] = useState([]);
  const [issues, setIssues] = useState([]); 
  const [azureUsers, setAzureUsers] = useState([]);
  
  // Wyszukiwarki
  const [searchTerm, setSearchTerm] = useState(""); 
  const [historySearchTerm, setHistorySearchTerm] = useState(""); 

  // Modal Dodawania Sprzętu
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', serialNumber: '', status: 'AVAILABLE', assignedTo: '' });

  // Modal Zgłaszania Usterki (Dla Usera)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: '', description: '', priority: 'NORMAL', AssetId: '' });

  // Modale Edycji/Usuwania (Dla Sprzętu)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  
  // Historia
  const [expandedAssetId, setExpandedAssetId] = useState(null);
  const [bulkHistoryCache, setBulkHistoryCache] = useState({});

  useEffect(() => {
    if (isAuthenticated && accounts[0]) {
      const claims = accounts[0].idTokenClaims;
      if (claims?.roles && claims.roles.includes("AppAdmin")) setIsAdmin(true);
      else setIsAdmin(false);
      
      fetchAssets();
      fetchIssues(); 
      fetchAzureUsers();
    } else setIsAdmin(false);
  }, [isAuthenticated, accounts]);

  // --- API ---
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
  const fetchIssues = () => fetch('/api/issues').then(r => r.json()).then(setIssues).catch(console.error);

  const handleLogin = () => instance.loginRedirect(loginRequest);
  const handleLogout = () => instance.logoutRedirect();

  // --- CRUD SPRZĘT ---
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const payload = { ...newItem };
    if (payload.status !== 'ASSIGNED') payload.assignedTo = null;
    fetch('/api/assets', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)})
    .then(res => { if(res.ok) { fetchAssets(); setNewItem({name:'', serialNumber:'', status:'AVAILABLE', assignedTo:''}); setIsAddModalOpen(false); }});
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

  // --- OBSŁUGA ZGŁOSZEŃ (ISSUES) ---
  const handleReportIssue = (e) => {
    e.preventDefault();
    const payload = {
        ...newIssue,
        reportedBy: accounts[0].name,
        userEmail: accounts[0].username
    };
    fetch('/api/issues', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)})
    .then(res => { if(res.ok) { fetchIssues(); setIsIssueModalOpen(false); setNewIssue({title:'', description:'', priority:'NORMAL', AssetId:''}); alert('Zgłoszenie wysłane!'); }});
  };

  const changeIssueStatus = (id, newStatus) => {
      fetch(`/api/issues/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({status: newStatus})})
      .then(res => { if(res.ok) fetchIssues(); });
  };

  // --- FILTROWANIE ---
  const filteredAssets = assets.filter(asset => {
    const hasPermission = isAdmin || asset.assignedTo === accounts[0]?.name;
    if (!hasPermission) return false;
    if (searchTerm === "") return true;
    const lower = searchTerm.toLowerCase();
    return asset.name?.toLowerCase().includes(lower) || asset.serialNumber?.toLowerCase().includes(lower) || asset.assignedTo?.toLowerCase().includes(lower);
  });
  
  const filteredHistoryAssets = assets.filter(asset => {
    const hasPermission = isAdmin || asset.assignedTo === accounts[0]?.name;
    if(!hasPermission) return false;
    if(historySearchTerm === "") return true;
    const lower = historySearchTerm.toLowerCase();
    return asset.serialNumber?.toLowerCase().includes(lower) || asset.name?.toLowerCase().includes(lower);
  });
  
  // Zgłoszenia (User/Admin)
  const allUserIssues = issues.filter(issue => issue.userEmail === accounts[0]?.username);
  const filteredIssuesAdmin = issues;

  // Podział na aktywne i zamknięte
  const myActiveIssues = allUserIssues.filter(i => i.status !== 'CLOSED');
  const myClosedIssues = allUserIssues.filter(i => i.status === 'CLOSED');

  // Urządzenia użytkownika
  const myDevices = assets.filter(a => a.assignedTo === accounts[0]?.name);

  // --- HELPERY ---
  const toggleHistoryExpand = (id) => {
    if(expandedAssetId === id) return;
    setExpandedAssetId(id);
    if(!bulkHistoryCache[id]) fetch(`/api/assets/${id}/history`).then(r=>r.json()).then(d => setBulkHistoryCache(p => ({...p, [id]:d})));
  };
  const openEditModal = (a) => { setEditingItem({...a, assignedTo: a.assignedTo||''}); setIsEditModalOpen(true); };
  const openDeleteModal = (id) => { setIdToDelete(id); setIsDeleteModalOpen(true); };


  // --- EKRAN LOGOWANIA (POPRAWIONY) ---
  if (!isAuthenticated) return (
      <div className="login-container">
         <h1>Magazyn IT</h1>
         <p style={{marginBottom: '30px', color: '#6b7280'}}>Zaloguj się, aby uzyskać dostęp do panelu.</p>
         <button className="login-btn" onClick={handleLogin}>Zaloguj (Microsoft)</button>
      </div>
  );

  return (
    <div className="app-layout">
      <datalist id="azure-users-list">{azureUsers.map(u => <option key={u.id} value={u.displayName}>{u.userPrincipalName}</option>)}</datalist>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>Magazyn IT</h2>
        <nav>
          {/* Zmieniona nazwa dla usera */}
          <button className={`nav-btn ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>
            <span>{isAdmin ? '🚨 Helpdesk' : '💻 Przypisany sprzęt'}</span> 
          </button>
          
          {/* Menu TYLKO DLA ADMINA */}
          {isAdmin && (
            <>
              <button className={`nav-btn ${activeView === 'assets' ? 'active' : ''}`} onClick={() => setActiveView('assets')}>
                <span>📦</span> Baza Sprzętu
              </button>
              
              <button className={`nav-btn ${activeView === 'history' ? 'active' : ''}`} onClick={() => setActiveView('history')}>
                <span>📜</span> Pełna Historia
              </button>

              {activeView === 'assets' && (
                <button className="nav-btn action-btn" onClick={() => setIsAddModalOpen(true)}><span>➕</span> Dodaj Sprzęt</button>
              )}
            </>
          )}
        </nav>
        
        <div className="bottom-section">
          <div style={{fontSize:'0.85rem', marginBottom:'10px', color:'#9ca3af'}}>Zalogowano jako:<br/><strong style={{color:'white'}}>{accounts[0]?.name}</strong></div>
          <button className="logout-btn" style={{width:'100%'}} onClick={handleLogout}>Wyloguj</button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="main-content">
        
        {activeView === 'dashboard' && (
            <div className="dashboard-view">
                <div className="page-header">
                    <h2>{isAdmin ? "Wszystkie zgłoszenia" : "Moje centrum"}</h2>
                    {!isAdmin && (
                        <button className="confirm-btn" onClick={() => setIsIssueModalOpen(true)}>📢 Zgłoś usterkę</button>
                    )}
                </div>

                {isAdmin ? (
                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>Temat</th><th>Urządzenie</th><th>Priorytet</th><th>Zgłaszający</th><th>Status</th><th>Akcja</th></tr></thead>
                            <tbody>
                                {filteredIssuesAdmin.length > 0 ? filteredIssuesAdmin.map(issue => (
                                    <tr key={issue.id}>
                                        <td><strong>{issue.title}</strong><br/><span style={{fontSize:'0.85rem', color:'#6b7280'}}>{issue.description}</span></td>
                                        <td>{issue.Asset ? issue.Asset.name : 'Nieznane'}</td>
                                        <td><span style={{padding:'4px 8px', borderRadius:'6px', fontSize:'0.75rem', fontWeight:'bold', backgroundColor: issue.priority==='HIGH'?'#fee2e2':(issue.priority==='LOW'?'#ecfdf5':'#fffbeb'), color: issue.priority==='HIGH'?'#991b1b':(issue.priority==='LOW'?'#065f46':'#92400e')}}>{issue.priority}</span></td>
                                        <td>{issue.reportedBy}<br/><span style={{fontSize:'0.7rem', color:'#9ca3af'}}>{new Date(issue.createdAt).toLocaleDateString()}</span></td>
                                        <td><span className={`status ${issue.status==='OPEN'?'broken':(issue.status==='CLOSED'?'available':'assigned')}`}>{issue.status}</span></td>
                                        <td>
                                            {issue.status !== 'CLOSED' && (
                                                <div style={{display:'flex', gap:'5px'}}>
                                                    <button className="edit-btn" onClick={() => changeIssueStatus(issue.id, 'IN_PROGRESS')}>Odbierz</button>
                                                    <button className="delete-btn" style={{borderColor:'#10b981', color:'#10b981'}} onClick={() => changeIssueStatus(issue.id, 'CLOSED')}>Zamknij</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan="6" style={{textAlign:'center', padding:'30px', color:'#9ca3af'}}>Brak zgłoszeń.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
                        {/* 1. MOJE URZĄDZENIA */}
                        <div>
                            <h3 style={{marginBottom: '10px', color: '#374151', display:'flex', alignItems:'center', gap:'10px'}}>
                                <span>💻</span> Przypisany sprzęt
                            </h3>
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Nazwa</th><th>Numer Seryjny</th><th>Status</th></tr></thead>
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

                        {/* 2. AKTYWNE ZGŁOSZENIA */}
                        <div>
                            <h3 style={{marginBottom: '10px', color: '#374151', display:'flex', alignItems:'center', gap:'10px'}}>
                                <span>🔥</span> Aktywne zgłoszenia
                            </h3>
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Temat</th><th>Priorytet</th><th>Data</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {myActiveIssues.length > 0 ? myActiveIssues.map(issue => (
                                            <tr key={issue.id}>
                                                <td><strong>{issue.title}</strong><br/><span style={{fontSize:'0.85rem', color:'#6b7280'}}>{issue.description}</span></td>
                                                <td><span style={{padding:'4px 8px', borderRadius:'6px', fontSize:'0.75rem', fontWeight:'bold', backgroundColor: issue.priority==='HIGH'?'#fee2e2':(issue.priority==='LOW'?'#ecfdf5':'#fffbeb'), color: issue.priority==='HIGH'?'#991b1b':(issue.priority==='LOW'?'#065f46':'#92400e')}}>{issue.priority}</span></td>
                                                <td style={{fontSize:'0.9rem'}}>{new Date(issue.createdAt).toLocaleDateString()}</td>
                                                <td><span className={`status ${issue.status==='OPEN'?'broken':'assigned'}`}>{issue.status === 'OPEN' ? 'OTWARTE' : 'W TRAKCIE'}</span></td>
                                            </tr>
                                        )) : <tr><td colSpan="4" style={{textAlign:'center', padding:'20px', color:'#9ca3af'}}>Brak aktywnych zgłoszeń.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 3. ARCHIWUM */}
                        <div>
                            <h3 style={{marginBottom: '10px', color: '#9ca3af', display:'flex', alignItems:'center', gap:'10px', fontSize:'1rem'}}>
                                <span>🗄️</span> Archiwum zgłoszeń
                            </h3>
                            <div className="table-wrapper" style={{opacity: 0.8}}>
                                <table>
                                    <thead><tr><th>Temat</th><th>Data zamknięcia</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {myClosedIssues.length > 0 ? myClosedIssues.map(issue => (
                                            <tr key={issue.id} style={{backgroundColor:'#f9fafb'}}>
                                                <td style={{color:'#6b7280'}}>{issue.title}</td>
                                                <td style={{fontSize:'0.9rem', color:'#6b7280'}}>{new Date(issue.updatedAt).toLocaleDateString()}</td>
                                                <td><span className="status available">ZAMKNIĘTE</span></td>
                                            </tr>
                                        )) : <tr><td colSpan="3" style={{textAlign:'center', padding:'15px', color:'#d1d5db', fontSize:'0.9rem'}}>Brak archiwalnych zgłoszeń.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* --- Pozostałe widoki (Assets, History) tylko dla Admina --- */}
        {isAdmin && activeView === 'assets' && (
          <div className="dashboard-view">
             <div className="table-wrapper">
                <div className="table-toolbar">
                    <h3>Lista urządzeń</h3>
                    <input type="text" className="search-input" placeholder="Szukaj..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
                </div>
                <table>
                    <thead><tr><th>Nazwa</th><th>S/N</th><th>Status / Osoba</th><th>Akcje</th></tr></thead>
                    <tbody>
                        {filteredAssets.map(asset => (
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
                        ))}
                    </tbody>
                </table>
             </div>
          </div>
        )}

        {isAdmin && activeView === 'history' && (
            <div className="history-view">
               <div className="page-header"><h2>Historia zmian</h2><div className="search-input-wrapper"><input type="text" className="search-input" placeholder="Szukaj..." value={historySearchTerm} onChange={e=>setHistorySearchTerm(e.target.value)}/></div></div>
               <div className="history-split-container">
                   <div className="history-list-side">
                       {filteredHistoryAssets.map(a => (
                           <div key={a.id} className={`history-list-card ${expandedAssetId===a.id?'active':''}`} onClick={()=>toggleHistoryExpand(a.id)}>
                               <div style={{fontWeight:'bold'}}>{a.name}</div><div style={{fontSize:'0.85rem',color:'#6b7280'}}>{a.serialNumber}</div>
                           </div>
                       ))}
                   </div>
                   <div className="history-content-side">
                       {expandedAssetId && bulkHistoryCache[expandedAssetId] ? bulkHistoryCache[expandedAssetId].map(h => (
                           <div key={h.id} style={{padding:'15px', borderBottom:'1px solid #eee'}}>
                               <strong>{h.action}</strong> <span style={{fontSize:'0.8rem', color:'#888'}}>{new Date(h.createdAt).toLocaleString()}</span>
                               <p>{h.description}</p>
                           </div>
                       )) : <div style={{padding:'20px', textAlign:'center'}}>Wybierz sprzęt...</div>}
                   </div>
               </div>
            </div>
        )}

      </main>

      {/* --- MODALE --- */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Dodaj nowy sprzęt</h3>
            <form onSubmit={handleAddSubmit}>
              <input type="text" placeholder="Nazwa" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
              <input type="text" placeholder="Numer Seryjny" value={newItem.serialNumber} onChange={e => setNewItem({...newItem, serialNumber: e.target.value})} required />
              <select value={newItem.status} onChange={e => setNewItem({...newItem, status: e.target.value})}>
                <option value="AVAILABLE">Dostępny</option><option value="ASSIGNED">Przypisany</option><option value="BROKEN">Uszkodzony</option>
              </select>
              {newItem.status === 'ASSIGNED' && <input type="text" list="azure-users-list" placeholder="Użytkownik..." value={newItem.assignedTo} onChange={e => setNewItem({...newItem, assignedTo: e.target.value})} />}
              <div className="modal-actions"><button type="button" className="cancel-btn" onClick={()=>setIsAddModalOpen(false)}>Anuluj</button><button type="submit" className="confirm-btn">Dodaj</button></div>
            </form>
          </div>
        </div>
      )}

      {isIssueModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
             <h3>Zgłoś problem ze sprzętem</h3>
             <form onSubmit={handleReportIssue}>
                 <label style={{fontSize:'0.9rem', fontWeight:'bold'}}>Czego dotyczy problem?</label>
                 <select value={newIssue.AssetId} onChange={e => setNewIssue({...newIssue, AssetId: e.target.value})} required>
                     <option value="">-- Wybierz swoje urządzenie --</option>
                     {myDevices.map(d => <option key={d.id} value={d.id}>{d.name} ({d.serialNumber})</option>)}
                 </select>
                 <input type="text" placeholder="Temat (np. Klawiatura nie działa)" value={newIssue.title} onChange={e => setNewIssue({...newIssue, title: e.target.value})} required />
                 <input type="text" placeholder="Opis szczegółowy..." value={newIssue.description} onChange={e => setNewIssue({...newIssue, description: e.target.value})} />
                 <label style={{fontSize:'0.9rem', fontWeight:'bold'}}>Pilność:</label>
                 <select value={newIssue.priority} onChange={e => setNewIssue({...newIssue, priority: e.target.value})}>
                     <option value="LOW">Niska</option><option value="NORMAL">Normalna</option><option value="HIGH">Wysoka (Awaria krytyczna)</option>
                 </select>
                 <div className="modal-actions"><button type="button" className="cancel-btn" onClick={()=>setIsIssueModalOpen(false)}>Anuluj</button><button type="submit" className="confirm-btn">Wyślij zgłoszenie</button></div>
             </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edycja</h3>
            <form onSubmit={handleEditSubmit}>
                <input value={editingItem.name} onChange={e=>setEditingItem({...editingItem, name:e.target.value})} />
                <input value={editingItem.serialNumber} onChange={e=>setEditingItem({...editingItem, serialNumber:e.target.value})} />
                <select value={editingItem.status} onChange={e=>setEditingItem({...editingItem, status:e.target.value})}>
                    <option value="AVAILABLE">Dostępny</option><option value="ASSIGNED">Przypisany</option><option value="BROKEN">Uszkodzony</option>
                </select>
                {editingItem.status === 'ASSIGNED' && <input list="azure-users-list" value={editingItem.assignedTo} onChange={e=>setEditingItem({...editingItem, assignedTo:e.target.value})} />}
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