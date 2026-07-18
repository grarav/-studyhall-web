import { useState, useRef, useCallback } from "react";
import { api } from "../lib/api";

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="field-label">{label}</div>
      {children}
    </div>
  );
}

export function Modal({ onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState("");
  const show = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }, []);
  const node = toast ? <div className="toast">{toast}</div> : null;
  return [show, node];
}

// Uploads a photo to the backend (/api/upload) and returns { url, uploading, PhotoButton }
export function PhotoUpload({ label, value, onChange, capture }) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef(null);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.upload(file);
      onChange(url);
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
    setUploading(false);
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button
        type="button"
        onClick={() => ref.current && ref.current.click()}
        disabled={uploading}
        style={{ flex: 1, background: "var(--parchment-deep)", border: "1px solid var(--line)", borderRadius: 8, padding: "9px 10px", fontSize: 12.5, cursor: "pointer", color: "var(--ink)" }}
      >
        {uploading ? "Uploading…" : label}
      </button>
      <input ref={ref} type="file" accept="image/*" {...(capture ? { capture: "environment" } : {})} style={{ display: "none" }} onChange={handleFile} />
      {value && <img src={value.startsWith("http") ? value : `${import.meta.env.VITE_API_URL || "http://localhost:4000"}${value}`} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }} />}
    </div>
  );
}

export function LegendDot({ color, label, border }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 10, height: 10, borderRadius: 3, background: color, border: border ? "1px solid rgba(27,36,48,0.3)" : "none" }} />
      <span style={{ color: "#5A5647", fontSize: 12 }}>{label}</span>
    </div>
  );
}
