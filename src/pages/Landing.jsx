import { useNavigate } from "react-router-dom";

export default function Landing() {
  const nav = useNavigate();
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        <img src="/logo.png" alt="Nice Study Centre" style={{ width: 200, height: 200, objectFit: "contain", marginBottom: 14 }} />
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 30, marginBottom: 34, letterSpacing: "0.02em" }}>NICE STUDY CENTRE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <button
            onClick={() => nav("/admin/login")}
            style={{ background: "var(--ink)", color: "var(--parchment)", border: "none", borderRadius: 14, padding: "24px 22px", cursor: "pointer", textAlign: "left" }}
          >
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20 }}>Admin</div>
            <div style={{ fontSize: 12.5, color: "var(--brass)", marginTop: 4 }}>Manage halls, seats, students, and payments</div>
          </button>
          <button
            onClick={() => nav("/student/login")}
            style={{ background: "#fff", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 14, padding: "24px 22px", cursor: "pointer", textAlign: "left" }}
          >
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20 }}>Student</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 4 }}>Sign up for a seat, or log in to renew</div>
          </button>
        </div>
      </div>
    </div>
  );
}
