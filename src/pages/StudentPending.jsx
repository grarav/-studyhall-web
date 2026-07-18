import { useLocation, useNavigate } from "react-router-dom";

export default function StudentPending() {
  const location = useLocation();
  const nav = useNavigate();
  const app = location.state || {};

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 24, marginBottom: 10 }}>Application pending</div>
        <div style={{ fontSize: 13.5, color: "var(--ink-soft)", marginBottom: 24, lineHeight: 1.6 }}>
          Hi {app.name || "there"}, your application{app.hallName ? ` for ${app.hallName}` : ""} is still awaiting confirmation from the admin. Check back once it's confirmed.
        </div>
        <button onClick={() => nav("/student/login")} className="link-btn">Back to login</button>
      </div>
    </div>
  );
}
