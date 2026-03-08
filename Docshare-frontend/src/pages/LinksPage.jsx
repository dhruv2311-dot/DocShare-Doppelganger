import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, RotateCcw, Clock, Eye, Download, MessageSquare, CheckCircle, Search, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader, Badge, Card, EmptyState } from '../components/ui/UIComponents';
import { formatDate, isExpired } from '../data/mockData';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PERM_ICONS = { view: Eye, download: Download, comment: MessageSquare };

export default function LinksPage() {
  const { user } = useAuth();
  const { links, revokeLink, addAuditLog } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  const myLinks = user?.role === 'Administrator'
    ? links
    : links.filter(l => l.createdBy === user?.name);

  const displayLinks = myLinks
    .filter(l => l.fileName.toLowerCase().includes(search.toLowerCase()))
    .filter(l => {
      if (statusFilter === 'active') return l.status === 'active' && !isExpired(l.expiresAt);
      if (statusFilter === 'expired') return l.status === 'expired' || isExpired(l.expiresAt);
      if (statusFilter === 'revoked') return l.status === 'revoked';
      return true;
    });

  const copyLink = (link) => {
    navigator.clipboard.writeText(link.url);
    setCopiedId(link.id);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = (link) => {
    revokeLink(link.id);
    addAuditLog({ user: user?.name, fileId: link.fileId, fileName: link.fileName, action: 'Link revoked', ip: '127.0.0.1' });
    toast.success('Link revoked successfully');
  };

  const getLinkStatus = (link) => {
    if (link.status === 'revoked') return 'revoked';
    if (isExpired(link.expiresAt)) return 'expired';
    return link.status;
  };

  const activeCount = myLinks.filter(l => l.status === 'active' && !isExpired(l.expiresAt)).length;
  const expiredCount = myLinks.filter(l => l.status === 'expired' || isExpired(l.expiresAt)).length;

  return (
    <div>
      <PageHeader
        title="Shared Links"
        subtitle="Manage all your secure file share links"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Links', value: myLinks.length, color: 'text-[#0F172A]' },
          { label: 'Active', value: activeCount, color: 'text-green-600' },
          { label: 'Expired', value: expiredCount, color: 'text-red-500' },
        ].map(s => (
          <Card key={s.label} className="text-center py-4">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
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
              placeholder="Search by file name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none text-[#0F172A] placeholder-slate-400 w-full"
            />
          </div>
          <div className="flex gap-1 bg-gray-100/70 rounded-xl p-1 border border-gray-200/50">
            {['all', 'active', 'expired', 'revoked'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 capitalize ${
                  statusFilter === s ? 'bg-white shadow-sm text-[#0F172A]' : 'text-slate-500 hover:text-[#0F172A]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Link list */}
        {displayLinks.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {displayLinks.map((link, i) => {
              const PermIcon = PERM_ICONS[link.permission] || Eye;
              const status = getLinkStatus(link);
              const expired = status === 'expired';
              const revoked = status === 'revoked';
              const disabled = expired || revoked;

              return (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`px-5 py-4 hover:bg-gray-50 transition-colors ${disabled ? 'opacity-60' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Icon and info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${disabled ? 'bg-gray-100' : 'bg-amber-50'}`}>
                        <PermIcon className={`w-5 h-5 ${disabled ? 'text-slate-300' : 'text-[#C9A227]'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-[#0F172A] truncate">{link.fileName}</p>
                          <Badge variant={status}>{status}</Badge>
                          <Badge variant={link.permission}>{link.permission}</Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono truncate">{link.url}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {expired ? 'Expired' : `Expires ${formatDate(link.expiresAt)}`}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {link.views} views</span>
                          <span>by {link.createdBy}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => !disabled && copyLink(link)}
                        disabled={disabled}
                        className={`p-2 rounded-lg transition-all ${disabled ? 'text-gray-300 cursor-not-allowed' : 'text-slate-400 hover:text-[#C9A227] hover:bg-amber-50'}`}
                        title="Copy link"
                      >
                        {copiedId === link.id ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => !disabled && window.open(link.url, '_blank')}
                        disabled={disabled}
                        className={`p-2 rounded-lg transition-all ${disabled ? 'text-gray-300 cursor-not-allowed' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                        title="Open link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      {!revoked && user?.role !== 'Client' && (
                        <button
                          onClick={() => handleRevoke(link)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Revoke link"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Share2}
            title="No links found"
            description="Generate a secure link by uploading a file."
          />
        )}
      </Card>
    </div>
  );
}
