import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import "../styles/landing.css";
import "../styles/qareeb-app.css";
import {
  createTrip,
  deleteTrip,
  getStats,
  getTrips,
  getUsers,
} from "../api/api";
import ContactModal from "../components/ContactModal.jsx";
import NewListingModal from "../components/NewListingModal.jsx";
import {
  formatDate,
  initialFromName,
  mapTripType,
  normalizeAuthUser,
} from "../utils/qareeb";

function QareebLayout() {
  const readStoredUser = () => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return normalizeAuthUser(parsed);
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState(() => readStoredUser());
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [contactTarget, setContactTarget] = useState(null);
  const [notif, setNotif] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [stats, setStats] = useState({
    activeRequests: 0,
    activeOffers: 0,
    totalUsers: 0,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const loadSeqRef = useRef(0);

  useEffect(() => {
    document.body.dataset.lang = "ar";
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
  }, []);

  useEffect(() => {
    if (!isNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isNavOpen]);

  const toast = (msg) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 2800);
  };

  const closeNav = () => setIsNavOpen(false);

  const loadData = async (activeUserOverride) => {
    const seq = (loadSeqRef.current += 1);
    setIsLoading(true);
    try {
      const [usersData, tripsData, statsData] = await Promise.all([
        getUsers().catch(() => []),
        getTrips().catch(() => []),
        getStats().catch(() => ({
          totalUsers: 0,
          activeOffers: 0,
          activeRequests: 0,
        })),
      ]);

      // If a newer loadData() call started, ignore this result.
      if (seq !== loadSeqRef.current) return;

      const safeUsers = Array.isArray(usersData) ? usersData : [];
      const safeTrips = Array.isArray(tripsData) ? tripsData : [];

      const computedStats = {
        totalUsers: safeUsers.filter(Boolean).length,
        activeOffers: safeTrips.filter(
          (t) => String(t?.type || "").toUpperCase() === "OFFER",
        ).length,
        activeRequests: safeTrips.filter(
          (t) => String(t?.type || "").toUpperCase() === "REQUEST",
        ).length,
      };

      const userById = new Map(
        safeUsers.filter((u) => u && u.id != null).map((u) => [u.id, u]),
      );

      // Enrich current user from /users when possible
      const activeUser = activeUserOverride || user;
      if (activeUser) {
        const normalizedMe = normalizeAuthUser(activeUser);
        const matched = safeUsers.find((u) => {
          if (!u) return false;
          if (normalizedMe?.id != null && u.id === normalizedMe.id) return true;
          if (
            normalizedMe?.phoneNumber &&
            u.phoneNumber === normalizedMe.phoneNumber
          )
            return true;
          if (
            normalizedMe?.name &&
            u.name?.toLowerCase() === normalizedMe.name.toLowerCase()
          )
            return true;
          return false;
        });

        if (matched) {
          setUser((prev) => {
            const next = normalizeAuthUser(prev);
            return {
              ...next,
              id: next?.id ?? matched.id,
              name: next?.name || matched.name,
              phoneNumber: next?.phoneNumber || matched.phoneNumber,
              rank: next?.rank ?? matched.rank,
            };
          });
        }
      }

      const mapped = safeTrips.map((trip) => {
        const backendUser =
          trip?.userId != null ? userById.get(trip.userId) : null;
        const userName = trip?.userName || backendUser?.name || "مستخدم";

        return {
          id: trip?.id,
          type: mapTripType(trip?.type),
          status: trip?.status || null,
          userId: trip?.userId,
          user: userName,
          phoneNumber: backendUser?.phoneNumber || null,
          userInitial: initialFromName(userName),
          rating: backendUser?.rank ?? 5,
          title: trip?.description || "رحلة توصيل",
          desc: trip?.description || "",
          from: trip?.pickupLocation || "—",
          to: trip?.destinationLocation || "—",
          date: formatDate(trip?.createdAt),
          urgent: false,
        };
      });

      setListings(mapped);
      setStats({
        totalUsers: statsData?.totalUsers ?? computedStats.totalUsers,
        activeOffers: statsData?.activeOffers ?? computedStats.activeOffers,
        activeRequests:
          statsData?.activeRequests ?? computedStats.activeRequests,
      });
    } catch (e) {
      console.error(e);
      toast("❌ فشل تحميل البيانات من الخادم");
    } finally {
      if (seq === loadSeqRef.current) setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = readStoredUser();
    const t = setTimeout(() => {
      void loadData(storedUser || user);
    }, 0);

    // Cleanup: invalidate any in-flight requests on unmount
    return () => {
      clearTimeout(t);
      loadSeqRef.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addListing = async (form) => {
    const description = form.desc?.trim() || form.title?.trim();

    if (!description || description.length < 10) {
      toast("❌ التفاصيل يجب أن يكون 10 أحرف على الأقل");
      return false;
    }

    try {
      const payload = {
        type: form.type === "offer" ? "OFFER" : "REQUEST",
        description,
        pickupLocation: form.from,
        destinationLocation: form.to,
        price: Number(form.price) || 0,
        userId: user?.id,
      };

      await createTrip(payload);
      toast("✅ تم نشر الإعلان بنجاح!");
      await loadData();
      return true;
    } catch (e) {
      console.error(e);
      toast("❌ فشل نشر الإعلان");
      return false;
    }
  };

  const deleteListing = async (id) => {
    try {
      await deleteTrip(id);
      toast("🗑 تم حذف الإعلان");
      await loadData();
    } catch (e) {
      console.error(e);
      toast("❌ فشل حذف الإعلان");
    }
  };

  const signOut = () => {
    loadSeqRef.current += 1;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowNew(false);
    setContactTarget(null);
    navigate("/", { replace: true });
  };

  const outletContext = {
    user,
    listings,
    stats,
    isLoading,
    setShowNew,
    setContactTarget,
    deleteListing,
  };

  if (!user) {
    // protect all nested routes
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="qareeb-app">
      {notif && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 500,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "12px 22px",
            fontWeight: 600,
            fontSize: ".9rem",
            boxShadow: "0 8px 32px rgba(15, 23, 42, 0.12)",
            animation: "qareeb-fade-up 0.25s ease",
          }}
        >
          {notif}
        </div>
      )}

      <nav className="nav">
        <div className="nav-logo">
          <span className="accent">Qareeb</span>
          <span
            className="nav-subtitle"
            style={{
              color: "var(--muted)",
              fontWeight: 500,
              fontSize: ".85rem",
              marginLeft: 6,
            }}
          >
            قريب
          </span>
        </div>

        {!isNavOpen && (
          <button
            className="btn btn-secondary btn-icon nav-menu-btn"
            onClick={() => setIsNavOpen(true)}
            aria-expanded={isNavOpen}
            aria-controls="qareeb-drawer"
            aria-label="فتح القائمة"
            title="القائمة"
          >
            ☰
          </button>
        )}
      </nav>

      {isNavOpen && (
        <div
          className="drawer-backdrop"
          onClick={(e) => e.target === e.currentTarget && closeNav()}
        >
          <aside
            id="qareeb-drawer"
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="القائمة"
          >
            <div className="drawer-body">
              <button
                className="drawer-profile"
                onClick={() => {
                  closeNav();
                  navigate("/app/profile");
                }}
                type="button"
              >
                <div className="avatar" aria-hidden="true">
                  {initialFromName(user?.name)}
                </div>
                <div className="drawer-profile-text">
                  <div className="drawer-profile-name">{user?.name || ""}</div>
                  <div className="drawer-profile-sub">عرض الملف الشخصي</div>
                </div>
              </button>

              <button
                className={`drawer-link ${location.pathname === "/app" ? "active" : ""}`}
                onClick={() => {
                  closeNav();
                  navigate("/app");
                }}
              >
                الرئيسية
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => {
                  closeNav();
                  signOut();
                }}
              >
                تسجيل الخروج
              </button>
            </div>
          </aside>
        </div>
      )}

      {showNew && (
        <NewListingModal
          onClose={() => setShowNew(false)}
          onSubmit={addListing}
        />
      )}

      {contactTarget && (
        <ContactModal
          listing={contactTarget}
          currentUser={user}
          onClose={() => setContactTarget(null)}
        />
      )}

      <Outlet context={outletContext} />
    </div>
  );
}

export default QareebLayout;
