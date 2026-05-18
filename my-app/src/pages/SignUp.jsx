import { useState } from 'react'

function SignUp({ onAuth }) {
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    password: '',
  })

  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    // ======================
    // Frontend validation
    // ======================
    if (!form.name.trim()) {
      setErr('الاسم مطلوب')
      return
    }

    if (
      !form.phoneNumber.startsWith('05') ||
      form.phoneNumber.length !== 10
    ) {
      setErr('يرجى إدخال رقم هاتف صحيح')
      return
    }

    if (form.password.length < 8) {
      setErr('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }

    try {
      setLoading(true)
      setErr('')

      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'فشل إنشاء الحساب')
      }

      // ======================
      // Save JWT token
      // ======================
      if (data.token) {
        localStorage.setItem('token', data.token)
      }

      // ======================
      // Send user to app
      // ======================
      onAuth({
        name: data.name || form.name,
        phoneNumber: data.phoneNumber || form.phoneNumber,
        token: data.token,
      })
    } catch (error) {
      setErr(error.message || 'حدث خطأ أثناء إنشاء الحساب')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="input-wrap">
        <label className="input-label">الاسم الكامل</label>
        <input
          className="input"
          placeholder="اكتب اسمك"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />
      </div>

      <div className="input-wrap">
        <label className="input-label">رقم الهاتف</label>
        <input
          className="input"
          type="tel"
          placeholder="0599999999"
          value={form.phoneNumber}
          onChange={(e) =>
            setForm({ ...form, phoneNumber: e.target.value })
          }
        />
      </div>

      <div className="input-wrap">
        <label className="input-label">كلمة المرور</label>
        <input
          className="input"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />
      </div>

      {err && (
        <div
          style={{
            color: 'var(--accent)',
            fontSize: '.83rem',
            padding: '8px 12px',
            background: 'rgba(249, 115, 22, 0.12)',
            borderRadius: 12,
          }}
        >
          {err}
        </div>
      )}

      <button
        className="btn btn-primary"
        style={{ width: '100%', marginTop: 4, padding: 13 }}
        onClick={handle}
        disabled={loading}
      >
        {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
      </button>
    </div>
  )
}

export default SignUp