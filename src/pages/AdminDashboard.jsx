import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, clearToken } from "../lib/api";

export default function AdminDashboard() {
  const [halls, setHalls] = useState(null);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    api.listHalls().then(setHalls).catch((e) => {
      if (e.message.includes("Unauthorized")) nav("/admin/login");
      else setErr(e.message);
    });
  }, [nav]);

  function logout() {
    clearToken("admin");
    nav("/");
  }

  return (
    <div style={{ minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 30 }}>
          <button onClick={logout} className="link-btn">Log out</button>
        </div>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 32 }}>Choose a study hall</div>
        </div>
        {err && <div className="err-box">{err}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {(halls || []).map((h) => (
            <button
              key={h.id}
              onClick={() => nav(`/admin/halls/${h.slug}`)}
              style={{ textAlign: "left", background: "var(--ink)", color: "var(--parchment)", border: "none", borderRadius: 14, padding: "22px 26px", cursor: "pointer" }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22 }}>{h.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--brass)", marginTop: 6 }}>
                {h.occupiedSeats} / {h.totalSeats} seats occupied
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
