import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [sharedWithMe, setSharedWithMe] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // Get current user role from localStorage to decide which endpoints to call
  const getStoredUser = () => {
    try { return JSON.parse(localStorage.getItem('docshare_user')); } catch { return null; }
  };

  const fetchFiles = useCallback(async () => {
    try {
      const storedUser = getStoredUser();
      const endpoint = storedUser?.role === 'Administrator' ? '/files/all' : '/files/my-files';
      const { data } = await api.get(endpoint);
      setFiles(data);
    } catch (err) {
      console.error('Failed to fetch files', err);
    }
  }, []);

  const fetchLinks = useCallback(async () => {
    try {
      const { data } = await api.get('/share/my-links');
      setLinks(data);
    } catch (err) {
      console.error('Failed to fetch links', err);
    }
  }, []);

  const fetchSharedWithMe = useCallback(async () => {
    try {
      const { data } = await api.get('/share/shared-with-me');
      setSharedWithMe(data);
    } catch (err) {
      console.error('Failed to fetch shared-with-me', err);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/audit-logs');
      setAuditLogs(data);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  }, []);

  // Fetch all data on mount if user is logged in
  const refreshAll = useCallback(async () => {
    const storedUser = getStoredUser();
    if (!storedUser) return;
    setLoadingData(true);
    const promises = [fetchFiles(), fetchLinks()];
    if (storedUser.role === 'Administrator') {
      promises.push(fetchAuditLogs(), fetchUsers());
    }
    if (storedUser.role === 'Client') {
      promises.push(fetchSharedWithMe());
    }
    await Promise.all(promises);
    setLoadingData(false);
  }, [fetchFiles, fetchLinks, fetchAuditLogs, fetchUsers, fetchSharedWithMe]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // ─── Auto-refresh "Shared With Me" for Clients ───────────────────────────
  // Poll every 30 seconds AND refresh when the window regains focus.
  // This ensures files shared by a Partner appear without a full page reload.
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser?.role !== 'Client') return;

    // Refresh on window focus (user switches back to tab)
    const handleFocus = () => fetchSharedWithMe();
    window.addEventListener('focus', handleFocus);

    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchSharedWithMe();
    }, 30000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [fetchSharedWithMe]);
  // ─────────────────────────────────────────────────────────────────────────

  // Optimistic add after upload (AppContext receives the already-created object from API)
  const addFile = (file) => setFiles(prev => [file, ...prev]);
  const addLink = (link) => setLinks(prev => [link, ...prev]);

  const deleteFile = async (id) => {
    try {
      await api.delete(`/files/${id}`);
      setFiles(prev => prev.filter(f => f.id !== id));
      setLinks(prev => prev.filter(l => l.fileId !== id));
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Delete failed');
    }
  };

  const revokeLink = async (id) => {
    try {
      await api.put(`/share/${id}/revoke`);
      setLinks(prev => prev.map(l => l.id === id ? { ...l, status: 'revoked' } : l));
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Revoke failed');
    }
  };

  const updateUserStatus = async (id, status) => {
    try {
      await api.put(`/admin/users/${id}/status`, { status });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Status update failed');
    }
  };

  // After login/register, allow pages to trigger a data reload
  const reloadAfterAuth = refreshAll;

  return (
    <AppContext.Provider value={{
      files, links, sharedWithMe, auditLogs, users,
      sidebarOpen, setSidebarOpen, loadingData,
      addFile, deleteFile, addLink, revokeLink, updateUserStatus,
      refreshAll, reloadAfterAuth,
      fetchFiles, fetchLinks, fetchSharedWithMe, fetchAuditLogs, fetchUsers,
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

