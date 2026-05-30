const resolveApiBase = () => {
  const envBase = import.meta.env.VITE_API_BASE;
  if (envBase) return envBase;

  const envPort = import.meta.env.VITE_API_PORT;
  const port = envPort || "8080";

  // IMPORTANT: on phones, "localhost" points to the phone itself.
  // Default to the current site hostname so API calls go to the same machine
  // serving the frontend (e.g. http://192.168.x.x:8080).
  const hostname =
    typeof window !== "undefined" && window.location?.hostname
      ? window.location.hostname
      : "localhost";

  const protocol =
    typeof window !== "undefined" && window.location?.protocol
      ? window.location.protocol
      : "http:";

  return `${protocol}//${hostname}:${port}`;
};

const API_BASE = resolveApiBase();

/**
 * Generic fetch wrapper with JWT support
 */
export const authFetch = (url, options = {}) => {
  const token = localStorage.getItem("token");

  const method = (options.method || "GET").toUpperCase();
  const shouldSetJson =
    method !== "GET" && method !== "HEAD" && options.body != null;

  const mergedHeaders = {
    ...(shouldSetJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers: mergedHeaders,
  });
};

/**
 * Generic fetch wrapper (no auth header)
 */
export const baseFetch = (url, options = {}) => {
  const method = (options.method || "GET").toUpperCase();
  const shouldSetJson =
    method !== "GET" && method !== "HEAD" && options.body != null;

  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...(shouldSetJson ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
};

/**
 * GET TRIPS (protected)
 */
export async function getTrips() {
  const token = localStorage.getItem("token");

  const tryFetch = async (fetchFn) => {
    const response = await fetchFn("/trips");
    const result = await response.json().catch(() => []);
    return { response, result };
  };

  // Prefer auth when token exists (endpoint might be protected)
  if (token) {
    const { response, result } = await tryFetch(authFetch);
    if (response.ok) return result;

    // If server rejects auth request (401/403), try public GET (some backends don't protect /trips)
    const fallback = await tryFetch(baseFetch);
    if (fallback.response.ok) return fallback.result;

    throw new Error(result?.message || "Failed to fetch trips");
  }

  const { response, result } = await tryFetch(baseFetch);
  if (!response.ok) {
    throw new Error(result?.message || "Failed to fetch trips");
  }
  return result;
}
/**
 * CREATE TRIP (protected)
 */
export async function createTrip(data) {
  const response = await authFetch("/trips", {
    method: "POST",
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Failed to create trip");
  }

  return result;
}

/**
 * DELETE TRIP (protected)
 */
export async function deleteTrip(id) {
  const response = await authFetch(`/trips/${id}`, {
    method: "DELETE",
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete trip");
  }

  return result;
}
export async function getStats() {
  const token = localStorage.getItem("token");

  const tryFetch = async (fetchFn) => {
    const response = await fetchFn("/stats");
    const result = await response.json().catch(() => ({}));
    return { response, result };
  };

  const normalize = (payload) => {
    if (!payload || typeof payload !== "object") return {};
    // Common backend shapes: { ...stats }, { data: ...stats }
    if (payload.data && typeof payload.data === "object") return payload.data;
    return payload;
  };

  if (token) {
    const { response, result } = await tryFetch(authFetch);
    if (response.ok) return normalize(result);

    const fallback = await tryFetch(baseFetch);
    if (fallback.response.ok) return normalize(fallback.result);

    throw new Error(result?.message || "Failed to fetch stats");
  }

  const { response, result } = await tryFetch(baseFetch);
  if (!response.ok) {
    throw new Error(result?.message || "Failed to fetch stats");
  }
  return normalize(result);
}

/**
 * GET USERS (public or protected depending on backend)
 */
export async function getUsers() {
  const token = localStorage.getItem("token");

  const tryFetch = async (fetchFn) => {
    const response = await fetchFn("/users");
    const result = await response.json().catch(() => []);
    return { response, result };
  };

  if (token) {
    const { response, result } = await tryFetch(authFetch);
    if (response.ok) return result;

    const fallback = await tryFetch(baseFetch);
    if (fallback.response.ok) return fallback.result;

    throw new Error(result?.message || "Failed to fetch users");
  }

  const { response, result } = await tryFetch(baseFetch);
  if (!response.ok) {
    throw new Error(result?.message || "Failed to fetch users");
  }

  return result;
}

/**
 * RATINGS
 */
export async function rateUser({ raterId, rateeId, score, comment }) {
  const params = new URLSearchParams({
    raterId: String(raterId),
    rateeId: String(rateeId),
    score: String(score),
  });

  if (comment != null && String(comment).trim() !== "") {
    params.set("comment", String(comment));
  }

  const response = await authFetch(`/ratings?${params.toString()}`, {
    method: "POST",
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Failed to submit rating");
  }

  return result;
}

export async function updateRating({ ratingId, raterId, score, comment }) {
  const params = new URLSearchParams({
    raterId: String(raterId),
    score: String(score),
  });

  if (comment != null && String(comment).trim() !== "") {
    params.set("comment", String(comment));
  }

  const response = await authFetch(
    `/ratings/${ratingId}?${params.toString()}`,
    {
      method: "PUT",
    },
  );

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Failed to update rating");
  }

  return result;
}

export async function getAverageScore(userId) {
  const token = localStorage.getItem("token");

  const tryFetch = async (fetchFn) => {
    const response = await fetchFn(`/ratings/average/${userId}`);
    const result = await response.json().catch(() => null);
    return { response, result };
  };

  try {
    if (token) {
      const auth = await tryFetch(authFetch);
      if (auth.response.ok) return auth.result;

      const fallback = await tryFetch(baseFetch);
      if (fallback.response.ok) return fallback.result;

      throw new Error(
        (auth.result && auth.result.message) ||
          `Failed to fetch average rating (${auth.response.status})`,
      );
    }

    const { response, result } = await tryFetch(baseFetch);
    if (!response.ok) {
      throw new Error(
        (result && result.message) ||
          `Failed to fetch average rating (${response.status})`,
      );
    }
    return result;
  } catch (e) {
    throw new Error((e && e.message) || "Failed to fetch average rating", {
      cause: e,
    });
  }
}

export async function getRatingCount(userId) {
  const token = localStorage.getItem("token");

  const tryFetch = async (fetchFn) => {
    const response = await fetchFn(`/ratings/count/${userId}`);
    const result = await response.json().catch(() => null);
    return { response, result };
  };

  try {
    if (token) {
      const auth = await tryFetch(authFetch);
      if (auth.response.ok) return auth.result;

      const fallback = await tryFetch(baseFetch);
      if (fallback.response.ok) return fallback.result;

      throw new Error(
        (auth.result && auth.result.message) ||
          `Failed to fetch rating count (${auth.response.status})`,
      );
    }

    const { response, result } = await tryFetch(baseFetch);
    if (!response.ok) {
      throw new Error(
        (result && result.message) ||
          `Failed to fetch rating count (${response.status})`,
      );
    }
    return result;
  } catch (e) {
    throw new Error((e && e.message) || "Failed to fetch rating count", {
      cause: e,
    });
  }
}

export async function getRatingsForUser(userId, { page = 0, size = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  const url = `/ratings/user/${userId}?${params.toString()}`;
  const token = localStorage.getItem("token");

  const tryFetch = async (fetchFn) => {
    const response = await fetchFn(url);
    const result = await response.json().catch(() => ({}));
    return { response, result };
  };

  try {
    if (token) {
      const auth = await tryFetch(authFetch);
      if (auth.response.ok) return auth.result;

      const fallback = await tryFetch(baseFetch);
      if (fallback.response.ok) return fallback.result;

      throw new Error(
        auth.result?.message ||
          `Failed to fetch user ratings (${auth.response.status})`,
      );
    }

    const { response, result } = await tryFetch(baseFetch);
    if (!response.ok) {
      throw new Error(
        result.message || `Failed to fetch user ratings (${response.status})`,
      );
    }
    return result;
  } catch (e) {
    throw new Error((e && e.message) || "Failed to fetch user ratings", {
      cause: e,
    });
  }
}
