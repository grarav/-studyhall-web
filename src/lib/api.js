const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getToken(kind) {
  return localStorage.getItem(kind === "admin" ? "admin_token" : "student_token") || "";
}
export function setToken(kind, token) {
  localStorage.setItem(kind === "admin" ? "admin_token" : "student_token", token);
}
export function clearToken(kind) {
  localStorage.removeItem(kind === "admin" ? "admin_token" : "student_token");
}

async function request(path, { method = "GET", body, kind, isForm } = {}) {
  const headers = {};
  const token = kind ? getToken(kind) : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isForm) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch (e) { /* no body */ }

  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  // Admin auth
  adminSignup: (body) => request("/api/admin/signup", { method: "POST", body }),
  adminLogin: (body) => request("/api/admin/login", { method: "POST", body }),
  adminMe: () => request("/api/admin/me", { kind: "admin" }),
  adminStaff: () => request("/api/admin/staff", { kind: "admin" }),

  // Halls
  listHalls: () => request("/api/halls", { kind: "admin" }),
  hallSeats: (slug) => request(`/api/halls/${slug}/seats`, { kind: "admin" }),
  seatDetail: (slug, seatNumber) => request(`/api/halls/${slug}/seats/${seatNumber}`, { kind: "admin" }),
  assignSeat: (slug, seatNumber, body) => request(`/api/halls/${slug}/seats/${seatNumber}/assign`, { method: "POST", body, kind: "admin" }),
  editSeat: (slug, seatNumber, body) => request(`/api/halls/${slug}/seats/${seatNumber}`, { method: "PUT", body, kind: "admin" }),
  vacateSeatNow: (slug, seatNumber) => request(`/api/halls/${slug}/seats/${seatNumber}`, { method: "DELETE", kind: "admin" }),
  renewSeat: (slug, seatNumber, body) => request(`/api/halls/${slug}/seats/${seatNumber}/renew`, { method: "POST", body, kind: "admin" }),
  reports: (slug) => request(`/api/halls/${slug}/reports`, { kind: "admin" }),
  transactionsByDate: (slug, date) => request(`/api/halls/${slug}/transactions?date=${date}`, { kind: "admin" }),

  // Applications / queues
  listSignups: (hallSlug) => request(`/api/applications/signups/${hallSlug}`, { kind: "admin" }),
  confirmSignup: (id) => request(`/api/applications/signups/${id}/confirm`, { method: "POST", kind: "admin" }),
  rejectSignup: (id) => request(`/api/applications/signups/${id}/reject`, { method: "POST", kind: "admin" }),
  listSeatChanges: (hallSlug) => request(`/api/applications/seat-changes/${hallSlug}`, { kind: "admin" }),
  confirmSeatChange: (id) => request(`/api/applications/seat-changes/${id}/confirm`, { method: "POST", kind: "admin" }),
  rejectSeatChange: (id) => request(`/api/applications/seat-changes/${id}/reject`, { method: "POST", kind: "admin" }),
  listVacates: (hallSlug) => request(`/api/applications/vacates/${hallSlug}`, { kind: "admin" }),
  confirmVacate: (id) => request(`/api/applications/vacates/${id}/confirm`, { method: "POST", kind: "admin" }),
  rejectVacate: (id) => request(`/api/applications/vacates/${id}/reject`, { method: "POST", kind: "admin" }),
  finalizeVacate: (studentId) => request(`/api/applications/vacates/finalize/${studentId}`, { method: "POST", kind: "admin" }),

  // Student
  vacantSeats: (hallSlug) => request(`/api/student/halls/${hallSlug}/vacant-seats`),
  updateHallUpi: (slug, upiId) => request(`/api/halls/${slug}/upi`, { method: "PUT", body: { upiId }, kind: "admin" }),
  studentSignup: (body) => request("/api/student/signup", { method: "POST", body }),
  studentLogin: (body) => request("/api/student/login", { method: "POST", body }),
  studentMe: () => request("/api/student/me", { kind: "student" }),
  requestSeatChange: (body) => request("/api/student/seat-change", { method: "POST", body, kind: "student" }),
  requestVacate: () => request("/api/student/vacate", { method: "POST", kind: "student" }),

  // Uploads & payments
  upload: (file, folder = "misc") => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    return request("/api/upload", { method: "POST", body: form, isForm: true });
  },
  createOrder: (body) => request("/api/payments/create-order", { method: "POST", body }),
  verifyPayment: (body) => request("/api/payments/verify", { method: "POST", body }),
};

export { BASE_URL };
