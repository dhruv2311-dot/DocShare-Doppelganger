import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { InputField, Button } from '../components/ui/UIComponents';

export default function LoginPage() {
  const { login, verifyMfa, mfaPending, cancelMfa, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', otp: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsSubmitting(true);
    try {
      const result = await login(form.email, form.password);
      if (!result.mfaRequired) {
        toast.success('Welcome back! Logged in successfully.');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMfa = async (e) => {
    e.preventDefault();
    if (!form.otp || form.otp.length !== 6) { setErrors({ otp: 'Enter the 6-digit OTP' }); return; }
    setIsSubmitting(true);
    try {
      await verifyMfa(form.otp);
      toast.success('MFA verified! Welcome back.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const DEMO_CREDS = [
    { label: 'Admin', email: 'admin@docshare.com', password: 'admin123' },
    { label: 'Partner', email: 'partner@docshare.com', password: 'partner123' },
    { label: 'Client', email: 'client@docshare.com', password: 'client123' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-hero-gradient relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-[#C9A227]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/3 w-60 h-60 bg-blue-500/3 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C9A227, #E4B93A)' }}>
              <Lock className="w-6 h-6 text-[#0F172A]" />
            </div>
            <span className="text-white text-2xl font-bold font-poppins">DocShare</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 font-poppins">Secure Legal Document Sharing</h2>
          <p className="text-slate-300 text-base leading-relaxed max-w-sm">
            Exchange sensitive legal files with enterprise-grade encryption, expiring links, and complete audit trails.
          </p>
          <div className="mt-10 space-y-4">
            {[
              { icon: Shield, text: 'AES-256 Encryption' },
              { icon: Lock, text: 'Multi-Factor Authentication' },
              { icon: Shield, text: 'Full Audit Logging' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.04] rounded-xl px-4 py-3 backdrop-blur-sm">
                <item.icon className="w-5 h-5 text-[#C9A227]" />
                <span className="text-white text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0F172A] text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="flex items-center gap-2 mb-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C9A227, #E4B93A)' }}>
              <Lock className="w-4 h-4 text-[#0F172A]" />
            </div>
            <span className="text-[#0F172A] font-bold text-lg font-poppins">DocShare</span>
          </div>

          {!mfaPending ? (
            <>
              <h1 className="text-2xl font-bold text-[#0F172A] font-poppins">Welcome back</h1>
              <p className="text-slate-500 text-sm mt-1 mb-8">Sign in to your DocShare account</p>

              {/* Demo creds */}
              <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 mb-6">
                <p className="text-amber-800 text-xs font-semibold mb-2.5">🔑 Demo Credentials</p>
                <div className="grid grid-cols-3 gap-2">
                  {DEMO_CREDS.map(c => (
                    <button
                      key={c.label}
                      onClick={() => setForm(f => ({ ...f, email: c.email, password: c.password }))}
                      className="text-xs bg-white border border-amber-200 text-amber-800 rounded-lg px-2 py-1.5 hover:bg-amber-100 transition-colors font-medium"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <InputField
                  label="Email Address"
                  id="email"
                  type="email"
                  placeholder="you@lawfirm.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  error={errors.email}
                />
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      className={`input-field pr-10 ${errors.password ? 'border-red-400' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.remember}
                      onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-[#C9A227] focus:ring-[#C9A227]"
                    />
                    <span className="text-sm text-slate-600">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-[#C9A227] hover:underline font-medium">Forgot password?</a>
                </div>
                <Button type="submit" loading={isSubmitting} className="w-full py-3 text-base">
                  Sign In Securely
                </Button>
              </form>
              <p className="text-center text-sm text-slate-500 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#C9A227] hover:underline font-medium">Create one</Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[#0F172A] font-poppins">Two-Factor Authentication</h1>
              <p className="text-slate-500 text-sm mt-1 mb-8">Enter the 6-digit code from your authenticator app</p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-blue-800 text-xs">Demo OTP: <strong>123456</strong></p>
              </div>
              <form onSubmit={handleMfa} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">OTP Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={form.otp}
                    onChange={e => setForm(f => ({ ...f, otp: e.target.value.replace(/\D/g, '') }))}
                    className={`input-field text-center text-2xl tracking-[0.5em] font-mono ${errors.otp ? 'border-red-400' : ''}`}
                  />
                  {errors.otp && <p className="mt-1 text-xs text-red-500">{errors.otp}</p>}
                </div>
                <Button type="submit" loading={isSubmitting} className="w-full py-3 text-base">
                  Verify & Continue
                </Button>
                <button type="button" onClick={cancelMfa} className="w-full text-sm text-slate-500 hover:text-[#0F172A] transition-colors">
                  ← Back to login
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
