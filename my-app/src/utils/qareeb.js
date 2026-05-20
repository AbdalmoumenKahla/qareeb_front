export function normalizeAuthUser(rawUser) {
  if (!rawUser || typeof rawUser !== "object") return null;

  // Some backends return { token, user: { ... } }
  const baseUser =
    rawUser.user && typeof rawUser.user === "object" ? rawUser.user : rawUser;

  const name = baseUser.name || baseUser.userName || baseUser.username || "";
  const phoneNumber = baseUser.phoneNumber || baseUser.phone || "";

  return {
    ...baseUser,
    // Preserve token if it exists at the top-level
    token: rawUser.token ?? baseUser.token,
    name,
    phoneNumber,
  };
}

export function mapTripType(type) {
  const normalized = String(type || "").toUpperCase();
  if (normalized === "OFFER") return "offer";
  if (normalized === "REQUEST") return "request";
  return "unknown";
}

export function formatDate(iso) {
  if (!iso) return "غير معروف";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "غير معروف";
  return d.toLocaleString("ar", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function initialFromName(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return "U";
  return trimmed[0].toUpperCase();
}
