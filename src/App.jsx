import { useEffect, useMemo, useRef, useState } from 'react'
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'
import { db, hasFirebaseConfig } from './firebase'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleDollarSign,
  Cloud,
  CreditCard,
  ImagePlus,
  LayoutDashboard,
  Menu,
  Pencil,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'

const initialStats = {
  courtFee: 2400000,
  remainingBalance: 1850000,
  guestIncome: 620000,
  extraExpense: 350000,
}

const initialMembers = [
  { id: '1', name: 'Nguyễn Minh Anh', initials: 'MA', color: 'bg-amber-100 text-amber-700', isPaid: true },
  { id: '2', name: 'Trần Quốc Bảo', initials: 'QB', color: 'bg-sky-100 text-sky-700', isPaid: true },
  { id: '3', name: 'Lê Hoàng Nam', initials: 'LN', color: 'bg-violet-100 text-violet-700', isPaid: false },
  { id: '4', name: 'Phạm Ngọc Hà', initials: 'NH', color: 'bg-rose-100 text-rose-700', isPaid: true },
  { id: '5', name: 'Vũ Đức Minh', initials: 'DM', color: 'bg-emerald-100 text-emerald-700', isPaid: true },
  { id: '6', name: 'Đỗ Thùy Linh', initials: 'TL', color: 'bg-orange-100 text-orange-700', isPaid: false },
  { id: '7', name: 'Hoàng Gia Huy', initials: 'GH', color: 'bg-indigo-100 text-indigo-700', isPaid: true },
]

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)

function StatCard({ title, value, icon: Icon, tone, trend, admin, onChange, onSave }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={20} strokeWidth={2.2} /></div>
      <div className="flex-1">
        <p className="stat-title">{title}</p>
        {admin ? (
          <input className="stat-input" type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} onBlur={onSave} />
        ) : (
          <p className="stat-value">{formatCurrency(value)}</p>
        )}
        {trend && <p className="stat-trend"><ArrowUpRight size={13} /> {trend}</p>}
      </div>
      {admin && <Pencil className="text-slate-400" size={15} />}
    </article>
  )
}

