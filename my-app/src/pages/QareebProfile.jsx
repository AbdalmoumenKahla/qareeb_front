import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import ListingCard from "../components/ListingCard.jsx";
import { initialFromName } from "../utils/qareeb";

function QareebProfile() {
  const { user, listings, isLoading, setShowNew, deleteListing } =
    useOutletContext();

  const mine = useMemo(() => {
    return listings.filter((listing) =>
      user?.id != null
        ? listing.userId === user.id
        : listing.user === user?.name,
    );
  }, [listings, user]);

  const requests = useMemo(
    () => mine.filter((listing) => listing.type === "request"),
    [mine],
  );
  const offers = useMemo(
    () => mine.filter((listing) => listing.type === "offer"),
    [mine],
  );

  return (
    <div className="qareeb-page">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="profile-hero fade-up">
          <div className="profile-avatar-lg">{initialFromName(user?.name)}</div>
          <div className="profile-info" style={{ flex: 1 }}>
            <h2>{user?.name}</h2>
            <p>{user?.phoneNumber || ""}</p>
            <div className="badge-row">
              <span className="tag tag-mine">🛡 موثق</span>
              <span className="tag tag-offer">
                ⭐ {user?.rank != null ? user.rank : "—"} تقييم
              </span>
              <span className="tag tag-request">{mine.length} إعلان</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm">✏️ تعديل الملف</button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 12,
          }}
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
            <div className="stat-chip-value" style={{ color: "var(--brand)" }}>
              12
            </div>
            <div className="stat-chip-label">عمليات مكتملة</div>
          </div>
        </div>

        <div className="fade-up-3">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <span
              className="syne"
              style={{ fontWeight: 700, fontSize: "1.05rem" }}
            >
              إعلاناتي
            </span>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowNew(true)}
            >
              + إعلان جديد
            </button>
          </div>

          {isLoading ? (
            <div className="empty card">
              <div className="empty-icon">⏳</div>
              <h3>جاري تحميل إعلاناتك</h3>
              <p>يرجى الانتظار...</p>
            </div>
          ) : mine.length === 0 ? (
            <div className="empty card">
              <div className="empty-icon">📭</div>
              <h3>لا توجد إعلانات بعد</h3>
              <p>انشر أول طلب أو عرض توصيل</p>
              <button
                className="btn btn-primary"
                style={{ marginTop: 16 }}
                onClick={() => setShowNew(true)}
              >
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
                  onDelete={deleteListing}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QareebProfile;
