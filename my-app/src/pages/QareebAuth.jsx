import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import "../styles/landing.css";
import "../styles/qareeb-app.css";
import SignIn from "./SignIn.jsx";
import SignUp from "./SignUp.jsx";
import { normalizeAuthUser } from "../utils/qareeb";

function QareebAuth() {
  const [tab, setTab] = useState("signin");
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/app";

  useEffect(() => {
    document.body.dataset.lang = "ar";
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
  }, []);

  // If already logged in, go to feed
  let isLoggedIn = false;
  try {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      isLoggedIn = Boolean(normalizeAuthUser(parsed));
    }
  } catch {
    isLoggedIn = false;
  }

  if (isLoggedIn) return <Navigate to={redirectTo} replace />;

  const onAuth = (nextUser) => {
    const normalized = normalizeAuthUser(nextUser);
    if (normalized) navigate(redirectTo, { replace: true });
  };

  return (
    <div className="qareeb-app auth-wrap">
      <div className="auth-box fade-up">
        <div className="auth-logo">
          <span className="accent">Qareeb</span>
          <span
            style={{
              color: "var(--muted)",
              fontSize: "1.1rem",
              fontWeight: 400,
            }}
          >
            {" "}
            · قريب
          </span>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <div className="auth-tabs">
            {["signin", "signup"].map((t) => (
              <button
                key={t}
                className={`auth-tab ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
              </button>
            ))}
          </div>

          {tab === "signin" ? (
            <SignIn onAuth={onAuth} />
          ) : (
            <SignUp onAuth={onAuth} />
          )}

          <p
            style={{
              textAlign: "center",
              color: "var(--muted)",
              fontSize: ".78rem",
              marginTop: 18,
            }}
          >
            بالمتابعة فإنك توافق على{" "}
            <span style={{ color: "var(--accent)", cursor: "pointer" }}>
              شروط الخدمة
            </span>
          </p>
        </div>

        <p
          style={{
            textAlign: "center",
            color: "var(--muted)",
            fontSize: ".78rem",
            marginTop: 18,
          }}
        >
          🛡 بياناتك مشفرة وخاصة
        </p>
      </div>
    </div>
  );
}

export default QareebAuth;