function App() {
  const [admin, setAdmin] = useState(false)
  const [stats, setStats] = useState(initialStats)
  const [members, setMembers] = useState(initialMembers)
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState('')
  const [syncMessage, setSyncMessage] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [qrFile, setQrFile] = useState(null)
  const fileInput = useRef(null)

  const paidCount = useMemo(() => members.filter((member) => member.isPaid).length, [members])

  const updateStat = (key, value) => setStats((current) => ({ ...current, [key]: value }))
  const saveStat = async (firestoreKey, stateKey) => {
    if (!admin || !db) return
    try {
      await updateDoc(doc(db, 'ledger_summary', 'current_month'), { [firestoreKey]: stats[stateKey] })
      setSyncMessage('Đã lưu số liệu')
      window.setTimeout(() => setSyncMessage(''), 2200)
    } catch (error) {
      setDataError(`Không thể lưu số liệu: ${error.message}`)
    }
  }

  const toggleMember = async (member) => {
    if (!admin || !db) return
    const nextPaid = !member.isPaid
    setMembers((current) => current.map((item) => item.id === member.id ? { ...item, isPaid: nextPaid } : item))
    try {
      await updateDoc(doc(db, 'members', member.id), { is_paid: nextPaid })
      setSyncMessage('Đã cập nhật trạng thái')
      window.setTimeout(() => setSyncMessage(''), 2200)
    } catch (error) {
      setMembers((current) => current.map((item) => item.id === member.id ? { ...item, isPaid: member.isPaid } : item))
      setDataError(`Không thể cập nhật thành viên: ${error.message}`)
    }
  }

  useEffect(() => {
    let active = true
    const loadData = async () => {
      if (!db) {
        setDataLoading(false)
        return
      }
      try {
        const [summarySnapshot, membersSnapshot] = await Promise.all([
          getDoc(doc(db, 'ledger_summary', 'current_month')),
          getDocs(collection(db, 'members')),
        ])
        if (!active) return
        if (summarySnapshot.exists()) {
          const data = summarySnapshot.data()
          setStats({
            courtFee: Number(data.court_fee ?? 0),
            remainingBalance: Number(data.remaining_balance ?? 0),
            guestIncome: Number(data.guest_income ?? 0),
            extraExpense: Number(data.extra_expense ?? 0),
          })
        }
        if (!membersSnapshot.empty) {
          setMembers(membersSnapshot.docs.map((memberDoc, index) => {
            const data = memberDoc.data()
            const fallback = initialMembers[index % initialMembers.length]
            return {
              id: memberDoc.id,
              name: String(data.name ?? fallback.name),
              initials: String(data.name ?? fallback.name).split(/\s+/).map((part) => part[0]).join('').slice(-2).toUpperCase(),
              color: fallback.color,
              isPaid: Boolean(data.is_paid),
            }
          }))
        }
      } catch (error) {
        if (active) setDataError(`Không thể tải dữ liệu Firebase: ${error.message}`)
      } finally {
        if (active) setDataLoading(false)
      }
    }
    loadData()
    return () => { active = false }
  }, [])

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <a className="brand" href="#top">
            <span className="brand-mark"><CircleDollarSign size={22} /></span>
            <span>Quỹ Cầu Lông <strong>7S</strong></span>
          </a>
          <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
            <a className="active" href="#dashboard" onClick={() => setMenuOpen(false)}><LayoutDashboard size={17} /> Tổng quan</a>
            <a href="#members" onClick={() => setMenuOpen(false)}><Users size={17} /> Thành viên</a>
          </nav>
          <div className="header-actions">
            <span className="sync-status"><span className={`status-dot ${dataLoading ? 'loading-dot' : ''}`} /> {dataLoading ? 'Đang tải' : hasFirebaseConfig ? 'Đã đồng bộ' : 'Dữ liệu mẫu'}</span>
            <button className={`admin-toggle ${admin ? 'enabled' : ''}`} onClick={() => setAdmin(!admin)}>
              <ShieldCheck size={17} /> <span>{admin ? 'Tắt Admin' : 'Chế độ Admin'}</span>
              <span className="toggle-track"><span /></span>
            </button>
            <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Mở menu"><Menu size={21} /></button>
          </div>
        </div>
      </header>

      <main className="container page-content" id="top">
        {dataLoading && <div className="loading-banner"><span className="spinner" /> Đang tải dữ liệu...</div>}
        {!dataLoading && !hasFirebaseConfig && <div className="data-notice"><Cloud size={16} /> Firebase chưa được cấu hình, đang hiển thị dữ liệu mẫu.</div>}
        {dataError && <div className="error-banner"><X size={16} /> {dataError}</div>}
        {syncMessage && <div className="sync-banner"><Check size={16} /> {syncMessage}</div>}
        <section className="hero" id="dashboard">
          <div>
            <p className="eyebrow">THÁNG 11, 2026</p>
            <h1>Tổng quan quỹ</h1>
            <p className="hero-subtitle">Theo dõi tình hình thu chi và đóng quỹ của đội.</p>
          </div>
          <div className="month-pill"><span>Tháng hiện tại</span><ChevronRight size={16} /></div>
        </section>

        {admin && <div className="admin-notice"><ShieldCheck size={18} /><span><strong>Đang ở chế độ Admin.</strong> Bạn có thể chỉnh sửa số liệu và trạng thái thành viên.</span></div>}

        <section className="stats-grid" aria-label="Chỉ số quỹ">
          <StatCard title="Tiền sân" value={stats.courtFee} icon={CreditCard} tone="blue" trend="+12% so với tháng trước" admin={admin} onChange={(value) => updateStat('courtFee', value)} onSave={() => saveStat('court_fee', 'courtFee')} />
          <StatCard title="Quỹ còn thừa" value={stats.remainingBalance} icon={CircleDollarSign} tone="green" trend="Số dư khả dụng" admin={admin} onChange={(value) => updateStat('remainingBalance', value)} onSave={() => saveStat('remaining_balance', 'remainingBalance')} />
          <StatCard title="Thu giao lưu" value={stats.guestIncome} icon={ArrowDownLeft} tone="purple" trend="3 lượt giao lưu" admin={admin} onChange={(value) => updateStat('guestIncome', value)} onSave={() => saveStat('guest_income', 'guestIncome')} />
          <StatCard title="Phí phát sinh" value={stats.extraExpense} icon={ArrowUpRight} tone="orange" trend="Trong tháng này" admin={admin} onChange={(value) => updateStat('extraExpense', value)} onSave={() => saveStat('extra_expense', 'extraExpense')} />
        </section>

        <div className="content-grid">
          <section className="panel qr-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">THANH TOÁN</p><h2>Quét mã để đóng quỹ</h2></div>
              <span className="secure-label"><ShieldCheck size={14} /> An toàn</span>
            </div>
            <div className="qr-layout">
              <div className="qr-code">
                {qrFile ? <img src={qrFile} alt="Mã QR thanh toán" /> : <div className="qr-placeholder"><div className="qr-corners" /><span>QR<br /><small>7S FUND</small></span></div>}
              </div>
              <div className="qr-details">
                <p className="muted">Ngân hàng</p><p className="detail-value">MB Bank <span className="bank-badge">MB</span></p>
                <p className="muted">Chủ tài khoản</p><p className="detail-value">NGUYEN MINH ANH</p>
                <p className="muted">Nội dung chuyển khoản</p><p className="detail-value">7S + Tên thành viên</p>
              </div>
            </div>
            {admin && <><input ref={fileInput} hidden type="file" accept="image/*" onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) setQrFile(URL.createObjectURL(file))
            }} /><button className="upload-button" onClick={() => fileInput.current?.click()}><ImagePlus size={17} /> {qrFile ? 'Đổi ảnh QR' : 'Tải ảnh QR lên'}</button></>}
            <div className="qr-tip"><span>💡</span> Vui lòng kiểm tra đúng nội dung trước khi chuyển khoản.</div>
          </section>

          <section className="panel members-panel" id="members">
            <div className="panel-heading">
              <div><p className="eyebrow">ĐỘI CẦU LÔNG</p><h2>Trạng thái đóng quỹ <span className="count-badge">{paidCount}/{members.length}</span></h2></div>
              <a className="view-all" href="#members">Xem tất cả <ChevronRight size={15} /></a>
            </div>
            <div className="member-list">
              {members.map((member) => <div className="member-row" key={member.id}>
                <div className={`avatar ${member.color}`}>{member.initials}</div>
                <span className="member-name">{member.name}</span>
                <button className={`payment-badge ${member.isPaid ? 'paid' : 'unpaid'}`} onClick={() => toggleMember(member)} disabled={!admin}>
                  {member.isPaid ? <><Check size={14} /> Đã đóng</> : <><X size={14} /> Chưa đóng</>}
                </button>
              </div>)}
            </div>
            <div className="member-footer"><span><span className="legend-dot paid-dot" /> Đã đóng <strong>{paidCount}</strong></span><span><span className="legend-dot unpaid-dot" /> Chưa đóng <strong>{members.length - paidCount}</strong></span></div>
          </section>
        </div>
        <footer className="footer"><span>© 2026 Quỹ Cầu Lông 7S</span><span><Cloud size={14} /> Dữ liệu được lưu trữ an toàn</span></footer>
      </main>
    </div>
  )
}

export default App
