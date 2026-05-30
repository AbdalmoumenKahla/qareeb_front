function ListingCard({ listing, currentUser, onContact, onDelete }) {
  const isMine =
    currentUser &&
    (listing.userId != null
      ? listing.userId === currentUser.id
      : listing.user === currentUser.name);

  const typeTagLabel =
    listing.type === "request"
      ? "📦 طلب"
      : listing.type === "offer"
        ? "🚚 عرض"
        : "❓ غير محدد";

  const shareListing = async () => {
    const anchorId = listing?.id != null ? `listing-${listing.id}` : null;
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const url = anchorId ? `${baseUrl}#${anchorId}` : baseUrl;

    const text = `${typeTagLabel}: ${listing.title}\n📍 ${listing.from} → ${listing.to}`;
    const payload = { title: "Qareeb", text, url };

    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
    } catch (e) {
      // user cancelled or share failed; fall back to copy
      console.warn(e);
    }

    const copyText = `${text}\n${url}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyText);
        // Minimal feedback without adding new UI components
        window.alert("✅ تم نسخ النص/الرابط للمشاركة");
        return;
      }
    } catch (e) {
      console.warn(e);
    }

    window.prompt("انسخ النص للمشاركة:", copyText);
  };

  return (
    <div
      className="card listing-card fade-up"
      id={listing?.id != null ? `listing-${listing.id}` : undefined}
    >
      <div className="listing-card-header">
        <div className="listing-card-user">
          <div
            className="avatar"
            style={{ width: 38, height: 38, fontSize: ".82rem" }}
          >
            {listing.userInitial}
          </div>
          <div>
            <div
              style={{
                fontWeight: 600,
                fontSize: ".9rem",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              {listing.user}
              {isMine && <span className="dot" title="أنت" />}
            </div>
            <div
              style={{
                fontSize: ".75rem",
                color: "var(--muted)",
                display: "flex",
                gap: 6,
              }}
            >
              <span>⭐ {listing.rating}</span>
              <span>·</span>
              <span>{listing.date}</span>
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {listing.urgent && (
            <span className="tag tag-request" style={{ fontSize: ".7rem" }}>
              ⚡ عاجل
            </span>
          )}
          <span
            className={`tag ${listing.type === "request" ? "tag-request" : "tag-offer"}`}
          >
            {typeTagLabel}
          </span>
          {isMine && <span className="tag tag-mine">خاصتي</span>}
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 6 }}>
          {listing.title}
        </div>
        <div className="listing-card-body">{listing.desc}</div>
      </div>

      <div className="listing-meta">
        <span>📍 {listing.from}</span>
        <span style={{ color: "var(--brand)" }}>→</span>
        <span>📍 {listing.to}</span>
        {listing.status && <span>· {listing.status}</span>}
      </div>

      <div className="divider" />
      <div className="listing-actions">
        {!isMine && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onContact(listing)}
          >
            💬 تواصل
          </button>
        )}
        <button className="btn btn-secondary btn-sm" onClick={shareListing}>
          ↗ مشاركة
        </button>
        {isMine && (
          <button
            className="btn btn-danger btn-sm"
            style={{ marginLeft: "auto" }}
            onClick={() => onDelete(listing.id)}
          >
            🗑 حذف
          </button>
        )}
      </div>
    </div>
  );
}

export default ListingCard;
