const API_BASE = 'http://localhost:8080'

/**
 * Generic fetch wrapper with JWT support
 */
export const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('token')

  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}

/**
 * LOGIN
 * Backend expected: { phoneNumber, password }
 * Returns: { token, user }
 */
export async function login(data) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(result.message || 'Login failed')
  }

  return result
}

/**
 * REGISTER
 * Backend expected: { name, phoneNumber, password }
 * Returns: { token, user }
 */
export async function register(data) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(result.message || 'Register failed')
  }

  return result
}

/**
 * GET TRIPS (protected)
 */
export async function getTrips(token) {
  const response = await fetch(`${API_BASE}/trips`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch trips')
  }

  return result
}

/**
 * CREATE TRIP (protected)
 */
export async function createTrip(data, token) {
  const response = await fetch(`${API_BASE}/trips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create trip')
  }

  return result
}