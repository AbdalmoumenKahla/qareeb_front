import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal.jsx";
import {
  getAverageScore,
  getRatingCount,
  getRatingsForUser,
  rateUser,
} from "../api/api";
import { formatDate } from "../utils/qareeb";

function ContactModal({ listing, currentUser, onClose }) {
  const typeLabel =
    listing.type === "request"
      ? "طلب توصيل"
      : listing.type === "offer"
        ? "عرض توصيل"
        : "إعلان توصيل";

  const rateeId = listing?.userId;
  const raterId = currentUser?.id;

  const canRate = useMemo(() => {
    if (raterId == null || rateeId == null) return false;
    return raterId !== rateeId;
  }, [raterId, rateeId]);

  const [avgScore, setAvgScore] = useState(null);
  const [ratingCount, setRatingCount] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);
  const [ratingsError, setRatingsError] = useState(null);

  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const extractRatings = (payload) => {
    if (!payload) return [];

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.content)) return payload.content;
    if (payload.data && Array.isArray(payload.data.content))
      return payload.data.content;
    if (Array.isArray(payload.ratings)) return payload.ratings;
    if (payload.data && Array.isArray(payload.data.ratings))
      return payload.data.ratings;
    if (Array.isArray(payload.items)) return payload.items;
    if (payload.data && Array.isArray(payload.data.items))
      return payload.data.items;

    return [];
  };

  const loadRatings = async () => {
    if (rateeId == null) return;
    setIsLoadingRatings(true);
    setRatingsError(null);
    try {
      const [avgRes, countRes, pageRes] = await Promise.allSettled([
        getAverageScore(rateeId),
        getRatingCount(rateeId),
        getRatingsForUser(rateeId, { page: 0, size: 5 }),
      ]);

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

      if (pageRes.status === "rejected") {
        const msg = pageRes.reason?.message || "تعذر تحميل التقييمات";
        setRatingsError(msg);
      }
    } catch (e) {
      console.error(e);
      setRatingsError((e && e.message) || "تعذر تحميل التقييمات");
    } finally {
      setIsLoadingRatings(false);
    }
  };

  useEffect(() => {
    if (rateeId == null) return;
    // Avoid calling setState synchronously within the effect body (eslint rule)
    const t = setTimeout(() => {
      void loadRatings();
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rateeId]);

  function handleContact() {
    if (listing.phoneNumber) {
      window.location.href = `tel:${listing.phoneNumber}`;
    } else {
      alert("لا يوجد رقم هاتف لهذا الإعلان");
    }
  }

  const submitRating = async () => {
    if (!canRate) {
      window.alert("لا يمكن إرسال تقييم الآن");
      return;
    }

    const parsedScore = Number(score);
    if (!Number.isFinite(parsedScore) || parsedScore < 1 || parsedScore > 5) {
      window.alert("اختر تقييمًا من 1 إلى 5");
      return;
    }

    setIsSubmitting(true);
    try {
      await rateUser({
        raterId,
        rateeId,
        score: parsedScore,
        comment,
      });
      window.alert("✅ تم إرسال التقييم");
      setComment("");
      setScore(5);
      await loadRatings();
    } catch (e) {
      console.error(e);
      window.alert("❌ فشل إرسال التقييم");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scoreLabel = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return "⭐".repeat(Math.max(0, Math.min(5, Math.round(n))));
  };

  return (
    <Modal
      title={`💬 تواصل مع ${listing.user}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            إلغاء
          </button>
          <button className="btn btn-primary" onClick={handleContact}>
            الاتصال بـ {listing.user}
          </button>
        </>
      }
    >
      <div className="contact-summary">
        <div className="contact-summary__title">{listing.title}</div>
        <div className="contact-summary__row">
          <span
            className={`tag ${listing.type === "request" ? "tag-request" : "tag-offer"}`}
          >
            {typeLabel}
          </span>
          <span>
            📍 {listing.from} → {listing.to}
          </span>
        </div>
        {listing.phoneNumber && (
          <div className="contact-summary__phone">📞 {listing.phoneNumber}</div>
        )}
      </div>

      <div className="divider" />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="syne" style={{ fontWeight: 700, fontSize: ".95rem" }}>
          ⭐ تقييمات {listing.user}
        </div>

        {isLoadingRatings ? (
          <div style={{ color: "var(--muted)", fontSize: ".85rem" }}>
            ⏳ جاري تحميل التقييمات...
          </div>
        ) : ratingsError ? (
          <div style={{ color: "var(--muted)", fontSize: ".85rem" }}>
            {ratingsError}
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span className="tag tag-offer">
                ⭐{" "}
                {avgScore != null && Number.isFinite(avgScore)
                  ? avgScore.toFixed(1)
                  : "—"}
              </span>
              <span className="tag tag-request">
                📝{" "}
                {ratingCount != null && Number.isFinite(ratingCount)
                  ? ratingCount
                  : "—"}{" "}
                مراجعة
              </span>
            </div>

            {ratings.length === 0 ? (
              <div style={{ color: "var(--muted)", fontSize: ".85rem" }}>
                لا توجد تقييمات بعد
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                      style={{ padding: 12 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: ".85rem" }}>
                          {who}
                        </div>
                        <div
                          style={{ color: "var(--muted)", fontSize: ".78rem" }}
                        >
                          {when ? formatDate(when) : ""}
                        </div>
                      </div>
                      <div style={{ marginTop: 6, fontSize: ".9rem" }}>
                        {scoreLabel(r?.score)}
                      </div>
                      {r?.comment && (
                        <div
                          style={{
                            marginTop: 6,
                            color: "var(--muted)",
                            fontSize: ".85rem",
                            lineHeight: 1.5,
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
          </>
        )}

        <div className="divider" />

        <div className="syne" style={{ fontWeight: 700, fontSize: ".95rem" }}>
          ✍️ أضف تقييم
        </div>

        {!canRate ? (
          <div style={{ color: "var(--muted)", fontSize: ".85rem" }}>
            {raterId == null
              ? "سجّل الدخول لإرسال تقييم"
              : rateeId == null
                ? "لا يمكن تحديد المستخدم لتقييمه"
                : "لا يمكنك تقييم نفسك"}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: 10,
              }}
            >
              <select
                className="input"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} نجوم
                  </option>
                ))}
              </select>
              <input
                className="input"
                placeholder="اكتب تعليقًا (اختياري)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={submitRating}
              disabled={isSubmitting}
              type="button"
            >
              {isSubmitting ? "⏳ جارٍ الإرسال..." : "إرسال التقييم"}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ContactModal;
