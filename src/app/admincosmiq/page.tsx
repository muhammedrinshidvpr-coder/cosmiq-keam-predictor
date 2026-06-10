import { AdminUpload } from "@/components/AdminUpload";

export const metadata = { title: "Admin — CosmIQ KEAM Predictor" };

const CENTER: React.CSSProperties = {
  maxWidth: "56rem", marginLeft: "auto", marginRight: "auto",
};

export default function AdminPage() {
  return (
    <main style={{
      minHeight: "100vh", paddingBottom: "6rem",
      background: "linear-gradient(160deg, #d8edf8 0%, #e7e3f5 40%, #f0eafb 75%, #ddd8f0 100%)",
      fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      position: "relative",
    }}>

      {/* Decorative blobs */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "40vw", height: "40vw", borderRadius: "9999px", background: "radial-gradient(circle, rgba(160,210,235,0.3) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "0", left: "-5%", width: "45vw", height: "45vw", borderRadius: "9999px", background: "radial-gradient(circle, rgba(208,188,244,0.22) 0%, transparent 70%)", filter: "blur(48px)" }} />
      </div>

      {/* Header */}
      <header style={{
        width: "100%", position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.78)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(160,210,235,0.35)",
        boxShadow: "0 2px 20px rgba(132,88,179,0.07)",
      }}>
        <div style={{ ...CENTER, padding: "0 1.5rem", height: "3.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <a href="/" style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              color: "#494D5F", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600,
              padding: "0.375rem 0.75rem", borderRadius: "0.625rem",
              background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(160,210,235,0.3)",
            }}>
              <svg style={{ width: "0.875rem", height: "0.875rem" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </a>
            <div style={{ height: "1.25rem", width: "1px", background: "rgba(160,210,235,0.4)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="CosmIQ" style={{ height: "2.25rem", width: "auto", objectFit: "contain" }} />
              <span style={{
                fontSize: "0.6875rem", fontWeight: 700,
                padding: "0.2rem 0.625rem", borderRadius: "9999px",
                background: "rgba(132,88,179,0.1)", color: "#8458B3",
                border: "1px solid rgba(132,88,179,0.22)",
              }}>Admin</span>
            </div>
          </div>
          <span style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(73,77,95,0.38)" }}>
            Data Pipeline
          </span>
        </div>
      </header>

      {/* Body */}
      <div style={{ ...CENTER, padding: "2.5rem 1.5rem 0", position: "relative", zIndex: 1 }}>

        {/* Title */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{
            fontSize: "clamp(1.5rem, 3vw, 2.125rem)", fontWeight: 900,
            letterSpacing: "-0.02em", color: "#2b2c3d", marginBottom: "0.375rem",
          }}>
            Upload Cutoff Data
          </h1>
          <p style={{ fontSize: "0.9rem", color: "rgba(73,77,95,0.55)", lineHeight: 1.65 }}>
            Select a phase, drop a CSV file, preview the parsed rows, then push to Supabase.
          </p>
        </div>

        {/* Upload component */}
        <AdminUpload />

        {/* Info box */}
        <div style={{
          marginTop: "1.5rem", borderRadius: "1.25rem",
          padding: "1.25rem 1.5rem", display: "flex", gap: "1rem",
          background: "rgba(255,255,255,0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: "1.5px solid rgba(255,255,255,0.85)",
          boxShadow: "0 12px 40px rgba(132,88,179,0.09), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}>
          <div style={{
            height: "2.125rem", width: "2.125rem", borderRadius: "0.625rem", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center", marginTop: "0.125rem",
            background: "linear-gradient(135deg, rgba(132,88,179,0.12), rgba(160,210,235,0.15))",
            border: "1px solid rgba(132,88,179,0.15)",
          }}>
            <svg style={{ width: "1rem", height: "1rem", color: "#8458B3" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "0.375rem", color: "#2b2c3d" }}>
              Expected CSV columns
            </p>
            <p style={{ fontSize: "0.75rem", lineHeight: 1.7, fontFamily: "var(--font-geist-mono), monospace", color: "#494D5F" }}>
              Department, College_Code, College_Name, Type, SM, EZ, MU, LA, DV, VK, BH, BX, KN, KU, SC, ST, EW, Other_Categories
            </p>
            <p style={{ fontSize: "0.75rem", marginTop: "0.5rem", color: "rgba(73,77,95,0.55)" }}>
              Data is normalized before upload: trailing periods stripped, missing spaces after commas fixed, whitespace trimmed.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
