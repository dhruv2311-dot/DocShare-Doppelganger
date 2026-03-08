import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Search, Download, Filter, Eye, Upload, Shield, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeader, Badge, Card, EmptyState } from '../components/ui/UIComponents';
import { formatDate } from '../data/mockData';

const ACTION_ICONS = {
  'Viewed file': Eye, 'Downloaded file': Download, 'File uploaded': Upload,
  'Link revoked': Shield, 'Permission changed': Edit, 'File deleted': Trash2,
  'Secure link created': ExternalLink, default: ClipboardList
};

const ACTION_COLORS = {
  'Viewed file': 'bg-blue-50 text-blue-600',
  'Downloaded file': 'bg-green-50 text-green-600',
  'File uploaded': 'bg-amber-50 text-[#C9A227]',
  'Link revoked': 'bg-red-50 text-red-500',
  'Permission changed': 'bg-purple-50 text-purple-600',
  'File deleted': 'bg-red-50 text-red-500',
  'Secure link created': 'bg-teal-50 text-teal-600',
  default: 'bg-gray-50 text-gray-500'
};

export default function AuditLogPage() {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  const uniqueUsers = [...new Set(auditLogs.map(l => l.user))];
  const uniqueActions = [...new Set(auditLogs.map(l => l.action))];

  const displayLogs = auditLogs
    .filter(l => {
      const matchSearch = l.user.toLowerCase().includes(search.toLowerCase()) ||
        l.fileName.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase());
      const matchAction = actionFilter === 'all' || l.action === actionFilter;
      const matchUser = userFilter === 'all' || l.user === userFilter;
      return matchSearch && matchAction && matchUser;
    });

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Complete record of all file and security events"
      />

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Events', value: auditLogs.length },
          { label: 'File Views', value: auditLogs.filter(l => l.action === 'Viewed file').length },
          { label: 'Downloads', value: auditLogs.filter(l => l.action === 'Downloaded file').length },
          { label: 'Uploads', value: auditLogs.filter(l => l.action === 'File uploaded').length },
        ].map(s => (
          <Card key={s.label} className="text-center py-3">
            <p className="text-2xl font-bold text-[#0F172A]">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card padding={false}>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 flex-1 border border-gray-200/50 focus-within:border-[#C9A227]/30 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(201,162,39,0.08)] transition-all duration-300">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none text-[#0F172A] placeholder-slate-400 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={userFilter}
              onChange={e => setUserFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none bg-white text-[#0F172A]"
            >
              <option value="all">All Users</option>
              {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none bg-white text-[#0F172A]"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {displayLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-400 font-medium border-b border-gray-100">
                  <th className="text-left px-5 py-3">Event</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">User</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">File</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">IP Address</th>
                  <th className="text-left px-5 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayLogs.map((log, i) => {
                  const LogIcon = ACTION_ICONS[log.action] || ACTION_ICONS.default;
                  const colorClass = ACTION_COLORS[log.action] || ACTION_COLORS.default;
                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="table-row-hover"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                            <LogIcon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-[#0F172A]">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#0F172A] flex items-center justify-center text-xs text-[#C9A227] font-bold">
                            {log.user.slice(0, 1)}
                          </div>
                          <span className="text-sm text-slate-700">{log.user}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-sm text-slate-500 truncate max-w-[160px] block">{log.fileName}</span>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-xs font-mono text-slate-400 bg-gray-50 px-2 py-0.5 rounded">{log.ip}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-slate-400">{formatDate(log.timestamp)}</span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={ClipboardList} title="No logs found" description="No activity matches your current filters." />
        )}
      </Card>
    </div>
  );
}
