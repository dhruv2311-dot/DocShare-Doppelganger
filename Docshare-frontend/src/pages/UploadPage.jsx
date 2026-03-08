import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, Shield, Clock, Eye, Download, MessageSquare, Copy, CheckCircle, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Button, Card, PageHeader, Badge } from '../components/ui/UIComponents';
import { formatFileSize } from '../data/mockData';
import toast from 'react-hot-toast';

const PERMISSIONS = [
  { id: 'view', label: 'View Only', desc: 'Recipient can only view the file', icon: Eye },
  { id: 'download', label: 'Download', desc: 'Recipient can view and download', icon: Download },
  { id: 'comment', label: 'Comment', desc: 'Recipient can view and add comments', icon: MessageSquare },
];
const EXPIRATIONS = [
  { id: '1h', label: '1 Hour', ms: 3600000 },
  { id: '24h', label: '24 Hours', ms: 86400000 },
  { id: '7d', label: '7 Days', ms: 604800000 },
  { id: 'custom', label: 'Custom Date', ms: null },
];

export default function UploadPage() {
  const { user } = useAuth();
  const { addFile, addLink, addAuditLog } = useApp();
  const [droppedFile, setDroppedFile] = useState(null);
  const [permission, setPermission] = useState('view');
  const [expiration, setExpiration] = useState('24h');
  const [customDate, setCustomDate] = useState('');
  const [step, setStep] = useState(1); // 1=upload, 2=config, 3=success
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const ALLOWED_TYPES = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
  };

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      toast.error('File type not supported. Please upload PDF, DOC, DOCX, or images.');
      return;
    }
    if (accepted.length > 0) {
      setDroppedFile(accepted[0]);
      setStep(2);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_TYPES,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  const getExpiryDate = () => {
    if (expiration === 'custom') return new Date(customDate).toISOString();
    const exp = EXPIRATIONS.find(e => e.id === expiration);
    return new Date(Date.now() + exp.ms).toISOString();
  };

  const handleUpload = async () => {
    if (!droppedFile) return;
    setUploading(true);
    // Simulate upload with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 80));
      setUploadProgress(i);
    }
    const ext = droppedFile.name.split('.').pop().toLowerCase();
    const token = Math.random().toString(36).slice(2, 11);
    const newFile = {
      id: 'f' + Date.now(),
      name: droppedFile.name,
      size: droppedFile.size,
      type: ext,
      uploadedBy: user.name,
      uploadedById: user.id,
      uploadedAt: new Date().toISOString(),
      status: 'active',
      sharedWith: [],
      tags: [ext.toUpperCase()],
    };
    const newLink = {
      id: 'l' + Date.now(),
      fileId: newFile.id,
      fileName: newFile.name,
      token,
      url: `${window.location.origin}/shared/${token}`,
      permission,
      expiresAt: getExpiryDate(),
      createdBy: user.name,
      status: 'active',
      views: 0,
    };
    addFile(newFile);
    addLink(newLink);
    addAuditLog({ user: user.name, fileId: newFile.id, fileName: newFile.name, action: 'File uploaded', ip: '127.0.0.1' });
    setGeneratedLink(newLink);
    setStep(3);
    setUploading(false);
    toast.success('File uploaded and secure link generated!');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink.url);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setDroppedFile(null);
    setStep(1);
    setUploadProgress(0);
    setGeneratedLink(null);
    setCopied(false);
  };

  const fileExt = droppedFile?.name?.split('.').pop().toLowerCase();

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Upload & Share File"
        subtitle="Upload a document and generate a secure, expiring share link"
      />

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[{ label: 'Upload', n: 1 }, { label: 'Configure', n: 2 }, { label: 'Share', n: 3 }].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step > s.n ? 'bg-green-500 text-white' : step === s.n ? 'bg-[#C9A227] text-[#0F172A]' : 'bg-gray-100 text-gray-400'
            }`}>
              {step > s.n ? '✓' : s.n}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${step === s.n ? 'text-[#0F172A]' : 'text-gray-400'}`}>{s.label}</span>
            {i < 2 && <div className={`h-px w-8 sm:w-16 transition-all ${step > s.n ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Drop zone */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card>
              <div
                {...getRootProps()}
                className={`drop-zone rounded-2xl p-14 text-center cursor-pointer ${isDragActive ? 'active' : ''}`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-300 ${isDragActive ? 'bg-[#C9A227]/15 scale-110' : 'bg-gray-100'}`}>
                    <Upload className={`w-10 h-10 transition-colors ${isDragActive ? 'text-[#C9A227]' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className="text-[#0F172A] font-semibold text-lg">{isDragActive ? 'Drop your file here' : 'Drag & drop your document'}</p>
                    <p className="text-slate-500 text-sm mt-1">or click to browse your computer</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {['PDF', 'DOC', 'DOCX', 'PNG', 'JPG'].map(t => (
                      <span key={t} className="px-3 py-1 bg-gray-100 text-slate-600 text-xs rounded-full font-medium border border-gray-200/50">{t}</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">Maximum file size: 50 MB</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && droppedFile && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            {/* Selected file info */}
            <Card>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl">
                  {fileExt === 'pdf' ? '📄' : ['doc', 'docx'].includes(fileExt) ? '📝' : '🖼️'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0F172A] truncate">{droppedFile.name}</p>
                  <p className="text-sm text-slate-500">{formatFileSize(droppedFile.size)} • {droppedFile.type || 'Document'}</p>
                </div>
                <button onClick={reset} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </Card>

            {/* Permission settings */}
            <Card>
              <h3 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#C9A227]" /> Permission Settings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PERMISSIONS.map(p => (
                  <label
                    key={p.id}
                    className={`flex flex-col gap-2 p-4 rounded-xl border cursor-pointer transition-all ${
                      permission === p.id ? 'border-[#C9A227] bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input type="radio" name="permission" value={p.id} checked={permission === p.id} onChange={e => setPermission(e.target.value)} className="sr-only" />
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${permission === p.id ? 'bg-[#C9A227]/20' : 'bg-gray-100'}`}>
                      <p.icon className={`w-5 h-5 ${permission === p.id ? 'text-[#C9A227]' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">{p.label}</p>
                      <p className="text-xs text-slate-500">{p.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Card>

            {/* Link expiration */}
            <Card>
              <h3 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C9A227]" /> Link Expiration
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {EXPIRATIONS.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setExpiration(e.id)}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      expiration === e.id ? 'border-[#C9A227] bg-amber-50 text-[#0F172A]' : 'border-gray-200 text-slate-600 hover:border-gray-300'
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
              {expiration === 'custom' && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <input
                    type="datetime-local"
                    value={customDate}
                    onChange={e => setCustomDate(e.target.value)}
                    className="input-field flex-1"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              )}
            </Card>

            {uploading && (
              <Card>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Uploading & encrypting...</span>
                    <span className="font-semibold text-[#0F172A]">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full"
                      style={{ background: 'linear-gradient(90deg, #C9A227, #E4B93A)' }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">Applying AES-256 encryption...</p>
                </div>
              </Card>
            )}

            <div className="flex gap-3">
              <Button variant="ghost" onClick={reset}>Back</Button>
              <Button icon={Upload} loading={uploading} onClick={handleUpload} className="flex-1">
                Upload & Generate Link
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === 3 && generatedLink && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
            <Card className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5"
              >
                <CheckCircle className="w-10 h-10 text-green-500" />
              </motion.div>
              <h2 className="text-xl font-bold text-[#0F172A] mb-2">Secure Link Generated!</h2>
              <p className="text-slate-500 text-sm">Your file has been uploaded and encrypted. Share the link below.</p>
            </Card>

            <Card>
              <h3 className="font-semibold text-[#0F172A] mb-4">Your Secure Share Link</h3>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
                <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-slate-700 flex-1 truncate font-mono">{generatedLink.url}</span>
                <button onClick={copyLink} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${copied ? 'bg-green-100 text-green-700' : 'bg-[#0F172A] text-white hover:bg-[#1E293B]'}`}>
                  {copied ? <><CheckCircle className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-slate-400">Permission</p>
                  <Badge variant={generatedLink.permission}>{generatedLink.permission}</Badge>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-slate-400">Expires</p>
                  <p className="text-xs font-semibold text-[#0F172A] mt-0.5">{new Date(generatedLink.expiresAt).toLocaleDateString()}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-slate-400">Encryption</p>
                  <p className="text-xs font-semibold text-green-600 mt-0.5">AES-256</p>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={reset} className="flex-1">Upload Another</Button>
              <Button onClick={() => window.open(generatedLink.url, '_blank')} className="flex-1" icon={Eye}>Preview Link</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
