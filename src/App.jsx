import { useState, useMemo, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  FileText,
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Calendar,
  Activity,
  Percent,
  FileCheck,
  Send,
  Printer,
  DollarSign,
  Layers,
  Receipt,
  ChevronRight,
  LogOut,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from './supabase';

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

// ─────────────────────────────────────────
// PDF UTILITY
// ─────────────────────────────────────────

async function downloadElementAsPDF(elementId, filename) {
  const el = document.getElementById(elementId);
  if (!el) return;

  // Temporarily bring into viewport (invisible) so html2canvas can render it
  const wrapper = el.parentElement;
  const prevStyle = wrapper.style.cssText;
  wrapper.style.cssText = 'position:fixed;top:0;left:0;z-index:99999;opacity:0;pointer-events:none;';

  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(img, 'PNG', 0, 0, w, Math.min(h, pdf.internal.pageSize.getHeight()));
    pdf.save(filename);
  } finally {
    wrapper.style.cssText = prevStyle;
  }
}

// ─────────────────────────────────────────
// PRINTABLE QUOTATION (white, hidden)
// ─────────────────────────────────────────

function PrintableQuotation({ q, id, letterhead }) {
  const bgImage = letterhead || '/corex-paper.jpg';
  const col = { qty: 44, desc: 'flex', unit: 130, total: 110 };
  return (
    <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1 }}>
      <div
        id={id}
        style={{
          width: '794px', height: '1123px', position: 'relative',
          backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center',
          fontFamily: 'Arial, sans-serif', boxSizing: 'border-box',
        }}
      >
        {/* Title in gold header */}
        <div style={{ position: 'absolute', top: 0, left: 215, right: 40, height: 152, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#000', letterSpacing: 6, textTransform: 'uppercase', lineHeight: 1 }}>QUOTATION</div>
        </div>

        {/* Body */}
        <div style={{ position: 'absolute', top: 168, left: 58, right: 58, bottom: 118 }}>

          {/* Meta row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Quotation To</div>
            <div style={{ fontSize: 10, color: '#888' }}>DATE : {q.date}</div>
            <div style={{ fontSize: 10, color: '#888' }}>NO : {q.quoteNo}</div>
          </div>

          {/* Client */}
          <div style={{ fontSize: 19, fontWeight: 900, color: '#000', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{q.client}</div>
          <div style={{ height: 1, background: '#d4b96a', margin: '10px 0 18px' }} />

          {/* Table header */}
          <div style={{ display: 'flex', background: '#1a1a1a', padding: '9px 0' }}>
            <div style={{ width: col.qty, paddingLeft: 10, fontSize: 9, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>QTY</div>
            <div style={{ flex: 1, paddingLeft: 10, fontSize: 9, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>Scope of Work</div>
            <div style={{ width: col.unit, textAlign: 'right', paddingRight: 10, fontSize: 9, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>Unit Price</div>
            <div style={{ width: col.total, textAlign: 'right', paddingRight: 10, fontSize: 9, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>Total</div>
          </div>

          {/* Line item */}
          <div style={{ display: 'flex', alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid #eee', background: '#fff' }}>
            <div style={{ width: col.qty, paddingLeft: 10, fontSize: 12, color: '#555' }}>1</div>
            <div style={{ flex: 1, paddingLeft: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#c9a24a', marginBottom: 5 }}>Professional Services</div>
              <div style={{ fontSize: 11, color: '#555', lineHeight: 1.65 }}>{q.details}</div>
            </div>
            <div style={{ width: col.unit, textAlign: 'right', paddingRight: 10, fontSize: 12, fontWeight: 600, color: '#333', paddingTop: 2 }}>{fmt(q.amount)}</div>
            <div style={{ width: col.total, textAlign: 'right', paddingRight: 10, fontSize: 12, fontWeight: 600, color: '#333', paddingTop: 2 }}>{fmt(q.amount)}</div>
          </div>

          {/* Totals + thank you */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 36 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#333', fontStyle: 'italic', marginBottom: 6 }}>Thank you for your business</div>
              <div style={{ fontSize: 10, color: '#aaa' }}>Valid for 30 days from date of issue.</div>
            </div>
            <div style={{ minWidth: 250 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f0e6cc', padding: '8px 14px', marginBottom: 2 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 2 }}>Sub Total</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>{fmt(q.amount)}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#c9a24a', padding: '11px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: '#000', textTransform: 'uppercase', letterSpacing: 2 }}>Total Due</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#000' }}>{fmt(q.amount)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// PRINTABLE INVOICE (white, hidden)
// ─────────────────────────────────────────

function PrintableInvoice({ inv, id, letterhead }) {
  const bgImage = letterhead || '/corex-paper.jpg';
  const col = { qty: 44, unit: 130, total: 110 };
  return (
    <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1 }}>
      <div
        id={id}
        style={{
          width: '794px', height: '1123px', position: 'relative',
          backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center',
          fontFamily: 'Arial, sans-serif', boxSizing: 'border-box',
        }}
      >
        {/* Title in gold header */}
        <div style={{ position: 'absolute', top: 0, left: 215, right: 40, height: 152, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#000', letterSpacing: 6, textTransform: 'uppercase', lineHeight: 1 }}>INVOICE</div>
        </div>

        {/* Body */}
        <div style={{ position: 'absolute', top: 168, left: 58, right: 58, bottom: 118 }}>
          {/* Meta row */}
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: '#888' }}>DATE : {inv.dueDate}</div>
            <div style={{ fontSize: 10, color: '#888' }}>NO : {inv.invoiceNo}</div>
          </div>

          {/* Invoice To */}
          <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Invoice To</div>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#000', letterSpacing: 0.5, marginBottom: 4 }}>{inv.client}</div>
          <div style={{ height: 1, background: '#d4b96a', margin: '10px 0 18px' }} />

          {/* Table header */}
          <div style={{ display: 'flex', background: '#1a1a1a', padding: '9px 0' }}>
            <div style={{ width: col.qty, paddingLeft: 10, fontSize: 9, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>QTY</div>
            <div style={{ flex: 1, paddingLeft: 10, fontSize: 9, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>Item Description</div>
            <div style={{ width: col.unit, textAlign: 'right', paddingRight: 10, fontSize: 9, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>Unit Price</div>
            <div style={{ width: col.total, textAlign: 'right', paddingRight: 10, fontSize: 9, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>Total</div>
          </div>

          {/* Line item */}
          <div style={{ display: 'flex', alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid #eee', background: '#fff' }}>
            <div style={{ width: col.qty, paddingLeft: 10, fontSize: 12, color: '#555' }}>1</div>
            <div style={{ flex: 1, paddingLeft: 10, textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#c9a24a', marginBottom: 4, textAlign: 'left' }}>
                {inv.service === 'Custom Software' ? inv.softwareName || inv.project : inv.service || inv.project}
              </div>
              <div style={{ fontSize: 11, color: '#555', lineHeight: 1.6, textAlign: 'left' }}>
                {inv.description || `Professional services rendered for ${inv.client}`}
              </div>
            </div>
            <div style={{ width: col.unit, textAlign: 'right', paddingRight: 10, fontSize: 12, fontWeight: 600, color: '#333', paddingTop: 2 }}>{fmt(inv.amount)}</div>
            <div style={{ width: col.total, textAlign: 'right', paddingRight: 10, fontSize: 12, fontWeight: 600, color: '#333', paddingTop: 2 }}>{fmt(inv.amount)}</div>
          </div>

          {/* Totals + thank you */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 36 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#333', fontStyle: 'italic', marginBottom: 10 }}>Thank you for your business</div>
              <div style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, color: '#aaa', whiteSpace: 'nowrap' }}>Payment Status :</span>
                <span style={{
                  display: 'inline-block',
                  fontSize: 9, fontWeight: 800,
                  color: inv.status === 'paid' ? '#166534' : '#854d0e',
                  background: inv.status === 'paid' ? '#dcfce7' : '#fef3c7',
                  textTransform: 'uppercase', letterSpacing: 2,
                  padding: '3px 10px', borderRadius: 3, whiteSpace: 'nowrap',
                }}>{inv.status}</span>
              </div>
            </div>
            <div style={{ minWidth: 250 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f0e6cc', padding: '8px 14px', marginBottom: 2 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 2 }}>Sub Total</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>{fmt(inv.amount)}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#c9a24a', padding: '11px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: '#000', textTransform: 'uppercase', letterSpacing: 2 }}>Total Due</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#000' }}>{fmt(inv.amount)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// SUPABASE ROW → JS OBJECT MAPPERS
// ─────────────────────────────────────────

const mapProject = (r) => ({ id: r.id, name: r.name, client: r.client, budget: r.budget, deadline: r.deadline, status: r.status, websiteUrl: r.website_url, logoImage: r.logo_image });
const mapInvoice = (r) => ({ id: r.id, invoiceNo: r.invoice_no, client: r.client, project: r.project, service: r.service, softwareName: r.software_name, description: r.description, amount: r.amount, dueDate: r.due_date, status: r.status });
const mapExpense = (r) => ({ id: r.id, description: r.description, amount: r.amount, category: r.category, date: r.date });
const mapQuotation = (r) => ({ id: r.id, quoteNo: r.quote_no, client: r.client, details: r.details, amount: r.amount, date: r.date });
const mapActivity = (r) => ({ id: r.id, action: r.action, time: r.time, type: r.type });

// ─────────────────────────────────────────
// SHARED UI PRIMITIVES
// ─────────────────────────────────────────

function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-base tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[#1a1a1a] transition-all"
          >
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FieldInput({ label, type = 'text', value, onChange, placeholder, required, min }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-[#666] tracking-[0.15em] uppercase font-semibold block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        className="w-full bg-[#0D0D0D] border border-[#232323] rounded-xl px-4 py-3 text-sm text-white placeholder-[#3a3a3a] focus:outline-none focus:border-[#c9a24a]/40 focus:bg-[#0F0F0F] transition-all duration-200"
      />
    </div>
  );
}

function FieldSelect({ label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-[#666] tracking-[0.15em] uppercase font-semibold block">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-[#0D0D0D] border border-[#232323] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c9a24a]/40 transition-all duration-200 appearance-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function FieldTextarea({ label, value, onChange, placeholder, required, rows = 3 }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-[#666] tracking-[0.15em] uppercase font-semibold block">
        {label}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full bg-[#0D0D0D] border border-[#232323] rounded-xl px-4 py-3 text-sm text-white placeholder-[#3a3a3a] focus:outline-none focus:border-[#c9a24a]/40 focus:bg-[#0F0F0F] transition-all duration-200 resize-none"
      />
    </div>
  );
}

function GoldBtn({ children, onClick, type = 'button', variant = 'solid', size = 'md', className = '', disabled = false }) {
  const base =
    'inline-flex items-center justify-center gap-1.5 font-medium tracking-wide transition-all duration-200 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  const sz = { sm: 'px-3.5 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-6 py-3 text-sm' };
  const v = {
    solid: 'bg-[#c9a24a] hover:bg-[#b8923f] active:bg-[#9e7e35] text-black',
    outline: 'border border-[#c9a24a]/50 text-[#c9a24a] hover:bg-[#c9a24a]/8 hover:border-[#c9a24a]',
    ghost: 'text-[#c9a24a] hover:text-[#9e7e35] hover:bg-[#c9a24a]/5',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sz[size]} ${v[variant]} ${className}`}>
      {children}
    </button>
  );
}

function CancelBtn({ onClick, children = 'Cancel' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 py-2.5 border border-[#222] rounded-xl text-[#555] text-sm hover:text-[#888] hover:border-[#333] transition-all duration-200"
    >
      {children}
    </button>
  );
}

function Pill({ status }) {
  const map = {
    ongoing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span
      className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full border font-semibold tracking-wide capitalize ${
        map[status] ?? map.pending
      }`}
    >
      {status}
    </span>
  );
}

function SectionTitle({ title, sub, action }) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        <h2 className="text-white text-xl font-semibold tracking-tight">{title}</h2>
        {sub && <p className="text-[#555] text-sm mt-1">{sub}</p>}
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  );
}

function Hairline({ className = '' }) {
  return <div className={`border-t border-[#1c1c1c] ${className}`} />;
}

// ─────────────────────────────────────────
// ACTIVITY ICON
// ─────────────────────────────────────────

function ActivityDot({ type }) {
  const map = {
    income: { Icon: ArrowUpRight, ring: 'bg-emerald-500/10', text: 'text-emerald-400' },
    expense: { Icon: ArrowDownRight, ring: 'bg-red-500/10', text: 'text-red-400' },
    project: { Icon: Briefcase, ring: 'bg-blue-500/10', text: 'text-blue-400' },
    document: { Icon: FileText, ring: 'bg-[#c9a24a]/10', text: 'text-[#c9a24a]' },
  };
  const { Icon, ring, text } = map[type] ?? map.project;
  return (
    <span className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center ${ring}`}>
      <Icon size={12} className={text} />
    </span>
  );
}

// ─────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────

function StatCard({ label, value, icon: Icon, trend, trendNote }) {
  const positive = trend == null || trend >= 0;
  return (
    <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 hover:border-[#c9a24a]/18 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <p className="text-[10px] text-[#555] tracking-[0.18em] uppercase font-semibold leading-none">
          {label}
        </p>
        <span className="w-8 h-8 bg-[#c9a24a]/8 rounded-xl flex items-center justify-center group-hover:bg-[#c9a24a]/14 transition-colors">
          <Icon size={14} className="text-[#c9a24a]" />
        </span>
      </div>
      <p className="text-white text-2xl font-bold tracking-tight mb-2 leading-none">{value}</p>
      {trend != null && (
        <div
          className={`flex items-center gap-1 text-[11px] font-semibold ${
            positive ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          <span>
            {positive ? '+' : ''}
            {trend.toFixed(1)}% {trendNote}
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// LOGIN SCREEN
// ─────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    // Admin login — hardcoded credentials
    if (username === 'COREX_ADMIN' && password === 'COREX3223!') {
      localStorage.setItem('corex_auth', JSON.stringify({ role: 'admin', expiry: Date.now() + THIRTY_DAYS }));
      onLogin('admin');
      setLoading(false);
      return;
    }

    // Partner login via Supabase (email + password set up in Supabase Auth dashboard)
    try {
      const { data, error: sbErr } = await supabase.auth.signInWithPassword({
        email: username,
        password,
      });
      if (sbErr) throw sbErr;
      if (data?.user) {
        localStorage.setItem('corex_auth', JSON.stringify({ role: 'partner', expiry: Date.now() + THIRTY_DAYS }));
        onLogin('partner');
        setLoading(false);
        return;
      }
    } catch {
      // fall through to generic error
    }

    setError('Invalid username or password. Please try again.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 mb-5 flex items-center justify-center">
            <img
              src="/corex-logo.png"
              alt="Corex"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextSibling.style.display = 'flex';
              }}
            />
            <div
              className="w-24 h-24 bg-[#c9a24a] rounded-2xl items-center justify-center hidden"
              style={{ display: 'none' }}
            >
              <span className="text-black text-4xl font-black leading-none">C</span>
            </div>
          </div>
          <h1 className="text-white text-3xl font-black tracking-[0.12em]">COREX</h1>
          <p className="text-[#3a3a3a] text-xs mt-1.5 tracking-widest uppercase font-medium">
            Admin Dashboard
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-[#222] rounded-2xl p-7 shadow-2xl shadow-black/40">
          <h2 className="text-white font-semibold text-base mb-1 tracking-tight">Sign in</h2>
          <p className="text-[#444] text-xs mb-6 leading-relaxed">
            Enter your credentials to access the dashboard
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldInput
              label="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="COREX_ADMIN or partner@email.com"
              required
            />

            {/* Password with show/hide */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-[#666] tracking-[0.15em] uppercase font-semibold block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full bg-[#0D0D0D] border border-[#232323] rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-[#3a3a3a] focus:outline-none focus:border-[#c9a24a]/40 focus:bg-[#0F0F0F] transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <GoldBtn type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </GoldBtn>
          </form>
        </div>

        <p className="text-center text-[#2a2a2a] text-[10px] mt-6 tracking-wide font-medium">
          © 2026 Corex Agency · Secure Admin Portal
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// HOME TAB
// ─────────────────────────────────────────

function HomeTab({ projects, invoices, expenses, activityLog }) {
  const paidIncome = useMemo(
    () => invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0),
    [invoices],
  );
  const totalExpenses = useMemo(
    () => expenses.reduce((s, e) => s + e.amount, 0),
    [expenses],
  );
  const netProfit = paidIncome - totalExpenses;
  const profitMargin = paidIncome > 0 ? (netProfit / paidIncome) * 100 : 0;
  const activeCount = projects.filter((p) => p.status === 'ongoing').length;
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-10">
        <span className="text-[10px] text-[#c9a24a] tracking-[0.3em] uppercase font-semibold block mb-2">
          Digital Agency
        </span>
        <h1 className="text-white text-5xl font-black tracking-[-0.02em] leading-none">
          COREX
        </h1>
        <p className="text-[#3a3a3a] text-sm mt-3 font-medium">{today}</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Active Projects"
          value={activeCount}
          icon={Briefcase}
          trend={12.5}
          trendNote="vs last month"
        />
        <StatCard
          label="Monthly Income"
          value={fmt(paidIncome)}
          icon={TrendingUp}
          trend={8.3}
          trendNote="vs last month"
        />
        <StatCard
          label="Monthly Expenses"
          value={fmt(totalExpenses)}
          icon={TrendingDown}
          trend={-3.2}
          trendNote="vs last month"
        />
        <StatCard
          label="Net Profit Margin"
          value={`${profitMargin.toFixed(1)}%`}
          icon={Percent}
          trend={profitMargin}
          trendNote="this period"
        />
      </div>

      {/* Activity Log */}
      <div className="bg-[#161616] border border-[#222] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1c1c1c]">
          <div>
            <h3 className="text-white font-semibold text-sm">Recent Activity</h3>
            <p className="text-[#444] text-xs mt-0.5">Latest events across your workspace</p>
          </div>
          <Activity size={15} className="text-[#c9a24a]" />
        </div>
        <div className="px-6 divide-y divide-[#181818]">
          {activityLog.slice(0, 6).map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3.5">
              <ActivityDot type={item.type} />
              <p className="flex-1 text-[#999] text-sm leading-snug">{item.action}</p>
              <span className="text-[#3a3a3a] text-xs shrink-0 font-medium">{item.time}</span>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-[#1c1c1c]">
          <button className="text-[#444] text-xs hover:text-[#c9a24a] transition-colors flex items-center gap-1 font-medium">
            View all activity <ChevronRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// PROJECTS TAB
// ─────────────────────────────────────────

function ProjectsTab({ projects, setProjects, setActivityLog }) {
  const [filter, setFilter] = useState('ongoing');
  const [modalOpen, setModalOpen] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingProj, setEditingProj] = useState(null);
  const [form, setForm] = useState({ name: '', client: '', budget: '', deadline: '' });

  const visible = projects.filter((p) => p.status === filter);
  const ongoingCount = projects.filter((p) => p.status === 'ongoing').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('projects').insert({
      name: form.name.trim(),
      client: form.client.trim(),
      budget: parseFloat(form.budget),
      deadline: form.deadline,
      status: 'ongoing',
    }).select().single();
    if (error) { console.error(error); return; }
    const proj = mapProject(data);
    setProjects((p) => [proj, ...p]);
    const { data: act } = await supabase.from('activity_log').insert({ action: `New project added: ${proj.name}`, time: 'just now', type: 'project' }).select().single();
    if (act) setActivityLog((a) => [mapActivity(act), ...a]);
    setForm({ name: '', client: '', budget: '', deadline: '' });
    setModalOpen(false);
  };

  const handleDelete = async (id, name) => {
    await supabase.from('projects').delete().eq('id', id);
    setProjects((p) => p.filter((proj) => proj.id !== id));
    const { data: act } = await supabase.from('activity_log').insert({ action: `Project deleted: ${name}`, time: 'just now', type: 'project' }).select().single();
    if (act) setActivityLog((a) => [mapActivity(act), ...a]);
  };

  const openEdit = (proj) => {
    setEditingProj(proj);
    setEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updated = { ...editingProj };
    const { error } = await supabase.from('projects').update({
      name: updated.name,
      client: updated.client,
      budget: parseFloat(updated.budget),
      deadline: updated.deadline,
      status: updated.status,
      website_url: updated.websiteUrl || null,
      logo_image: updated.logoImage || null,
    }).eq('id', updated.id);
    if (error) { console.error(error); return; }
    setProjects((p) => p.map((proj) => (proj.id === updated.id ? updated : proj)));
    const { data: act } = await supabase.from('activity_log').insert({ action: `Project updated: ${updated.name}`, time: 'just now', type: 'project' }).select().single();
    if (act) setActivityLog((a) => [mapActivity(act), ...a]);
    setEditModal(false);
    setEditingProj(null);
    if (updated.status === 'completed') setFilter('completed');
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <SectionTitle
        title="Projects"
        sub={`${ongoingCount} ongoing · ${completedCount} completed`}
        action={
          <GoldBtn size="sm" onClick={() => setModalOpen(true)}>
            <Plus size={13} /> Add Project
          </GoldBtn>
        }
      />

      {/* Filter toggle */}
      <div className="flex bg-[#0F0F0F] border border-[#1e1e1e] rounded-xl p-1 w-fit mb-6">
        {['ongoing', 'completed'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all capitalize ${
              filter === t
                ? 'bg-[#c9a24a] text-black shadow-sm'
                : 'text-[#555] hover:text-[#999]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 bg-[#161616] border border-[#222] rounded-2xl flex items-center justify-center mb-4">
            <Briefcase size={22} className="text-[#333]" />
          </div>
          <p className="text-[#444] text-sm font-medium">No {filter} projects</p>
          <p className="text-[#2e2e2e] text-xs mt-1">
            {filter === 'ongoing' ? 'Add a new project to get started' : 'Completed projects will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((proj) => (
            <div
              key={proj.id}
              className="bg-[#161616] border border-[#222] rounded-2xl p-5 hover:border-[#c9a24a]/20 transition-all duration-300 group flex flex-col"
            >
              <div className="flex items-start justify-between mb-5">
                <Pill status={proj.status} />
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit(proj)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[#333] hover:text-[#c9a24a] hover:bg-[#c9a24a]/10 transition-all"
                    title="Edit project"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id, proj.name)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[#333] hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Delete project"
                  >
                    <Trash2 size={12} />
                  </button>
                  {proj.logoImage ? (
                    <img
                      src={proj.logoImage}
                      alt="logo"
                      className="w-8 h-8 rounded-xl object-contain bg-[#0D0D0D] border border-[#232323]"
                    />
                  ) : (
                    <span className="w-8 h-8 bg-[#c9a24a]/8 rounded-xl flex items-center justify-center group-hover:bg-[#c9a24a]/14 transition-colors">
                      <Briefcase size={13} className="text-[#c9a24a]" />
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-white font-semibold text-sm leading-snug mb-1">{proj.name}</h3>
              <p className="text-[#555] text-xs mb-auto">{proj.client}</p>

              <Hairline className="my-4" />

              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                <div>
                  <p className="text-[#3e3e3e] text-[9px] uppercase tracking-[0.15em] font-semibold mb-1">Budget</p>
                  <p className="text-[#c9a24a] font-bold text-sm">{fmt(proj.budget)}</p>
                </div>
                <div>
                  <p className="text-[#3e3e3e] text-[9px] uppercase tracking-[0.15em] font-semibold mb-1">Deadline</p>
                  <p className="text-[#ccc] text-xs font-medium">{fmtDate(proj.deadline)}</p>
                </div>
              </div>

              {/* Visit website button for completed projects */}
              {proj.status === 'completed' && proj.websiteUrl && (
                <a
                  href={proj.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
                >
                  <ArrowUpRight size={12} />
                  Visit Website
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Project">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldInput
            label="Project Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Brand Identity System"
            required
          />
          <FieldInput
            label="Client Name"
            value={form.client}
            onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))}
            placeholder="Nexus Corp"
            required
          />
          <FieldInput
            label="Budget (INR)"
            type="number"
            value={form.budget}
            onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
            placeholder="15000"
            min="0"
            required
          />
          <FieldInput
            label="Deadline"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
            required
          />
          <div className="flex gap-3 pt-2">
            <CancelBtn onClick={() => setModalOpen(false)} />
            <GoldBtn type="submit" className="flex-1">
              Create Project
            </GoldBtn>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {editingProj && (
        <Modal isOpen={editModal} onClose={() => { setEditModal(false); setEditingProj(null); }} title="Edit Project">
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <FieldInput
              label="Project Name"
              value={editingProj.name}
              onChange={(e) => setEditingProj((p) => ({ ...p, name: e.target.value }))}
              placeholder="Brand Identity System"
              required
            />
            <FieldInput
              label="Client Name"
              value={editingProj.client}
              onChange={(e) => setEditingProj((p) => ({ ...p, client: e.target.value }))}
              placeholder="Nexus Corp"
              required
            />
            <FieldInput
              label="Budget (INR)"
              type="number"
              value={editingProj.budget}
              onChange={(e) => setEditingProj((p) => ({ ...p, budget: e.target.value }))}
              placeholder="15000"
              min="0"
              required
            />
            <FieldInput
              label="Deadline"
              type="date"
              value={editingProj.deadline}
              onChange={(e) => setEditingProj((p) => ({ ...p, deadline: e.target.value }))}
              required
            />
            {/* Status toggle */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-[#666] tracking-[0.15em] uppercase font-semibold block">
                Status
              </label>
              <div className="flex bg-[#0F0F0F] border border-[#1e1e1e] rounded-xl p-1">
                {['ongoing', 'completed'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setEditingProj((p) => ({ ...p, status: s }))}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all capitalize ${
                      editingProj.status === s
                        ? s === 'completed'
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-[#c9a24a] text-black shadow-sm'
                        : 'text-[#555] hover:text-[#999]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra fields when marking completed */}
            {editingProj.status === 'completed' && (
              <div className="space-y-3 border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-4">
                <p className="text-[10px] text-emerald-400 tracking-[0.15em] uppercase font-semibold">
                  Completion Details
                </p>
                <FieldInput
                  label="Website URL"
                  value={editingProj.websiteUrl || ''}
                  onChange={(e) => setEditingProj((p) => ({ ...p, websiteUrl: e.target.value }))}
                  placeholder="https://yourproject.com"
                />
                {/* Logo image upload */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#666] tracking-[0.15em] uppercase font-semibold block">
                    Project Logo
                  </label>
                  <label className="flex items-center gap-3 w-full bg-[#0D0D0D] border border-[#232323] rounded-xl px-4 py-3 cursor-pointer hover:border-emerald-500/40 transition-all">
                    <span className="text-sm text-[#3a3a3a]">
                      {editingProj.logoImage ? '✓ Logo uploaded' : 'Click to upload logo image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) =>
                          setEditingProj((p) => ({ ...p, logoImage: ev.target.result }));
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  {editingProj.logoImage && (
                    <div className="flex items-center gap-3 mt-2">
                      <img
                        src={editingProj.logoImage}
                        alt="Logo preview"
                        className="w-12 h-12 object-contain rounded-lg border border-[#232323] bg-[#0D0D0D]"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingProj((p) => ({ ...p, logoImage: null }))}
                        className="text-[11px] text-[#444] hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <CancelBtn onClick={() => { setEditModal(false); setEditingProj(null); }} />
              <GoldBtn type="submit" className="flex-1">
                Save Changes
              </GoldBtn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// FINANCE TAB
// ─────────────────────────────────────────

function FinanceTab({ invoices, expenses, setExpenses, setActivityLog }) {
  const [expenseModal, setExpenseModal] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', category: 'Operations' });

  const CATEGORIES = ['Operations', 'Software', 'Marketing', 'Equipment', 'Payroll', 'Travel', 'Other'];

  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const totalIncome = useMemo(
    () => paidInvoices.reduce((s, i) => s + i.amount, 0),
    [paidInvoices],
  );
  const totalExpenses = useMemo(
    () => expenses.reduce((s, e) => s + e.amount, 0),
    [expenses],
  );
  const net = totalIncome - totalExpenses;
  const margin = totalIncome > 0 ? (net / totalIncome) * 100 : 0;
  const inProfit = net >= 0;

  const handleDeleteExpense = async (id) => {
    await supabase.from('expenses').delete().eq('id', id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('expenses').insert({
      description: form.description.trim(),
      amount: parseFloat(form.amount),
      category: form.category,
      date: new Date().toISOString().split('T')[0],
    }).select().single();
    if (error) { alert('Supabase error: ' + JSON.stringify(error)); return; }
    const exp = mapExpense(data);
    setExpenses((prev) => [exp, ...prev]);
    const { data: act } = await supabase.from('activity_log').insert({ action: `Expense logged: ${exp.description} — ${fmt(exp.amount)}`, time: 'just now', type: 'expense' }).select().single();
    if (act) setActivityLog((a) => [mapActivity(act), ...a]);
    setForm({ description: '', amount: '', category: 'Operations' });
    setExpenseModal(false);
  };

  const handlePDFDownload = async () => {
    await downloadElementAsPDF('finance-report-pdf', 'Corex-Finance-Report.pdf');
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <SectionTitle
        title="Finance"
        sub="Profit & Loss summary for this period"
      />

      {/* P&L Summary */}
      <div className="bg-[#161616] border border-[#222] rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-2.5 mb-6">
          <span className="w-1 h-4 bg-[#c9a24a] rounded-full block" />
          <span className="text-[10px] text-[#c9a24a] tracking-[0.2em] uppercase font-semibold">
            P&amp;L Summary
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Income */}
          <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-4">
            <p className="text-[9px] text-[#666] uppercase tracking-[0.18em] font-semibold mb-2">
              Total Income
            </p>
            <p className="text-emerald-400 text-2xl font-bold tracking-tight">{fmt(totalIncome)}</p>
            <p className="text-[#444] text-[11px] mt-1.5">
              {paidInvoices.length} paid invoice{paidInvoices.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Expenses */}
          <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-4">
            <p className="text-[9px] text-[#666] uppercase tracking-[0.18em] font-semibold mb-2">
              Total Expenses
            </p>
            <p className="text-red-400 text-2xl font-bold tracking-tight">{fmt(totalExpenses)}</p>
            <p className="text-[#444] text-[11px] mt-1.5">{expenses.length} line items</p>
          </div>

          {/* Net */}
          <div
            className={`rounded-xl p-4 ${
              inProfit
                ? 'bg-[#c9a24a]/5 border border-[#c9a24a]/12'
                : 'bg-red-500/5 border border-red-500/10'
            }`}
          >
            <p className="text-[9px] text-[#666] uppercase tracking-[0.18em] font-semibold mb-2">
              Net {inProfit ? 'Profit' : 'Loss'}
            </p>
            <p
              className={`text-2xl font-bold tracking-tight ${
                inProfit ? 'text-[#c9a24a]' : 'text-red-400'
              }`}
            >
              {inProfit ? '' : '–'}
              {fmt(Math.abs(net))}
            </p>
            <div
              className={`flex items-center gap-1 mt-1.5 text-[11px] font-semibold ${
                inProfit ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {inProfit ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              <span>{Math.abs(margin).toFixed(1)}% margin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Income Section */}
      <div className="bg-[#161616] border border-[#222] rounded-2xl overflow-hidden mb-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c1c1c]">
          <div>
            <h3 className="text-white font-semibold text-sm">Income</h3>
            <p className="text-[#444] text-xs mt-0.5">Auto-synced from paid invoices</p>
          </div>
          <CheckCircle2 size={15} className="text-emerald-400" />
        </div>
        {paidInvoices.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-[#333] text-sm">No paid invoices yet</p>
          </div>
        ) : (
          <div className="px-6 divide-y divide-[#181818]">
            {paidInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-[#bbb] text-sm font-medium">{inv.client}</p>
                  <p className="text-[#3e3e3e] text-xs mt-0.5">
                    {inv.invoiceNo} · {inv.project}
                  </p>
                </div>
                <span className="text-emerald-400 font-semibold text-sm">{fmt(inv.amount)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1c1c1c] bg-[#131313]">
          <span className="text-[#444] text-xs font-semibold uppercase tracking-wide">Subtotal</span>
          <span className="text-emerald-400 font-bold text-sm">{fmt(totalIncome)}</span>
        </div>
      </div>

      {/* Expenses Section */}
      <div className="bg-[#161616] border border-[#222] rounded-2xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c1c1c]">
          <div>
            <h3 className="text-white font-semibold text-sm">Expenses</h3>
            <p className="text-[#444] text-xs mt-0.5">Operational & recurring costs</p>
          </div>
          <GoldBtn variant="outline" size="sm" onClick={() => setExpenseModal(true)}>
            <Plus size={12} /> Add Expense
          </GoldBtn>
        </div>
        {expenses.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-[#333] text-sm">No expenses logged</p>
          </div>
        ) : (
          <div className="px-6 divide-y divide-[#181818]">
            {expenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-[#bbb] text-sm font-medium">{exp.description}</p>
                  <p className="text-[#3e3e3e] text-xs mt-0.5">
                    {exp.category} · {exp.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-red-400 font-semibold text-sm">–{fmt(exp.amount)}</span>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[#333] hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Delete expense"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1c1c1c] bg-[#131313]">
          <span className="text-[#444] text-xs font-semibold uppercase tracking-wide">Subtotal</span>
          <span className="text-red-400 font-bold text-sm">–{fmt(totalExpenses)}</span>
        </div>
      </div>

      {/* Download */}
      <div className="flex justify-end">
        <button
          onClick={handlePDFDownload}
          className="flex items-center gap-2 px-5 py-2.5 border border-[#c9a24a]/25 text-[#c9a24a] text-xs font-semibold rounded-xl hover:bg-[#c9a24a]/6 hover:border-[#c9a24a]/50 transition-all duration-200 tracking-wide"
        >
          <Download size={13} />
          Download PDF Report
        </button>
      </div>

      {/* Hidden Finance Report for PDF */}
      <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1 }}>
        <div
          id="finance-report-pdf"
          style={{
            width: '794px', height: '1123px', position: 'relative',
            backgroundImage: 'url(/corex-paper.jpg)', backgroundSize: 'cover', backgroundPosition: 'center',
            fontFamily: 'Arial, sans-serif', boxSizing: 'border-box',
          }}
        >
          {/* Title in gold header */}
          <div style={{ position: 'absolute', top: 0, left: 215, right: 40, height: 152, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#000', letterSpacing: 6, textTransform: 'uppercase' }}>FINANCE REPORT</div>
            <div style={{ fontSize: 10, color: '#333', marginTop: 5 }}>Generated {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>

          {/* Body */}
          <div style={{ position: 'absolute', top: 168, left: 58, right: 58, bottom: 118 }}>

            {/* P&L Summary boxes */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
              <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ fontSize: 8, color: '#888', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 5 }}>Total Income</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#16a34a' }}>{fmt(totalIncome)}</div>
                <div style={{ fontSize: 10, color: '#aaa', marginTop: 3 }}>{paidInvoices.length} paid invoice{paidInvoices.length !== 1 ? 's' : ''}</div>
              </div>
              <div style={{ flex: 1, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ fontSize: 8, color: '#888', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 5 }}>Total Expenses</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#dc2626' }}>{fmt(totalExpenses)}</div>
                <div style={{ fontSize: 10, color: '#aaa', marginTop: 3 }}>{expenses.length} line item{expenses.length !== 1 ? 's' : ''}</div>
              </div>
              <div style={{ flex: 1, background: net >= 0 ? '#fffbeb' : '#fef2f2', border: `1px solid ${net >= 0 ? '#d4b96a' : '#fecaca'}`, borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ fontSize: 8, color: '#888', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 5 }}>Net {net >= 0 ? 'Profit' : 'Loss'}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: net >= 0 ? '#c9a24a' : '#dc2626' }}>{net < 0 ? '–' : ''}{fmt(Math.abs(net))}</div>
                <div style={{ fontSize: 10, color: '#aaa', marginTop: 3 }}>{Math.abs(margin).toFixed(1)}% margin</div>
              </div>
            </div>

            {/* Income table */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 6 }}>Income — Paid Invoices</div>
              <div style={{ display: 'flex', background: '#1a1a1a', padding: '7px 10px' }}>
                <div style={{ flex: 1, fontSize: 8, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>Invoice</div>
                <div style={{ flex: 2, fontSize: 8, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>Client</div>
                <div style={{ flex: 2, fontSize: 8, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>Project</div>
                <div style={{ width: 90, textAlign: 'right', fontSize: 8, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>Amount</div>
              </div>
              {paidInvoices.length === 0 ? (
                <div style={{ padding: '10px', fontSize: 11, color: '#aaa', borderBottom: '1px solid #eee' }}>No paid invoices</div>
              ) : paidInvoices.map((inv, i) => (
                <div key={inv.id} style={{ display: 'flex', padding: '7px 10px', background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ flex: 1, fontSize: 10, color: '#c9a24a', fontWeight: 600 }}>{inv.invoiceNo}</div>
                  <div style={{ flex: 2, fontSize: 10, color: '#333' }}>{inv.client}</div>
                  <div style={{ flex: 2, fontSize: 10, color: '#555' }}>{inv.project}</div>
                  <div style={{ width: 90, textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#16a34a' }}>{fmt(inv.amount)}</div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '7px 10px', background: '#f0fdf4', borderTop: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#16a34a' }}>Subtotal: {fmt(totalIncome)}</div>
              </div>
            </div>

            {/* Expenses table */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 6 }}>Expenses</div>
              <div style={{ display: 'flex', background: '#1a1a1a', padding: '7px 10px' }}>
                <div style={{ flex: 3, fontSize: 8, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>Description</div>
                <div style={{ flex: 1, fontSize: 8, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>Category</div>
                <div style={{ flex: 1, fontSize: 8, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>Date</div>
                <div style={{ width: 90, textAlign: 'right', fontSize: 8, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>Amount</div>
              </div>
              {expenses.length === 0 ? (
                <div style={{ padding: '10px', fontSize: 11, color: '#aaa', borderBottom: '1px solid #eee' }}>No expenses logged</div>
              ) : expenses.map((exp, i) => (
                <div key={exp.id} style={{ display: 'flex', padding: '7px 10px', background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ flex: 3, fontSize: 10, color: '#333' }}>{exp.description}</div>
                  <div style={{ flex: 1, fontSize: 10, color: '#555' }}>{exp.category}</div>
                  <div style={{ flex: 1, fontSize: 10, color: '#555' }}>{exp.date}</div>
                  <div style={{ width: 90, textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#dc2626' }}>–{fmt(exp.amount)}</div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '7px 10px', background: '#fef2f2', borderTop: '1px solid #fecaca' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#dc2626' }}>Subtotal: –{fmt(totalExpenses)}</div>
              </div>
            </div>

            {/* Net total */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ minWidth: 250 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f0e6cc', padding: '9px 14px', marginBottom: 2 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 2 }}>Total Income</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{fmt(totalIncome)}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f0e6cc', padding: '9px 14px', marginBottom: 2 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 2 }}>Total Expenses</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>–{fmt(totalExpenses)}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#c9a24a', padding: '11px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: '#000', textTransform: 'uppercase', letterSpacing: 2 }}>Net {net >= 0 ? 'Profit' : 'Loss'}</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#000' }}>{net < 0 ? '–' : ''}{fmt(Math.abs(net))}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Modal */}
      <Modal isOpen={expenseModal} onClose={() => setExpenseModal(false)} title="Log Expense">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <FieldInput
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Adobe Creative Cloud"
            required
          />
          <FieldInput
            label="Amount (INR)"
            type="number"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            placeholder="599"
            min="0"
            required
          />
          <FieldSelect
            label="Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            options={CATEGORIES}
          />
          <div className="flex gap-3 pt-2">
            <CancelBtn onClick={() => setExpenseModal(false)} />
            <GoldBtn type="submit" className="flex-1">
              <Receipt size={13} /> Log Expense
            </GoldBtn>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────
// QUOTATION PREVIEW (printable)
// ─────────────────────────────────────────

function QuotationPreview({ q, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      {/* Actions bar */}
      <div className="fixed top-0 inset-x-0 flex items-center justify-between px-6 py-4 bg-[#0B0B0B]/80 backdrop-blur-sm border-b border-[#1a1a1a] no-print z-10">
        <span className="text-[#555] text-xs font-medium tracking-wide uppercase">
          Quotation Preview
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              await downloadElementAsPDF(`pdf-quote-${q.id}`, `${q.quoteNo}.pdf`);
            }}
            className="flex items-center gap-2 text-[#c9a24a] text-xs font-semibold border border-[#c9a24a]/30 px-3 py-1.5 rounded-lg hover:bg-[#c9a24a]/8 transition-all"
          >
            <Download size={12} /> Download PDF
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-[#555] text-xs font-semibold border border-[#333] px-3 py-1.5 rounded-lg hover:bg-[#1a1a1a] transition-all"
          >
            <Printer size={12} /> Print
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[#1a1a1a] transition-all"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="w-full max-w-2xl mt-16 mb-8 bg-[#0D0D0D] border border-[#222] rounded-2xl overflow-hidden print-quote shadow-2xl shadow-black/80">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-[#c9a24a] via-[#c9a24a]/60 to-transparent" />

        <div className="p-10">
          {/* Letterhead */}
          <div className="flex items-start justify-between mb-10">
            <div className="flex items-center gap-3">
              <img
                src="/corex-logo.png"
                alt="Corex"
                className="w-10 h-10 object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div>
                <h1 className="text-[#c9a24a] text-4xl font-black tracking-[0.15em] leading-none">
                  COREX
                </h1>
                <p className="text-[#444] text-xs mt-1.5 tracking-wide">
                  Digital Agency & Creative Studio
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[#888] text-[10px] uppercase tracking-[0.15em] font-semibold mb-1">
                Quotation
              </p>
              <p className="text-[#c9a24a] font-bold text-sm">{q.quoteNo}</p>
              <p className="text-[#444] text-xs mt-1">Issued {q.date}</p>
            </div>
          </div>

          {/* Gold rule */}
          <div className="w-full h-px bg-gradient-to-r from-[#c9a24a] via-[#c9a24a]/20 to-transparent mb-9" />

          {/* Client */}
          <div className="mb-8">
            <p className="text-[9px] text-[#444] uppercase tracking-[0.2em] font-semibold mb-2">
              Prepared For
            </p>
            <p className="text-white text-xl font-semibold">{q.client}</p>
          </div>

          {/* Scope table */}
          <div className="bg-[#141414] border border-[#222] rounded-xl p-6 mb-8">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <p className="text-[9px] text-[#444] uppercase tracking-[0.2em] font-semibold mb-3">
                  Scope of Work
                </p>
                <p className="text-[#aaa] text-sm leading-relaxed">{q.details}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[9px] text-[#444] uppercase tracking-[0.2em] font-semibold mb-3">
                  Amount
                </p>
                <p className="text-[#c9a24a] text-3xl font-black">{fmt(q.amount)}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <Hairline className="mb-6" />
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[#333] text-[11px] mb-1">Valid for 30 days from date of issue.</p>
              <p className="text-[#333] text-[11px]">corex.official.sa@gmail.com</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-[#444] uppercase tracking-[0.2em] font-semibold mb-1">
                Total
              </p>
              <p className="text-[#c9a24a] text-xl font-bold">{fmt(q.amount)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// DOCUMENTS TAB
// ─────────────────────────────────────────

function DocumentsTab({ quotations, setQuotations, invoices, setInvoices, setActivityLog }) {
  const [subTab, setSubTab] = useState('quotations');
  const [quoteModal, setQuoteModal] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [previewQ, setPreviewQ] = useState(null);
  const [qForm, setQForm] = useState({ client: '', details: '', amount: '' });
  const [iForm, setIForm] = useState({ client: '', service: 'Website', softwareName: '', description: '', amount: '', dueDate: '' });

  // Letterhead paper — persisted in localStorage
  const [letterhead, setLetterhead] = useState(() => localStorage.getItem('corex_letterhead') || null);

  const handleLetterheadUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target.result;
      setLetterhead(data);
      localStorage.setItem('corex_letterhead', data);
    };
    reader.readAsDataURL(file);
  };

  const removeLetterhead = () => {
    setLetterhead(null);
    localStorage.removeItem('corex_letterhead');
  };

  const handleAddQuote = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('quotations').insert({
      quote_no: `QT-${String(quotations.length + 1).padStart(3, '0')}`,
      client: qForm.client.trim(),
      details: qForm.details.trim(),
      amount: parseFloat(qForm.amount),
      date: new Date().toISOString().split('T')[0],
    }).select().single();
    if (error) { console.error(error); return; }
    const q = mapQuotation(data);
    setQuotations((prev) => [q, ...prev]);
    const { data: act } = await supabase.from('activity_log').insert({ action: `Quotation ${q.quoteNo} prepared for ${q.client}`, time: 'just now', type: 'document' }).select().single();
    if (act) setActivityLog((a) => [mapActivity(act), ...a]);
    setQForm({ client: '', details: '', amount: '' });
    setQuoteModal(false);
    setPreviewQ(q);
  };

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    const itemName = iForm.service === 'Custom Software' ? iForm.softwareName.trim() : iForm.service;
    const { data, error } = await supabase.from('invoices').insert({
      invoice_no: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      client: iForm.client.trim(),
      project: itemName,
      service: iForm.service,
      software_name: iForm.softwareName.trim() || null,
      description: iForm.description.trim() || null,
      amount: parseFloat(iForm.amount),
      due_date: iForm.dueDate,
      status: 'pending',
    }).select().single();
    if (error) { console.error(error); return; }
    const inv = mapInvoice(data);
    setInvoices((prev) => [inv, ...prev]);
    const { data: act } = await supabase.from('activity_log').insert({ action: `Invoice ${inv.invoiceNo} created for ${inv.client} — ${fmt(inv.amount)}`, time: 'just now', type: 'document' }).select().single();
    if (act) setActivityLog((a) => [mapActivity(act), ...a]);
    setIForm({ client: '', service: 'Website', softwareName: '', description: '', amount: '', dueDate: '' });
    setInvoiceModal(false);
  };

  const handleDeleteQuote = async (id) => {
    await supabase.from('quotations').delete().eq('id', id);
    setQuotations((prev) => prev.filter((q) => q.id !== id));
  };

  const handleDeleteInvoice = async (id) => {
    await supabase.from('invoices').delete().eq('id', id);
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  const handleMarkPaid = async (id) => {
    const inv = invoices.find((i) => i.id === id);
    await supabase.from('invoices').update({ status: 'paid' }).eq('id', id);
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'paid' } : i)));
    if (inv) {
      const { data: act } = await supabase.from('activity_log').insert({ action: `Invoice ${inv.invoiceNo} marked as paid — ${fmt(inv.amount)}`, time: 'just now', type: 'income' }).select().single();
      if (act) setActivityLog((a) => [mapActivity(act), ...a]);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <SectionTitle title="Documents" sub="Quotations & invoices" />

      {/* Letterhead Paper Setting */}
      <div className="bg-[#161616] border border-[#222] rounded-2xl p-4 mb-5 flex items-center gap-4">
        <div className="w-9 h-9 bg-[#c9a24a]/10 rounded-xl flex items-center justify-center shrink-0">
          <FileText size={15} className="text-[#c9a24a]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold">Letterhead Paper</p>
          <p className="text-[#444] text-[11px] mt-0.5">
            {letterhead ? 'Custom paper active — all PDFs will use this background' : 'Upload your branded Corex paper to use as PDF background'}
          </p>
        </div>
        {letterhead ? (
          <div className="flex items-center gap-2 shrink-0">
            <img src={letterhead} alt="Letterhead preview" className="w-8 h-10 object-cover rounded border border-[#333]" />
            <button
              onClick={removeLetterhead}
              className="text-[11px] text-[#444] hover:text-red-400 transition-colors px-2 py-1"
            >
              Remove
            </button>
          </div>
        ) : (
          <label className="shrink-0 cursor-pointer">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#c9a24a]/40 text-[#c9a24a] text-xs font-semibold hover:bg-[#c9a24a]/8 transition-all">
              <Download size={12} /> Upload Paper
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleLetterheadUpload} />
          </label>
        )}
      </div>

      {/* Sub-tab */}
      <div className="flex bg-[#0F0F0F] border border-[#1e1e1e] rounded-xl p-1 w-fit mb-6">
        {[
          ['quotations', 'Quotations'],
          ['invoices', 'Invoices'],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setSubTab(k)}
            className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              subTab === k ? 'bg-[#c9a24a] text-black shadow-sm' : 'text-[#555] hover:text-[#999]'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ── QUOTATIONS ── */}
      {subTab === 'quotations' && (
        <div>
          <div className="flex justify-end mb-4">
            <GoldBtn size="sm" onClick={() => setQuoteModal(true)}>
              <Plus size={13} /> Get Quotation
            </GoldBtn>
          </div>

          {quotations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-14 h-14 bg-[#161616] border border-[#222] rounded-2xl flex items-center justify-center mb-4">
                <FileText size={22} className="text-[#333]" />
              </div>
              <p className="text-[#444] text-sm font-medium">No quotations yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quotations.map((q) => (
                <div
                  key={q.id}
                  className="bg-[#161616] border border-[#222] rounded-2xl p-5 hover:border-[#c9a24a]/18 transition-all duration-300 flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-[#c9a24a]/10 rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={15} className="text-[#c9a24a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[#c9a24a] text-[11px] font-mono font-semibold">
                        {q.quoteNo}
                      </span>
                      <span className="text-[#2e2e2e]">·</span>
                      <span className="text-[#444] text-[11px]">{q.date}</span>
                    </div>
                    <p className="text-white font-semibold text-sm">{q.client}</p>
                    <p className="text-[#444] text-xs mt-0.5 truncate">{q.details}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[#c9a24a] font-bold text-sm">{fmt(q.amount)}</span>
                    <button
                      onClick={() => setPreviewQ(q)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#222] text-[#555] hover:text-[#c9a24a] hover:border-[#c9a24a]/30 transition-all"
                      title="Preview"
                    >
                      <FileCheck size={13} />
                    </button>
                    <button
                      onClick={() => downloadElementAsPDF(`pdf-quote-${q.id}`, `${q.quoteNo}.pdf`)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#222] text-[#555] hover:text-[#c9a24a] hover:border-[#c9a24a]/30 transition-all"
                      title="Download PDF"
                    >
                      <Download size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteQuote(q.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#222] text-[#333] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/8 transition-all"
                      title="Delete quotation"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {/* Hidden printable template for PDF */}
                  <PrintableQuotation q={q} id={`pdf-quote-${q.id}`} letterhead={letterhead} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── INVOICES ── */}
      {subTab === 'invoices' && (
        <div>
          <div className="flex justify-end mb-4">
            <GoldBtn size="sm" onClick={() => setInvoiceModal(true)}>
              <Plus size={13} /> Add Invoice
            </GoldBtn>
          </div>

          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-14 h-14 bg-[#161616] border border-[#222] rounded-2xl flex items-center justify-center mb-4">
                <Receipt size={22} className="text-[#333]" />
              </div>
              <p className="text-[#444] text-sm font-medium">No invoices yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-[#161616] border border-[#222] rounded-2xl p-5 hover:border-[#c9a24a]/18 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#c9a24a] text-[11px] font-mono font-semibold">
                          {inv.invoiceNo}
                        </span>
                        <Pill status={inv.status} />
                      </div>
                      <p className="text-white font-semibold text-sm">{inv.client}</p>
                      <p className="text-[#444] text-xs mt-0.5">{inv.project}</p>
                      <div className="flex items-center gap-1 mt-2 text-[#333] text-[11px]">
                        <Calendar size={10} />
                        <span>Due {fmtDate(inv.dueDate)}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4 shrink-0 flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-bold text-lg">{fmt(inv.amount)}</p>
                        <button
                          onClick={() => downloadElementAsPDF(`pdf-inv-${inv.id}`, `${inv.invoiceNo}.pdf`)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#333] hover:text-[#c9a24a] hover:bg-[#c9a24a]/10 transition-all"
                          title="Download PDF"
                        >
                          <Download size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(inv.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#333] hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete invoice"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {/* Hidden printable template for PDF */}
                      <PrintableInvoice inv={inv} id={`pdf-inv-${inv.id}`} letterhead={letterhead} />
                      {inv.status === 'pending' && (
                        <button
                          onClick={() => handleMarkPaid(inv.id)}
                          className="text-[11px] text-[#c9a24a] border border-[#c9a24a]/30 rounded-lg px-3 py-1 hover:bg-[#c9a24a]/8 transition-all font-semibold"
                        >
                          Mark as Paid
                        </button>
                      )}
                      {inv.status === 'paid' && (
                        <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                          <CheckCircle2 size={11} />
                          <span>Paid</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quotation Modal */}
      <Modal isOpen={quoteModal} onClose={() => setQuoteModal(false)} title="New Quotation">
        <form onSubmit={handleAddQuote} className="space-y-4">
          <FieldInput
            label="Client Name"
            value={qForm.client}
            onChange={(e) => setQForm((f) => ({ ...f, client: e.target.value }))}
            placeholder="Horizon Media"
            required
          />
          <FieldTextarea
            label="Project Details"
            value={qForm.details}
            onChange={(e) => setQForm((f) => ({ ...f, details: e.target.value }))}
            placeholder="Describe the scope of work in detail..."
            required
            rows={4}
          />
          <FieldInput
            label="Amount (INR)"
            type="number"
            value={qForm.amount}
            onChange={(e) => setQForm((f) => ({ ...f, amount: e.target.value }))}
            placeholder="12000"
            min="0"
            required
          />
          <div className="flex gap-3 pt-2">
            <CancelBtn onClick={() => setQuoteModal(false)} />
            <GoldBtn type="submit" className="flex-1">
              <Send size={12} /> Generate Quote
            </GoldBtn>
          </div>
        </form>
      </Modal>

      {/* Invoice Modal */}
      <Modal isOpen={invoiceModal} onClose={() => setInvoiceModal(false)} title="New Invoice">
        <form onSubmit={handleAddInvoice} className="space-y-4">
          <FieldInput
            label="Client Name"
            value={iForm.client}
            onChange={(e) => setIForm((f) => ({ ...f, client: e.target.value }))}
            placeholder="Nexus Corp"
            required
          />

          {/* Service type */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-[#666] tracking-[0.15em] uppercase font-semibold block">
              Service
            </label>
            <div className="flex bg-[#0F0F0F] border border-[#1e1e1e] rounded-xl p-1">
              {['Website', 'Custom Software', 'Edu Tech'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setIForm((f) => ({ ...f, service: s, softwareName: '' }))}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-semibold tracking-wide transition-all ${
                    iForm.service === s
                      ? 'bg-[#c9a24a] text-black shadow-sm'
                      : 'text-[#555] hover:text-[#999]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Software name — only when Custom Software is selected */}
          {iForm.service === 'Custom Software' && (
            <FieldInput
              label="Software Name"
              value={iForm.softwareName}
              onChange={(e) => setIForm((f) => ({ ...f, softwareName: e.target.value }))}
              placeholder="e.g. Inventory Management System"
              required
            />
          )}

          {/* Description */}
          <FieldTextarea
            label="Description"
            value={iForm.description}
            onChange={(e) => setIForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Describe the service delivered..."
            required
            rows={3}
          />

          <FieldInput
            label="Amount (INR)"
            type="number"
            value={iForm.amount}
            onChange={(e) => setIForm((f) => ({ ...f, amount: e.target.value }))}
            placeholder="15000"
            min="0"
            required
          />
          <FieldInput
            label="Due Date"
            type="date"
            value={iForm.dueDate}
            onChange={(e) => setIForm((f) => ({ ...f, dueDate: e.target.value }))}
            required
          />
          <p className="text-[10px] text-[#444] leading-relaxed -mt-1">
            When marked as paid, this invoice will automatically update income in Finance.
          </p>
          <div className="flex gap-3 pt-1">
            <CancelBtn onClick={() => setInvoiceModal(false)} />
            <GoldBtn type="submit" className="flex-1">
              <Receipt size={12} /> Create Invoice
            </GoldBtn>
          </div>
        </form>
      </Modal>

      {/* Quotation Preview */}
      {previewQ && <QuotationPreview q={previewQ} onClose={() => setPreviewQ(null)} />}
    </div>
  );
}

// ─────────────────────────────────────────
// NAVIGATION CONFIG
// ─────────────────────────────────────────

const NAV = [
  { id: 'home', label: 'Home', Icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', Icon: Briefcase },
  { id: 'finance', label: 'Finance', Icon: BarChart3 },
  { id: 'documents', label: 'Documents', Icon: FileText },
];

// ─────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────

function Sidebar({ active, setActive, authRole, onLogout }) {
  return (
    <aside className="hidden lg:flex flex-col w-56 bg-[#0C0C0C] border-r border-[#181818] h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-[#181818]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
            <img
              src="/corex-logo.png"
              alt="Corex"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextSibling.style.display = 'flex';
              }}
            />
            <div
              className="w-8 h-8 bg-[#c9a24a] rounded-xl items-center justify-center shrink-0"
              style={{ display: 'none' }}
            >
              <span className="text-black text-sm font-black leading-none">C</span>
            </div>
          </div>
          <span className="text-white font-black tracking-[0.12em] text-lg leading-none">
            COREX
          </span>
        </div>
        <p className="text-[#333] text-[10px] mt-2 tracking-widest uppercase font-medium">
          {authRole === 'admin' ? 'Admin Dashboard' : 'Partner Access'}
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 group ${
                isActive
                  ? 'bg-[#c9a24a]/10 text-[#c9a24a] border border-[#c9a24a]/15'
                  : 'text-[#444] hover:text-[#888] hover:bg-[#161616] border border-transparent'
              }`}
            >
              <Icon
                size={14}
                className={isActive ? 'text-[#c9a24a]' : 'text-[#333] group-hover:text-[#666]'}
              />
              {label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#c9a24a] shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-5 border-t border-[#181818] space-y-3">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#444] hover:text-red-400 hover:bg-red-500/8 border border-transparent transition-all duration-200 group"
        >
          <LogOut size={13} className="group-hover:text-red-400 transition-colors" />
          Sign Out
        </button>
        <p className="text-[#2a2a2a] text-[10px] font-medium px-2">© 2026 Corex Agency</p>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────
// BOTTOM NAV
// ─────────────────────────────────────────

function BottomNav({ active, setActive }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0A0A0A]/96 backdrop-blur-2xl border-t border-[#181818]">
      <div className="flex items-stretch justify-around px-2 pb-safe">
        {NAV.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex flex-col items-center gap-1 px-4 py-3 transition-all duration-200 ${
                isActive ? 'text-[#c9a24a]' : 'text-[#3a3a3a] hover:text-[#666]'
              }`}
            >
              <Icon size={17} />
              <span className="text-[9px] font-semibold tracking-[0.08em] uppercase">{label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#c9a24a]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────

export default function App() {
  const [authRole, setAuthRole] = useState(() => {
    try {
      const stored = localStorage.getItem('corex_auth');
      if (!stored) return null;
      const { role, expiry } = JSON.parse(stored);
      if (Date.now() > expiry) { localStorage.removeItem('corex_auth'); return null; }
      return role;
    } catch { return null; }
  });
  const [dbLoading, setDbLoading] = useState(false);
  const [active, setActive] = useState('home');
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    document.title = 'Corex Admin Dashboard';
    if (!authRole) return;
    setDbLoading(true);
    Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('expenses').select('*').order('created_at', { ascending: false }),
      supabase.from('quotations').select('*').order('created_at', { ascending: false }),
      supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(50),
    ]).then(([p, i, e, q, a]) => {
      setProjects((p.data ?? []).map(mapProject));
      setInvoices((i.data ?? []).map(mapInvoice));
      setExpenses((e.data ?? []).map(mapExpense));
      setQuotations((q.data ?? []).map(mapQuotation));
      setActivityLog((a.data ?? []).map(mapActivity));
      setDbLoading(false);
    });
  }, [authRole]);

  const handleLogout = async () => {
    localStorage.removeItem('corex_auth');
    await supabase.auth.signOut();
    setAuthRole(null);
  };

  if (!authRole) {
    return <LoginScreen onLogin={setAuthRole} />;
  }

  if (dbLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#c9a24a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#c9a24a] text-xs tracking-widest uppercase font-semibold">Loading…</p>
        </div>
      </div>
    );
  }

  const shared = {
    projects, setProjects,
    invoices, setInvoices,
    expenses, setExpenses,
    quotations, setQuotations,
    activityLog, setActivityLog,
  };

  return (
    <div className="flex h-dvh bg-[#0B0B0B] text-white overflow-hidden">
      <Sidebar active={active} setActive={setActive} authRole={authRole} onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto">
        {active === 'home' && <HomeTab {...shared} />}
        {active === 'projects' && <ProjectsTab {...shared} />}
        {active === 'finance' && <FinanceTab {...shared} />}
        {active === 'documents' && <DocumentsTab {...shared} />}
        {/* Spacer for mobile bottom nav */}
        <div className="h-24 lg:hidden" />
      </main>

      <BottomNav active={active} setActive={setActive} />
    </div>
  );
}
