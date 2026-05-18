import { useEffect, useState } from 'react'
import '../styles/landing.css'
import '../styles/qareeb-app.css'
import SignIn from './SignIn.jsx'
import SignUp from './SignUp.jsx'
import { getTrips } from '../api/api'


function ListingCard({ listing, currentUser, onContact, onDelete }) {

  const isMine = currentUser && listing.user === currentUser.name
  useEffect(() => {
  const loadTrips = async () => {
    try {
      const token = localStorage.getItem('token')

      if (!token) return

      const data = await getTrips(token)

      const mapped = data.map((trip) => ({
        id: trip.id,
        type: trip.type === 'REQUEST' ? 'request' : 'offer',
        user: trip.userName,
        userInitial: trip.userName?.[0] || 'U',
        title: trip.description,
        desc: trip.description,
        from: trip.pickupLocation,
        to: trip.destinationLocation,
        price: trip.price,
        currency: 'شيكل',
        date: trip.createdAt,
        urgent: false,
      }))

      setListings(mapped)

    } catch (e) {
      console.error(e)
    }
  }

  loadTrips()
}, []) 

  return (
    <div className="card listing-card fade-up">
      <div className="listing-card-header">
        <div className="listing-card-user">
          <div className="avatar" style={{ width: 38, height: 38, fontSize: '.82rem' }}>
            {listing.userInitial}
          </div>
          <div>
            <div
              style={{
                fontWeight: 600,
                fontSize: '.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              {listing.user}
              {isMine && <span className="dot" title="أنت" />}
            </div>
            <div
              style={{
                fontSize: '.75rem',
                color: 'var(--muted)',
                display: 'flex',
                gap: 6,
              }}
            >
              <span>⭐ {listing.rating}</span>
              <span>·</span>
              <span>{listing.date}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {listing.urgent && (
            <span className="tag tag-request" style={{ fontSize: '.7rem' }}>
              ⚡ عاجل
            </span>
          )}
          <span className={`tag ${listing.type === 'request' ? 'tag-request' : 'tag-offer'}`}>
            {listing.type === 'request' ? '📦 طلب' : '🚚 عرض'}
          </span>
          {isMine && <span className="tag tag-mine">خاصتي</span>}
        </div>
      </div>

      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: '1rem',
            marginBottom: 6,
          }}
        >
          {listing.title}
        </div>
        <div className="listing-card-body">{listing.desc}</div>
      </div>

      <div className="listing-meta">
        <span>📍 {listing.from}</span>
        <span style={{ color: 'var(--brand)' }}>→</span>
        <span>📍 {listing.to}</span>
        <span
          style={{
            marginLeft: 'auto',
            fontWeight: 800,
            fontSize: '1rem',
            color: 'var(--brand-strong)',
          }}
        >
          {listing.price} {listing.currency}
        </span>
      </div>

      <div className="divider" />
      <div className="listing-actions">
        {!isMine && (
          <button className="btn btn-primary btn-sm" onClick={() => onContact(listing)}>
            💬 تواصل
          </button>
        )}
        <button className="btn btn-secondary btn-sm">↗ مشاركة</button>
        {isMine && (
          <button
            className="btn btn-danger btn-sm"
            style={{ marginLeft: 'auto' }}
            onClick={() => onDelete(listing.id)}
          >
            🗑 حذف
          </button>
        )}
      </div>
    </div>
  )
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <span className="syne" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            {title}
          </span>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            style={{ fontSize: '1.2rem' }}
          >
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

function AuthPage({ onAuth }) {
  const [tab, setTab] = useState('signin')

  return (
    <div className="qareeb-app auth-wrap">
      <div className="auth-box fade-up">
        <div className="auth-logo">
          <span className="accent">Qareeb</span>
          <span style={{ color: 'var(--muted)', fontSize: '1.1rem', fontWeight: 400 }}>
            {' '}
            · قريب
          </span>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <div className="auth-tabs">
            {['signin', 'signup'].map((t) => (
              <button
                key={t}
                className={`auth-tab ${tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب'}
              </button>
            ))}
          </div>

          {tab === 'signin' ? <SignIn onAuth={onAuth} /> : <SignUp onAuth={onAuth} />}

          <p
            style={{
              textAlign: 'center',
              color: 'var(--muted)',
              fontSize: '.78rem',
              marginTop: 18,
            }}
          >
            بالمتابعة فإنك توافق على{' '}
            <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>شروط الخدمة</span>
          </p>
        </div>

        <p
          style={{
            textAlign: 'center',
            color: 'var(--muted)',
            fontSize: '.78rem',
            marginTop: 18,
          }}
        >
          🛡 بياناتك مشفرة وخاصة
        </p>
      </div>
    </div>
  )
}

function NewListingModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    type: 'request',
    title: '',
    desc: '',
    from: '',
    to: '',
    price: '',
    urgent: false,
  })

  const handle = () => {
    if (!form.title || !form.from || !form.to || !form.price) return
    onSubmit(form)
    onClose()
  }

  return (
    <Modal
      title={form.type === 'request' ? '📦 طلب توصيل' : '🚚 عرض توصيل'}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            إلغاء
          </button>
          <button className="btn btn-primary" onClick={handle}>
            نشر الإعلان
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
        {['request', 'offer'].map((t) => (
          <button
            key={t}
            className={`btn ${form.type === t ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setForm({ ...form, type: t })}
          >
            {t === 'request' ? '📦 أحتاج توصيلا' : '🚚 أستطيع التوصيل'}
          </button>
        ))}
      </div>
      <div className="input-wrap">
        <label className="input-label">العنوان</label>
        <input
          className="input"
          placeholder="وصف مختصر للتوصيل"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div className="input-wrap">
        <label className="input-label">التفاصيل</label>
        <textarea
          className="input"
          placeholder="حجم الطرد والوزن والتعليمات الخاصة…"
          value={form.desc}
          onChange={(e) => setForm({ ...form, desc: e.target.value })}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="input-wrap">
          <label className="input-label">من</label>
          <input
            className="input"
            placeholder="مدينة الانطلاق"
            value={form.from}
            onChange={(e) => setForm({ ...form, from: e.target.value })}
          />
        </div>
        <div className="input-wrap">
          <label className="input-label">إلى</label>
          <input
            className="input"
            placeholder="الوجهة"
            value={form.to}
            onChange={(e) => setForm({ ...form, to: e.target.value })}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="input-wrap">
          <label className="input-label">السعر (شيكل)</label>
          <input
            className="input"
            type="number"
            placeholder="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>
        <div className="input-wrap" style={{ justifyContent: 'flex-end' }}>
          <label className="input-label">عاجل؟</label>
          <label
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 4 }}
          >
            <input
              type="checkbox"
              checked={form.urgent}
              onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
              style={{ accentColor: 'var(--brand)', width: 16, height: 16 }}
            />
            <span style={{ fontSize: '.88rem' }}>وضع علامة عاجل</span>
          </label>
        </div>
      </div>
    </Modal>
  )
}

