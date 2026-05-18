import { useState } from 'react'
import { login } from '../api/api'

const handle = async () => {
  try {
    if (!form.phoneNumber.startsWith('05') || form.phoneNumber.length !== 10) {
      setErr('يرجى إدخال رقم الهاتف الصحيح')
      return
    }

    const token = await login(form)

    localStorage.setItem('token', token)

    onAuth({
      phoneNumber: form.phoneNumber,
      token,
    })

  } catch (e) {
    setErr('فشل تسجيل الدخول')
  }
}

function SignIn({ onAuth }) {
  const [form, setForm] = useState({
    phoneNumber: '',
    password: '',
  })

  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async () => {

    // Frontend validation
    if (!form.phoneNumber.startsWith('05') ||
        form.phoneNumber.length !== 10) {

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

      const response = await fetch(
        'http://localhost:8080/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'فشل تسجيل الدخول')
      }

      // Save JWT token
      localStorage.setItem('token', data.token)

      // Optional user data
      onAuth(data)

    } catch (error) {

      setErr(error.message)

    } finally {

      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      <div className="input-wrap">
        <label className="input-label">رقم الهاتف</label>

        <input
          className="input"
          type="tel"
          placeholder="0599999999"
          value={form.phoneNumber}
          onChange={(e) =>
            setForm({
              ...form,
              phoneNumber: e.target.value,
            })
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
            setForm({
              ...form,
              password: e.target.value,
            })
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
        style={{
          width: '100%',
          marginTop: 4,
          padding: 13,
        }}
        onClick={handle}
        disabled={loading}
      >
        {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
      </button>
    </div>
  )
}

export default SignIn