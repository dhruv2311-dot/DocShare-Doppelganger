import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Files, Shield, Search, Filter, UserCheck, UserX, Eye, Trash2, BarChart3, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeader, Badge, Card, StatCard, EmptyState } from '../components/ui/UIComponents';
import { formatDate, ROLE_COLORS } from '../data/mockData';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const { users, files, links, auditLogs, updateUserStatus, deleteFile } = useApp();
  const [tab, setTab] = useState('users');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [confirmAction, setConfirmAction] = useState(null);

  const displayUsers = users
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    .filter(u => roleFilter === 'all' || u.role === roleFilter);

  const handleToggleUser = (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    updateUserStatus(user.id, newStatus);
    toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    setConfirmAction(null);
  };

  const handleDeleteFile = (file) => {
    deleteFile(file.id);
    toast.success('File deleted successfully');
    setConfirmAction(null);
  };

  const stats = [
    { icon: Users, label: 'Total Users', value: users.length, color: 'blue' },
    { icon: Files, label: 'Total Files', value: files.length, color: 'gold' },
    { icon: Shield, label: 'Active Links', value: links.filter(l => l.status === 'active').length, color: 'green' },
    { icon: BarChart3, label: 'Audit Events', value: auditLogs.length, color: 'purple' },
  ];

  return (
    <div>
      <PageHeader
        title="Admin Panel"
        subtitle="Platform administration — manage users, files, and security"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} delay={i * 0.1} />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100/70 rounded-xl p-1 w-fit border border-gray-200/50">
        {[
          { id: 'users', label: 'User Management', count: users.length },
          { id: 'files', label: 'All Files', count: files.length },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500 hover:text-[#0F172A]'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <Card padding={false}>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 flex-1 border border-gray-200/50 focus-within:border-[#C9A227]/30 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(201,162,39,0.08)] transition-all duration-300">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm outline-none w-full placeholder-slate-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none bg-white text-[#0F172A]"
              >
                <option value="all">All Roles</option>
                <option value="Administrator">Administrator</option>
                <option value="Partner">Partner</option>
                <option value="Client">Client</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-400 font-medium border-b border-gray-100">
                  <th className="text-left px-5 py-3">User</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Role</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Files</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayUsers.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="table-row-hover"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-[#0F172A]" style={{ background: 'linear-gradient(135deg, #C9A227, #E4B93A)' }}>
                          {u.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#0F172A]">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-xs text-slate-400">{u.joinedAt}</span>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-sm text-slate-600">{u.filesCount} files</span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={u.status}>{u.status}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title={u.status === 'active' ? 'Deactivate user' : 'Activate user'}
                          onClick={() => setConfirmAction({ type: 'toggleUser', item: u })}
                          className={`p-1.5 rounded-lg transition-all ${
                            u.status === 'active'
                              ? 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                              : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {u.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {displayUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-slate-400">No users match your search</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'files' && (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-400 font-medium border-b border-gray-100">
                  <th className="text-left px-5 py-3">File</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Uploaded By</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Date</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {files.map((file, i) => (
                  <motion.tr
                    key={file.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="table-row-hover"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-lg flex-shrink-0">
                          {file.type === 'pdf' ? '📄' : ['doc', 'docx'].includes(file.type) ? '📝' : '📁'}
                        </div>
                        <p className="text-sm font-medium text-[#0F172A] truncate max-w-[200px]">{file.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-sm text-slate-600">{file.uploadedBy}</span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-xs text-slate-400">{formatDate(file.uploadedAt)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={file.status}>{file.status}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmAction({ type: 'deleteFile', item: file })}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Confirm modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-[#C9A227]" />
            </div>
            <h3 className="text-lg font-bold text-center text-[#0F172A] mb-2">Confirm Action</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              {confirmAction.type === 'toggleUser'
                ? `${confirmAction.item.status === 'active' ? 'Deactivate' : 'Activate'} user "${confirmAction.item.name}"?`
                : `Delete file "${confirmAction.item.name}"? This cannot be undone.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAction(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button
                onClick={() => confirmAction.type === 'toggleUser' ? handleToggleUser(confirmAction.item) : handleDeleteFile(confirmAction.item)}
                className="flex-1 px-4 py-2.5 bg-[#C9A227] rounded-lg text-sm font-semibold text-[#0F172A] hover:bg-[#E4B93A] transition-colors"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
