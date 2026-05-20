import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ListingCard from "../components/ListingCard.jsx";

function QareebFeed() {
  const {
    user,
    listings,
    stats,
    isLoading,
    setShowNew,
    setContactTarget,
    deleteListing,
  } = useOutletContext();

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return listings
      .filter((listing) => (filter === "all" ? true : listing.type === filter))
      .filter((listing) => {
        if (!search) return true;
        const term = search.toLowerCase();
        return (
          listing.title.toLowerCase().includes(term) ||
          listing.from.toLowerCase().includes(term) ||
          listing.to.toLowerCase().includes(term) ||
          listing.user.toLowerCase().includes(term)
        );
      });
  }, [listings, filter, search]);

  return (
    <div className="qareeb-page">
      <div className="layout-2col">
        <div>
          <div style={{ marginBottom: 22 }} className="fade-up">
            <h1
              className="syne"
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                marginBottom: 4,
              }}
            >
              خلاصة <span className="accent">التوصيل</span>
            </h1>
            <p style={{ color: "var(--muted)", fontSize: ".88rem" }}>
              استعرض طلبات وعروض المجتمع
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 20,
            }}
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
                { id: "all", label: "الكل" },
                { id: "request", label: "📦 طلبات" },
                { id: "offer", label: "🚚 عروض" },
              ].map((filterItem) => (
                <button
                  key={filterItem.id}
                  className={`filter-pill ${filter === filterItem.id ? "active" : ""}`}
                  onClick={() => setFilter(filterItem.id)}
                >
                  {filterItem.label}
                </button>
              ))}
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: ".8rem",
                  color: "var(--muted)",
                }}
              >
                {filtered.length} إعلان
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="empty card fade-up">
              <div className="empty-icon">⏳</div>
              <h3>جاري تحميل الإعلانات</h3>
              <p>يرجى الانتظار...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty card fade-up">
              <div className="empty-icon">🔍</div>
              <h3>لا توجد إعلانات</h3>
              <p>جرّب فلترًا آخر أو كلمات مختلفة</p>
            </div>
          ) : (
            <div className="feed-grid">
              {filtered.map((listing, index) => (
                <div
                  key={listing.id}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
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
            <div
              className="syne"
              style={{ fontWeight: 700, marginBottom: 14, fontSize: ".95rem" }}
            >
              نشر سريع
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                className="btn btn-primary"
                onClick={() => setShowNew(true)}
              >
                📦 طلب توصيل
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowNew(true)}
              >
                🚚 عرض توصيل
              </button>
            </div>
          </div>

          <div className="card fade-up-2" style={{ padding: 18 }}>
            <div
              className="syne"
              style={{ fontWeight: 700, marginBottom: 14, fontSize: ".95rem" }}
            >
              إحصائيات المجتمع
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "طلبات نشطة", val: stats.activeRequests },
                {
                  label: "عروض نشطة",
                  val: stats.activeOffers,
                  color: "var(--accent)",
                },
                {
                  label: "إجمالي الأعضاء",
                  val: stats.totalUsers,
                  color: "var(--brand-strong)",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "9px 0",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <span style={{ fontSize: ".85rem", color: "var(--muted)" }}>
                    {stat.label}
                  </span>
                  <span style={{ fontWeight: 800, color: stat.color }}>
                    {stat.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card fade-up-3" style={{ padding: 18 }}>
            <div
              className="syne"
              style={{ fontWeight: 700, marginBottom: 14, fontSize: ".95rem" }}
            >
              كيف يعمل قريب
            </div>
            {[
              { icon: "📦", text: "انشر ما تحتاج توصيله أو مسارك المتاح" },
              { icon: "👥", text: "تصفّح الإعلانات وابحث عن الأنسب" },
              { icon: "💬", text: "تواصل مباشرة ورتّب عملية التوصيل" },
              { icon: "⭐", text: "أكمل الطلب وقيّم التجربة" },
            ].map((step, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 12,
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>
                  {step.icon}
                </span>
                <span
                  style={{
                    fontSize: ".82rem",
                    color: "var(--muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {step.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QareebFeed;
