import { motion } from 'framer-motion';

export function StatCard({ icon: Icon, label, value, subtext, color = 'gold', delay = 0 }) {
  const colors = {
    gold: 'from-amber-50 to-yellow-50 text-[#C9A227]',
    blue: 'from-blue-50 to-sky-50 text-blue-600',
    green: 'from-green-50 to-emerald-50 text-emerald-600',
    red: 'from-red-50 to-rose-50 text-rose-600',
    purple: 'from-purple-50 to-violet-50 text-purple-600',
  };
  const iconBg = {
    gold: 'bg-amber-100',
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    red: 'bg-red-100',
    purple: 'bg-purple-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-200/80 stat-card hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-[#0F172A] mt-1.5 font-poppins tracking-tight">{value}</p>
          {subtext && <p className="text-xs text-slate-400 mt-1.5">{subtext}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg[color]}`}>
          <Icon className={`w-6 h-6 ${colors[color].split(' ').slice(1).join(' ')}`} />
        </div>
      </div>
    </motion.div>
  );
}

export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
    revoked: 'bg-orange-100 text-orange-700',
    view: 'bg-blue-100 text-blue-700',
    download: 'bg-purple-100 text-purple-700',
    comment: 'bg-teal-100 text-teal-700',
    Administrator: 'bg-purple-100 text-purple-700',
    Partner: 'bg-blue-100 text-blue-700',
    Client: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize tracking-wide ${variants[children] || variants[variant]}`}>
      {children}
    </span>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] font-poppins tracking-tight">{title}</h1>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Button({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', className = '', icon: Icon, loading }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };
  const variants = {
    primary: 'btn-gold',
    secondary: 'bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-sm hover:shadow-md',
    outline: 'border border-gray-200 text-[#0F172A] hover:bg-gray-50 hover:border-gray-300',
    ghost: 'text-slate-600 hover:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function InputField({ label, id, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}</label>}
      <input id={id} className={`input-field ${error ? 'border-red-400 focus:border-red-400' : ''}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Card({ children, className = '', padding = true }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200/80 ${padding ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
        <Icon className="w-9 h-9 text-slate-300" />
      </div>
      <h3 className="text-base font-semibold text-[#0F172A] mb-2 font-poppins">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-4">{description}</p>
      {action}
    </div>
  );
}

export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-[3px]', lg: 'w-12 h-12 border-4' };
  return <div className={`${sizes[size]} border-[#C9A227] border-t-transparent rounded-full animate-spin`} />;
}
