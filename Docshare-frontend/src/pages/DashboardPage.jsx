import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Files, Share2, Clock, TrendingUp, Upload, Eye, Download, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { StatCard, Badge, Button, Card } from '../components/ui/UIComponents';
import { formatDate, formatFileSize, isExpired, FILE_ICONS } from '../data/mockData';

export default function DashboardPage() {
  const { user } = useAuth();
  const { files, links, auditLogs } = useApp();

  const myFiles = user?.role === 'Client'
    ? files.filter(f => f.sharedWith.includes(user.name))
    : files.filter(f => user?.role === 'Administrator' ? true : f.uploadedById === 2);

  const activeLinks = links.filter(l => l.status === 'active' && !isExpired(l.expiresAt));
  const expiredLinks = links.filter(l => l.status === 'expired' || isExpired(l.expiresAt));
  const recentActivity = [...auditLogs].slice(0, 5);
  const totalSize = myFiles.reduce((acc, f) => acc + f.size, 0);

  const actionItems = [
    { icon: Upload, label: 'Upload File', path: '/upload', color: 'gold', desc: 'Upload a new document', roles: ['Administrator', 'Partner'] },
    { icon: Share2, label: 'Shared Links', path: '/links', color: 'blue', desc: 'Manage secure links', roles: ['Administrator', 'Partner', 'Client'] },
    { icon: Files, label: 'My Files', path: '/files', color: 'green', desc: 'Browse all documents', roles: ['Administrator', 'Partner', 'Client'] },
  ].filter(a => a.roles.includes(user?.role));

  return (
    <div>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] font-poppins tracking-tight">
              Good afternoon, <span className="text-gold-gradient">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">Here's what's happening with your documents today.</p>
          </div>
          {(user?.role === 'Administrator' || user?.role === 'Partner') && (
            <Link to="/upload">
              <Button icon={Upload} size="md">Upload File</Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Files} label="Total Files" value={myFiles.length} subtext={formatFileSize(totalSize) + ' total'} color="gold" delay={0} />
        <StatCard icon={Share2} label="Active Links" value={activeLinks.length} subtext="Links currently active" color="blue" delay={0.1} />
        <StatCard icon={Clock} label="Expired Links" value={expiredLinks.length} subtext="Links that have expired" color="red" delay={0.2} />
        <StatCard icon={TrendingUp} label="Total Activity" value={auditLogs.length} subtext="Events recorded" color="green" delay={0.3} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {actionItems.map((item, i) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <Link to={item.path} className="block">
              <Card className="hover:shadow-md transition-all duration-200 hover:border-[#C9A227]/20 group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#0F172A] flex items-center justify-center group-hover:bg-[#C9A227] transition-colors duration-300">
                    <item.icon className="w-5 h-5 text-[#C9A227] group-hover:text-[#0F172A] transition-colors duration-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F172A]">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Files */}
        <div className="lg:col-span-2">
          <Card padding={false}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-[#0F172A]">Recent Files</h2>
              <Link to="/files" className="text-sm text-[#C9A227] hover:underline">View all →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {myFiles.slice(0, 5).map((file) => (
                <div key={file.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-lg flex-shrink-0">
                    {FILE_ICONS[file.type] || FILE_ICONS.default}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0F172A] truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">{formatFileSize(file.size)} • {formatDate(file.uploadedAt)}</p>
                  </div>
                  <Badge variant={file.status}>{file.status}</Badge>
                </div>
              ))}
              {myFiles.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No files yet</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card padding={false}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-[#0F172A]">Recent Activity</h2>
              <Link to="/audit" className="text-sm text-[#C9A227] hover:underline">View all →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentActivity.map((log) => {
                const icons = { 'Viewed file': Eye, 'Downloaded file': Download, default: AlertCircle };
                const LogIcon = icons[log.action] || icons.default;
                return (
                  <div key={log.id} className="px-5 py-3.5">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <LogIcon className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#0F172A]">
                          <span className="text-[#C9A227]">{log.user}</span>
                        </p>
                        <p className="text-xs text-slate-500">{log.action}</p>
                        <p className="text-xs text-slate-400 truncate">{log.fileName}</p>
                        <p className="text-xs text-slate-300 mt-0.5">{formatDate(log.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Shared links summary */}
          <Card className="mt-4">
            <h3 className="font-semibold text-[#0F172A] mb-3 text-sm">Link Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Active links</span>
                <span className="text-sm font-bold text-green-600">{activeLinks.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Expired links</span>
                <span className="text-sm font-bold text-red-500">{expiredLinks.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Total links</span>
                <span className="text-sm font-bold text-[#0F172A]">{links.length}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${links.length > 0 ? (activeLinks.length / links.length) * 100 : 0}%`, background: 'linear-gradient(90deg, #C9A227, #E4B93A)' }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
