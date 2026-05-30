import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ListingCard from "../components/ListingCard.jsx";
import { getAverageScore, getRatingCount, getRatingsForUser } from "../api/api";
import { formatDate, initialFromName } from "../utils/qareeb";

function QareebProfile() {
  const { user, listings, isLoading, setShowNew, deleteListing } =
    useOutletContext();

  const [avgScore, setAvgScore] = useState(null);
  const [ratingCount, setRatingCount] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);
  const [ratingsError, setRatingsError] = useState(null);

  const extractRatings = (payload) => {
    if (!payload) return [];

    if (Array.isArray(payload)) return payload;

    // Spring Page<T> => { content: [...] }
    if (Array.isArray(payload.content)) return payload.content;

    // Some APIs wrap data => { data: { content: [...] } }
    if (payload.data && Array.isArray(payload.data.content))
      return payload.data.content;

    // Common alternative keys
    if (Array.isArray(payload.ratings)) return payload.ratings;
    if (payload.data && Array.isArray(payload.data.ratings))
      return payload.data.ratings;
    if (Array.isArray(payload.items)) return payload.items;
    if (payload.data && Array.isArray(payload.data.items))
      return payload.data.items;

    return [];
  };

  useEffect(() => {
    const userId = user?.id;
    if (userId == null) {
      const t = setTimeout(() => {
        setAvgScore(null);
        setRatingCount(null);
        setRatings([]);
        setRatingsError("لا يمكن تحميل التقييمات لأن user.id غير موجود");
      }, 0);
      return () => clearTimeout(t);
    }

    let isCancelled = false;
    const load = async () => {
      setIsLoadingRatings(true);
      setRatingsError(null);
      try {
        const [avgRes, countRes, pageRes] = await Promise.allSettled([
          getAverageScore(userId),
          getRatingCount(userId),
          getRatingsForUser(userId, { page: 0, size: 10 }),
        ]);

        if (isCancelled) return;

        const avg = avgRes.status === "fulfilled" ? avgRes.value : null;
        const count = countRes.status === "fulfilled" ? countRes.value : null;
        const page = pageRes.status === "fulfilled" ? pageRes.value : null;

        setAvgScore(
          typeof avg === "number" ? avg : avg != null ? Number(avg) : null,
        );
        setRatingCount(
          typeof count === "number"
            ? count
            : count != null
              ? Number(count)
              : null,
        );

        const items = extractRatings(page).filter(Boolean);
        setRatings(items);

        // Only show an error if the actual list call failed
        if (pageRes.status === "rejected") {
          const msg = pageRes.reason?.message || "تعذر تحميل قائمة التقييمات";
          setRatingsError(msg);
        }
      } catch (e) {
        console.error(e);
        if (!isCancelled)
          setRatingsError((e && e.message) || "تعذر تحميل التقييمات");
      } finally {
        if (!isCancelled) setIsLoadingRatings(false);
      }
    };

    load();
    return () => {
      isCancelled = true;
    };
  }, [user?.id]);

  const scoreLabel = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return "⭐".repeat(Math.max(0, Math.min(5, Math.round(n))));
  };

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
                ⭐{" "}
                {avgScore != null && Number.isFinite(avgScore)
                  ? avgScore.toFixed(1)
                  : user?.rank != null
                    ? user.rank
                    : "—"}
              </span>
              <span className="tag tag-request">
                📝{" "}
                {ratingCount != null && Number.isFinite(ratingCount)
                  ? ratingCount
                  : "—"}{" "}
                مراجعة
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
              تقييماتي
            </span>
          </div>

          {isLoadingRatings ? (
            <div className="empty card">
              <div className="empty-icon">⏳</div>
              <h3>جاري تحميل التقييمات</h3>
              <p>يرجى الانتظار...</p>
            </div>
          ) : ratingsError ? (
            <div className="empty card">
              <div className="empty-icon">⚠️</div>
              <h3>تعذر تحميل التقييمات</h3>
              <p>{ratingsError}</p>
            </div>
          ) : ratings.length === 0 ? (
            <div className="empty card">
              <div className="empty-icon">⭐</div>
              <h3>لا توجد تقييمات بعد</h3>
              <p>ستظهر هنا التقييمات التي يستلمها حسابك</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ratings.map((r) => {
                const who =
                  r?.rater?.name ||
                  r?.raterName ||
                  (r?.raterId != null ? `مستخدم #${r.raterId}` : "مستخدم");

                const when =
                  r?.createdAt || r?.createdDate || r?.date || r?.timestamp;

                return (
                  <div
                    key={
                      r?.id ??
                      `${who}-${String(r?.score ?? "")}-${String(when ?? "")}`
                    }
                    className="card"
                    style={{ padding: 14 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div style={{ fontWeight: 800 }}>{who}</div>
                      <div style={{ color: "var(--muted)", fontSize: ".8rem" }}>
                        {when ? formatDate(when) : ""}
                      </div>
                    </div>
                    <div style={{ marginTop: 8, fontSize: "1rem" }}>
                      {scoreLabel(r?.score)}
                    </div>
                    {r?.comment && (
                      <div
                        style={{
                          marginTop: 6,
                          color: "var(--muted)",
                          lineHeight: 1.6,
                        }}
                      >
                        {r.comment}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
