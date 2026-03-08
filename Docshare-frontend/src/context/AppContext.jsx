import { createContext, useContext, useState } from 'react';
import { MOCK_FILES, MOCK_LINKS, MOCK_AUDIT_LOGS, MOCK_USERS_LIST } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [files, setFiles] = useState(MOCK_FILES);
  const [links, setLinks] = useState(MOCK_LINKS);
  const [auditLogs, setAuditLogs] = useState(MOCK_AUDIT_LOGS);
  const [users, setUsers] = useState(MOCK_USERS_LIST);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const addFile = (file) => {
    setFiles(prev => [file, ...prev]);
  };

  const deleteFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setLinks(prev => prev.filter(l => l.fileId !== id));
  };

  const addLink = (link) => {
    setLinks(prev => [link, ...prev]);
  };

  const revokeLink = (id) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, status: 'revoked' } : l));
  };

  const addAuditLog = (log) => {
    setAuditLogs(prev => [{ ...log, id: Date.now(), timestamp: new Date().toISOString() }, ...prev]);
  };

  const updateUserStatus = (id, status) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
  };

  return (
    <AppContext.Provider value={{
      files, links, auditLogs, users,
      sidebarOpen, setSidebarOpen,
      addFile, deleteFile, addLink, revokeLink, addAuditLog, updateUserStatus
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