function ContactModal({ listing, onClose }) {
  const typeLabel = listing.type === 'request' ? 'طلب توصيل' : 'عرض توصيل'
  const [msg, setMsg] = useState(
    `مرحبًا! أنا مهتم بـ ${typeLabel} من ${listing.from} إلى ${listing.to}.`,
  )

  return (
    <Modal
      title={`💬 تواصل مع ${listing.user}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            إلغاء
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            إرسال الرسالة
          </button>
        </>
      }
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 16,
          padding: 14,
          fontSize: '.88rem',
          color: 'var(--muted)',
        }}
      >
        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          {listing.title}
        </div>
        <div style={{ display: 'flex', gap: 8, fontSize: '.8rem' }}>
          <span className={`tag ${listing.type === 'request' ? 'tag-request' : 'tag-offer'}`}>
            {typeLabel}
          </span>
          <span>
            📍 {listing.from} → {listing.to}
          </span>
          <span style={{ marginLeft: 'auto', color: 'var(--brand-strong)', fontWeight: 700 }}>
            {listing.price} {listing.currency}
          </span>
        </div>
      </div>
      <div className="input-wrap">
        <label className="input-label">رسالتك</label>
        <textarea
          className="input"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          style={{ minHeight: 110 }}
        />
      </div>
      <p style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
        🔒 الرسائل خاصة بينك وبين صاحب الإعلان.
      </p>
    </Modal>
  )
}

function ProfilePage({ user, listings, onNewListing }) {
  const mine = listings.filter((listing) => listing.user === user.name)
  const requests = mine.filter((listing) => listing.type === 'request')
  const offers = mine.filter((listing) => listing.type === 'offer')

  return (
    <div className="qareeb-page">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="profile-hero fade-up">
          <div className="profile-avatar-lg">{user.name[0].toUpperCase()}</div>
          <div className="profile-info" style={{ flex: 1 }}>
            <h2>{user.name}</h2>
            <p>
              {user.email} · {user.city}
            </p>
            <div className="badge-row">
              <span className="tag tag-mine">🛡 موثق</span>
              <span className="tag tag-offer">⭐ 4.9 تقييم</span>
              <span className="tag tag-request">{mine.length} إعلان</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm">✏️ تعديل الملف</button>
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}
          className="fade-up-2"
        >
          <div className="stat-chip">
            <div className="stat-chip-value accent">{requests.length}</div>
            <div className="stat-chip-label">طلبات التوصيل</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-value accent2">{offers.length}</div>
            <div className="stat-chip-label">عروض التوصيل</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-value" style={{ color: 'var(--brand)' }}>
              12
            </div>
            <div className="stat-chip-label">عمليات مكتملة</div>
          </div>
        </div>

        <div className="fade-up-3">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <span className="syne" style={{ fontWeight: 700, fontSize: '1.05rem' }}>
              إعلاناتي
            </span>
            <button className="btn btn-primary btn-sm" onClick={onNewListing}>
              + إعلان جديد
            </button>
          </div>
          {mine.length === 0 ? (
            <div className="empty card">
              <div className="empty-icon">📭</div>
              <h3>لا توجد إعلانات بعد</h3>
              <p>انشر أول طلب أو عرض توصيل</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onNewListing}>
                + إنشاء إعلان
              </button>
            </div>
          ) : (
            <div className="feed-grid">
              {mine.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  currentUser={user}
                  onContact={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QareebApp() {
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('feed')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [listings, setListings] = useState([])
  const [showNew, setShowNew] = useState(false)
  const [contactTarget, setContactTarget] = useState(null)
  const [notif, setNotif] = useState(null)

  useEffect(() => {
    document.body.dataset.lang = 'ar'
    document.documentElement.lang = 'ar'
    document.documentElement.dir = 'rtl'
  }, [])

  const toast = (msg) => {
    setNotif(msg)
    setTimeout(() => setNotif(null), 2800)
  }


  useEffect(() => {
  document.body.dataset.lang = 'ar'
  document.documentElement.lang = 'ar'
  document.documentElement.dir = 'rtl'

  const loadTrips = async () => {
    try {
      const token = localStorage.getItem('token')

      if (!token) return

      const data = await getTrips(token)

      const mapped = data.map((trip) => ({
        id: trip.id,
        type: trip.type === 'REQUEST' ? 'request' : 'offer',
        user: trip.userName,
        userInitial: trip.userName?.[0] || 'U',
        rating: 5,
        title: trip.description,
        desc: trip.description,
        from: trip.pickupLocation,
        to: trip.destinationLocation,
        price: trip.price,
        currency: 'شيكل',
        date: trip.createdAt,
        urgent: false,
      }))

      setListings(mapped)

    } catch (e) {
      console.error(e)
    }
  }

  loadTrips()
}, [])

  const addListing = (form) => {
    const newListing = {
      id: Date.now(),
      type: form.type,
      user: user.name,
      userInitial: user.name[0].toUpperCase(),
      rating: 5,
      title: form.title,
      desc: form.desc,
      from: form.from,
      to: form.to,
      price: parseInt(form.price, 10) || 0,
      currency: 'شيكل',
      date: 'الآن',
      urgent: form.urgent,
    }

    setListings((prev) => [newListing, ...prev])
    toast('✅ تم نشر الإعلان بنجاح!')
  }

  const deleteListing = (id) => {
    setListings((prev) => prev.filter((listing) => listing.id !== id))
    toast('🗑 تم حذف الإعلان')
  }

  if (!user) {
    return (
      <AuthPage
        onAuth={(nextUser) => {
          setUser(nextUser)
          setTab('feed')
        }}
      />
    )
  }

  const filtered = listings
    .filter((listing) => (filter === 'all' ? true : listing.type === filter))
    .filter((listing) => {
      if (!search) return true
      const term = search.toLowerCase()
      return (
        listing.title.toLowerCase().includes(term) ||
        listing.from.toLowerCase().includes(term) ||
        listing.to.toLowerCase().includes(term) ||
        listing.user.toLowerCase().includes(term)
      )
    })

  return (
    <div className="qareeb-app">
      {notif && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 500,
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 16,
            padding: '12px 22px',
            fontWeight: 600,
            fontSize: '.9rem',
            boxShadow: '0 8px 32px rgba(15, 23, 42, 0.12)',
            animation: 'qareeb-fade-up 0.25s ease',
          }}
        >
          {notif}
        </div>
      )}

      <nav className="nav">
        <div className="nav-logo">
          <span className="accent">Qareeb</span>
          <span style={{ color: 'var(--muted)', fontWeight: 500, fontSize: '.85rem', marginLeft: 6 }}>
            قريب
          </span>
        </div>
        <div className="nav-tabs">
          {[
            { id: 'feed', label: '🗂 الخلاصة' },
            { id: 'profile', label: '👤 الملف الشخصي' },
          ].map((tabItem) => (
            <button
              key={tabItem.id}
              className={`nav-tab ${tab === tabItem.id ? 'active' : ''}`}
              onClick={() => setTab(tabItem.id)}
            >
              {tabItem.label}
            </button>
          ))}
        </div>
        <div className="nav-right">
          <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}>
            + إعلان جديد
          </button>
          <div className="avatar" onClick={() => setTab('profile')} title="ملفي">
            {user.name[0].toUpperCase()}
          </div>
        </div>
      </nav>

      {showNew && <NewListingModal onClose={() => setShowNew(false)} onSubmit={addListing} />}
      {contactTarget && (
        <ContactModal listing={contactTarget} onClose={() => setContactTarget(null)} />
      )}

      {tab === 'profile' && (
        <ProfilePage user={user} listings={listings} onNewListing={() => setShowNew(true)} />
      )}

      {tab === 'feed' && (
        <div className="qareeb-page">
          <div className="layout-2col">
            <div>
              <div style={{ marginBottom: 22 }} className="fade-up">
                <h1
                  className="syne"
                  style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}
                >
                  خلاصة <span className="accent">التوصيل</span>
                </h1>
                <p style={{ color: 'var(--muted)', fontSize: '.88rem' }}>
                  استعرض طلبات وعروض المجتمع
                </p>
              </div>

              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}
                className="fade-up-2"
              >
                <div className="search-wrap">
                  <span className="search-icon">🔍</span>
                  <input
                    className="input"
                    placeholder="ابحث بالمدينة أو المسار أو المستخدم…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="filter-bar">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'request', label: '📦 طلبات' },
                    { id: 'offer', label: '🚚 عروض' },
                  ].map((filterItem) => (
                    <button
                      key={filterItem.id}
                      className={`filter-pill ${filter === filterItem.id ? 'active' : ''}`}
                      onClick={() => setFilter(filterItem.id)}
                    >
                      {filterItem.label}
                    </button>
                  ))}
                  <span style={{ marginLeft: 'auto', fontSize: '.8rem', color: 'var(--muted)' }}>
                    {filtered.length} إعلان
                  </span>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="empty card fade-up">
                  <div className="empty-icon">🔍</div>
                  <h3>لا توجد إعلانات</h3>
                  <p>جرّب فلترًا آخر أو كلمات مختلفة</p>
                </div>
              ) : (
                <div className="feed-grid">
                  {filtered.map((listing, index) => (
                    <div key={listing.id} style={{ animationDelay: `${index * 0.05}s` }}>
                      <ListingCard
                        listing={listing}
                        currentUser={user}
                        onContact={setContactTarget}
                        onDelete={deleteListing}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sidebar">
              <div className="card fade-up" style={{ padding: 18 }}>
                <div className="syne" style={{ fontWeight: 700, marginBottom: 14, fontSize: '.95rem' }}>
                  نشر سريع
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button className="btn btn-primary" onClick={() => setShowNew(true)}>
                    📦 طلب توصيل
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowNew(true)}>
                    🚚 عرض توصيل
                  </button>
                </div>
              </div>

              <div className="card fade-up-2" style={{ padding: 18 }}>
                <div className="syne" style={{ fontWeight: 700, marginBottom: 14, fontSize: '.95rem' }}>
                  إحصائيات المجتمع
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    {
                      label: 'طلبات نشطة',
                      val: listings.filter((listing) => listing.type === 'request').length,
                      color: 'var(--brand)',
                    },
                    {
                      label: 'عروض نشطة',
                      val: listings.filter((listing) => listing.type === 'offer').length,
                      color: 'var(--accent)',
                    },
                    {
                      label: 'إجمالي الأعضاء',
                      val: 38,
                      color: 'var(--brand-strong)',
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '9px 0',
                        borderBottom: '1px solid var(--line)',
                      }}
                    >
                      <span style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{stat.label}</span>
                      <span style={{ fontWeight: 800, color: stat.color }}>{stat.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card fade-up-3" style={{ padding: 18 }}>
                <div className="syne" style={{ fontWeight: 700, marginBottom: 14, fontSize: '.95rem' }}>
                  كيف يعمل قريب
                </div>
                {[
                  { icon: '📦', text: 'انشر ما تحتاج توصيله أو مسارك المتاح' },
                  { icon: '👥', text: 'تصفّح الإعلانات وابحث عن الأنسب' },
                  { icon: '💬', text: 'تواصل مباشرة ورتّب عملية التوصيل' },
                  { icon: '⭐', text: 'أكمل الطلب وقيّم التجربة' },
                ].map((step, index) => (
                  <div
                    key={index}
                    style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}
                  >
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{step.icon}</span>
                    <span style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QareebApp
