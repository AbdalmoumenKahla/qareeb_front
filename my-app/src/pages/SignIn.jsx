import { useState } from "react";
import { baseFetch } from "../api/api";

function SignIn({ onAuth }) {
  const [form, setForm] = useState({
    phoneNumber: "",
    password: "",
  });

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!form.phoneNumber.startsWith("05") || form.phoneNumber.length !== 10) {
      setErr("يرجى إدخال رقم هاتف صحيح");
      return;
    }

    if (form.password.length < 8) {
      setErr("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    try {
      setLoading(true);
      setErr("");

      const response = await baseFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "فشل تسجيل الدخول");
      }

      console.log(data);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      onAuth(data);
    } catch (error) {
      const raw = (error && error.message) || "";
      const lowered = String(raw).toLowerCase();
      const isNetworkFailure =
        lowered.includes("failed to fetch") ||
        lowered.includes("load failed") ||
        lowered.includes("networkerror");

      setErr(
        isNetworkFailure
          ? "تعذر الاتصال بالخادم. تأكد أن الخادم يعمل وأن هاتفك على نفس الشبكة."
          : raw,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
            color: "var(--accent)",
            fontSize: ".83rem",
            padding: "8px 12px",
            background: "rgba(249, 115, 22, 0.12)",
            borderRadius: 12,
          }}
        >
          {err}
        </div>
      )}

      <button
        className="btn btn-primary"
        style={{
          width: "100%",
          marginTop: 4,
          padding: 13,
        }}
        onClick={handle}
        disabled={loading}
      >
        {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
      </button>
    </div>
  );
}

export default SignIn;
