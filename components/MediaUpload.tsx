"use client";
import { useState, useRef } from "react";

export default function MediaUpload({
  name,
  currentUrl,
  currentId,
  label = "Afbeelding uploaden",
}: {
  name: string;
  currentUrl?: string;
  currentId?: string;
  label?: string;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [mediaId, setMediaId] = useState<string | null>(currentId || null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setPreview(URL.createObjectURL(file));

    const fd = new FormData();
    fd.append("file", file);
    fd.append("alt", file.name);

    try {
      const res = await fetch("/api/upload-media", { method: "POST", body: fd });
      const data = await res.json();
      if (data.id) setMediaId(data.id);
    } catch {
      alert("Upload mislukt. Probeer opnieuw.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <input type="hidden" name={name} value={mediaId || ""} />
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          border: "2px dashed #2a2a2a", borderRadius: "8px", padding: "1.5rem",
          background: "#0d0d0d", cursor: "pointer", textAlign: "center",
          transition: "border-color 0.2s", position: "relative", overflow: "hidden",
          minHeight: preview ? "180px" : "100px",
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "#facb04")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "#2a2a2a")}
      >
        {preview ? (
          <img src={preview} alt="" style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "4px" }} />
        ) : (
          <div style={{ color: "#444", fontSize: "0.82rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>+</div>
            {label}
          </div>
        )}
        {uploading && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#facb04", fontSize: "0.82rem" }}>
            Uploaden...
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*,video/*,.pdf" onChange={handleFile} style={{ display: "none" }} />
      {preview && (
        <button
          type="button"
          onClick={() => { setPreview(null); setMediaId(null); }}
          style={{ marginTop: "0.5rem", background: "transparent", border: "none", color: "#666", cursor: "pointer", fontSize: "0.75rem" }}
        >
          Verwijderen
        </button>
      )}
    </div>
  );
}
