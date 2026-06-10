"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { normalizeText, parseRank } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface ParsedRow {
  college_code: string;
  college_name: string;
  department: string;
  college_type: string | null;
  phase: string;
  SM: number | null; EZ: number | null; MU: number | null; LA: number | null;
  DV: number | null; VK: number | null; BH: number | null; BX: number | null;
  KN: number | null; KU: number | null; SC: number | null; ST: number | null;
  EW: number | null;
}

interface RecentEntry {
  id: string;
  college_code: string;
  college_name: string;
  department: string;
  phase: string;
  SM: number | null;
}

interface DbStats { total: number; phase1: number; phase2: number; }

const CATEGORY_COLS = ["SM","EZ","MU","LA","DV","VK","BH","BX","KN","KU","SC","ST","EW"] as const;

function normalizeRow(raw: Record<string, string>, phase: string): ParsedRow {
  return {
    college_code: normalizeText(raw["College_Code"] ?? raw["college_code"] ?? ""),
    college_name: normalizeText(raw["College_Name"] ?? raw["college_name"] ?? ""),
    department:   normalizeText(raw["Department"]   ?? raw["department"]   ?? ""),
    college_type: (raw["Type"] ?? raw["type"] ?? "").trim() || null,
    phase,
    SM: parseRank(raw["SM"]), EZ: parseRank(raw["EZ"]), MU: parseRank(raw["MU"]),
    LA: parseRank(raw["LA"]), DV: parseRank(raw["DV"]), VK: parseRank(raw["VK"]),
    BH: parseRank(raw["BH"]), BX: parseRank(raw["BX"]), KN: parseRank(raw["KN"]),
    KU: parseRank(raw["KU"]), SC: parseRank(raw["SC"]), ST: parseRank(raw["ST"]),
    EW: parseRank(raw["EW"]),
  };
}

type UploadStatus = "idle" | "parsing" | "uploading" | "done" | "error";
interface UploadStats { total: number; inserted: number; }

/* Palette */
const P = {
  purple:      "#8458B3",
  skyBlue:     "#A0D2EB",
  lightPurple: "#D0BCF4",
  darkSlate:   "#494D5F",
  textPrimary: "#2b2c3d",
  textMuted:   "rgba(73,77,95,0.55)",
  textFaint:   "rgba(73,77,95,0.38)",
  cardBg:      "rgba(255,255,255,0.62)",
  cardBorder:  "rgba(255,255,255,0.88)",
  cardShadow:  "0 20px 60px rgba(132,88,179,0.11), inset 0 1px 0 rgba(255,255,255,0.9)",
  inputBg:     "rgba(255,255,255,0.78)",
  inputBorder: "rgba(160,210,235,0.5)",
} as const;

const GLASS: React.CSSProperties = {
  background: P.cardBg,
  border: `1.5px solid ${P.cardBorder}`,
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  boxShadow: P.cardShadow,
  borderRadius: "1.25rem",
};

const selectStyle: React.CSSProperties = {
  width: "11rem", height: "2.75rem",
  paddingLeft: "0.875rem", paddingRight: "2.25rem",
  fontSize: "0.875rem", fontWeight: 600,
  color: P.textPrimary, background: P.inputBg,
  border: `1.5px solid ${P.inputBorder}`, borderRadius: "0.75rem",
  outline: "none", appearance: "none", cursor: "pointer", boxSizing: "border-box",
  boxShadow: "0 1px 4px rgba(132,88,179,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
};

export function AdminUpload() {
  const [phase, setPhase]           = useState("Phase 1");
  const [status, setStatus]         = useState<UploadStatus>("idle");
  const [stats, setStats]           = useState<UploadStats | null>(null);
  const [fileName, setFileName]     = useState<string | null>(null);
  const [preview, setPreview]       = useState<ParsedRow[]>([]);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [dbStats, setDbStats]       = useState<DbStats | null>(null);
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([]);
  const [statsLoading, setStatsLoading]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [{ count: total }, { count: phase1 }, { count: phase2 }, { data: recent }] = await Promise.all([
        supabase.from("cutoffs").select("*", { count: "exact", head: true }),
        supabase.from("cutoffs").select("*", { count: "exact", head: true }).eq("phase", "Phase 1"),
        supabase.from("cutoffs").select("*", { count: "exact", head: true }).eq("phase", "Phase 2"),
        supabase.from("cutoffs")
          .select("id, college_code, college_name, department, phase, SM")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);
      setDbStats({ total: total ?? 0, phase1: phase1 ?? 0, phase2: phase2 ?? 0 });
      setRecentEntries((recent as RecentEntry[]) ?? []);
    } catch { /* silent — table may not exist yet */ }
    setStatsLoading(false);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleFile = (file: File) => {
    setFileName(file.name); setStatus("parsing"); setStats(null);
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        const rows = (results.data as Record<string, string>[])
          .map((r) => normalizeRow(r, phase))
          .filter((r) => r.college_code && r.department);
        setParsedRows(rows); setPreview(rows.slice(0, 5)); setStatus("idle");
        toast.success(`Parsed ${rows.length} rows from ${file.name}`);
      },
      error: (err) => { setStatus("error"); toast.error(`CSV parse error: ${err.message}`); },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleUpload = async () => {
    if (!parsedRows.length) return;
    setStatus("uploading");
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsedRows }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error?.includes("SERVICE_ROLE_KEY")
          ? "Server is missing SUPABASE_SERVICE_ROLE_KEY — add it to .env.local and restart."
          : `Upload failed: ${data?.error ?? "Unknown error"}`, { duration: 8000 });
        setStatus("error"); return;
      }
      setStats({ total: data.total, inserted: data.inserted });
      setStatus("done");
      toast.success(`Successfully uploaded ${data.inserted} cutoff records!`);
      await loadStats();
    } catch (err: unknown) {
      toast.error(`Network error: ${err instanceof Error ? err.message : "Unknown error"}`);
      setStatus("error");
    }
  };

  const handleClear = () => {
    setParsedRows([]); setPreview([]); setFileName(null); setStatus("idle"); setStats(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ALL records for "${phase}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/delete?phase=${encodeURIComponent(phase)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(`Delete failed: ${data?.error ?? "Unknown error"}`);
      } else {
        toast.success(`Deleted all ${phase} records.`);
        await loadStats();
      }
    } catch { toast.error("Network error during delete."); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* ── DB Status card ── */}
      <div style={{ ...GLASS, padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{
              height: "1.875rem", width: "1.875rem", borderRadius: "0.5rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, rgba(132,88,179,0.12), rgba(160,210,235,0.12))",
              border: "1px solid rgba(132,88,179,0.15)",
            }}>
              <svg style={{ width: "0.9rem", height: "0.9rem", color: P.purple }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: P.textPrimary }}>Database Status</span>
          </div>
          <button
            onClick={loadStats}
            disabled={statsLoading}
            style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              padding: "0.3rem 0.75rem", borderRadius: "0.625rem",
              fontSize: "0.75rem", fontWeight: 600, color: P.purple,
              background: "rgba(132,88,179,0.07)", border: "1px solid rgba(132,88,179,0.18)",
              cursor: statsLoading ? "not-allowed" : "pointer",
              opacity: statsLoading ? 0.6 : 1,
            }}
          >
            <svg style={{ width: "0.75rem", height: "0.75rem", animation: statsLoading ? "spin 0.8s linear infinite" : "none" }}
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>
        </div>

        {dbStats === null ? (
          <div style={{ display: "flex", gap: "1rem" }}>
            {[1,2,3].map((i) => (
              <div key={i} style={{
                flex: 1, height: "4rem", borderRadius: "0.875rem",
                background: "rgba(229,234,245,0.6)", animation: "pulse 1.5s ease-in-out infinite",
              }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {[
              { label: "Total Records", value: dbStats.total,  color: P.purple,   bg: "rgba(132,88,179,0.08)",   border: "rgba(132,88,179,0.18)" },
              { label: "Phase 1",       value: dbStats.phase1, color: "#2e7ca0",  bg: "rgba(160,210,235,0.12)",  border: "rgba(160,210,235,0.3)" },
              { label: "Phase 2",       value: dbStats.phase2, color: "#6b35a8",  bg: "rgba(208,188,244,0.15)",  border: "rgba(208,188,244,0.35)" },
            ].map(({ label, value, color, bg, border }) => (
              <div key={label} style={{
                flex: "1 1 7rem", padding: "0.875rem 1rem", borderRadius: "0.875rem",
                background: bg, border: `1px solid ${border}`,
              }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 900, color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                  {value === 0
                    ? <span style={{ fontSize: "0.9rem", color: "rgba(73,77,95,0.38)", fontWeight: 600 }}>Empty</span>
                    : value.toLocaleString()}
                </div>
                <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: P.textMuted, marginTop: "0.125rem" }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Incomplete Phase 2 warning ── */}
        {dbStats !== null && dbStats.phase1 > 0 && dbStats.phase2 > 0 && dbStats.phase2 < dbStats.phase1 * 0.6 && (
          <div style={{
            marginTop: "0.875rem", display: "flex", alignItems: "flex-start", gap: "0.625rem",
            padding: "0.75rem 1rem", borderRadius: "0.75rem",
            background: "rgba(245,158,11,0.09)", border: "1px solid rgba(245,158,11,0.28)",
          }}>
            <svg style={{ width: "1rem", height: "1rem", color: "#d97706", flexShrink: 0, marginTop: "0.1rem" }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <div>
              <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#92400e" }}>Phase 2 upload is incomplete</p>
              <p style={{ fontSize: "0.75rem", color: "#b45309", marginTop: "0.2rem", lineHeight: 1.5 }}>
                Phase 2 has only {dbStats.phase2} rows vs {dbStats.phase1} in Phase 1. The expected count is ~773 rows.
                Click <strong>Delete Phase 2 data</strong> then re-upload <code>Final_Master_Phase2.csv</code>.
              </p>
            </div>
          </div>
        )}
        {dbStats !== null && dbStats.phase2 === 0 && (
          <div style={{
            marginTop: "0.875rem", display: "flex", alignItems: "flex-start", gap: "0.625rem",
            padding: "0.75rem 1rem", borderRadius: "0.75rem",
            background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)",
          }}>
            <svg style={{ width: "1rem", height: "1rem", color: "#dc2626", flexShrink: 0, marginTop: "0.1rem" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p style={{ fontSize: "0.8125rem", color: "#dc2626", fontWeight: 600 }}>
              Phase 2 is empty — upload <code>Final_Master_Phase2.csv</code> with Phase 2 selected.
            </p>
          </div>
        )}
      </div>

      {/* ── Config + Upload card ── */}
      <div style={{ ...GLASS, padding: "1.5rem" }}>

        {/* Phase + Delete row */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: P.textMuted }}>
              Phase
            </label>
            <div style={{ position: "relative", display: "inline-block" }}>
              <select value={phase} onChange={(e) => setPhase(e.target.value)} style={selectStyle}>
                <option value="Phase 1">Phase 1</option>
                <option value="Phase 2">Phase 2</option>
              </select>
              <svg style={{ position: "absolute", right: "0.625rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "rgba(132,88,179,0.45)", pointerEvents: "none" }}
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button onClick={handleDelete} style={{
            height: "2.75rem", display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0 1.125rem", borderRadius: "0.75rem",
            fontSize: "0.8125rem", fontWeight: 700, color: "#dc2626",
            background: "rgba(239,68,68,0.08)", backdropFilter: "blur(8px)",
            border: "1.5px solid rgba(239,68,68,0.18)", cursor: "pointer", whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(239,68,68,0.08)",
          }}>
            <svg style={{ width: "0.875rem", height: "0.875rem" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete {phase} data
          </button>

          <div style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            padding: "0.45rem 0.875rem", borderRadius: "0.625rem",
            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.22)",
            fontSize: "0.75rem", color: "#92400e",
          }}>
            <svg style={{ width: "0.75rem", height: "0.75rem", color: "#f59e0b", flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            To re-upload: delete first, then upload
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${fileName ? P.purple : "rgba(160,210,235,0.55)"}`,
            borderRadius: "1rem", padding: "3rem 2rem",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "0.875rem",
            cursor: "pointer",
            background: fileName
              ? "linear-gradient(135deg, rgba(132,88,179,0.06), rgba(160,210,235,0.06))"
              : "rgba(229,234,245,0.4)",
            transition: "border-color 0.2s, background 0.2s",
            backdropFilter: "blur(4px)",
          }}
        >
          <div style={{
            height: "3.25rem", width: "3.25rem", borderRadius: "0.875rem",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, rgba(132,88,179,0.12), rgba(160,210,235,0.15))",
            border: "1px solid rgba(132,88,179,0.15)",
            boxShadow: "0 4px 16px rgba(132,88,179,0.1)",
          }}>
            <svg style={{ width: "1.5rem", height: "1.5rem", color: P.purple }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: P.textPrimary }}>
              {fileName ?? "Drop CSV file here or click to browse"}
            </p>
            <p style={{ fontSize: "0.8125rem", color: P.textMuted, marginTop: "0.25rem" }}>
              Accepts Final_Master_Phase1.csv or Final_Master_Phase2.csv
            </p>
          </div>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>

        {/* Upload / Clear */}
        {parsedRows.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", marginTop: "1.25rem" }}>
            <button onClick={handleUpload} disabled={status === "uploading" || status === "done"} style={{
              flex: "1 1 auto", height: "3rem",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              padding: "0 1.5rem", borderRadius: "0.875rem",
              fontSize: "0.9375rem", fontWeight: 700, color: "#fff", border: "none",
              cursor: status === "uploading" || status === "done" ? "not-allowed" : "pointer",
              opacity: status === "done" ? 0.6 : 1,
              background: status === "uploading"
                ? "rgba(132,88,179,0.55)"
                : `linear-gradient(135deg, ${P.purple} 0%, #9a6cc8 40%, ${P.skyBlue} 100%)`,
              boxShadow: status === "uploading" ? "none" : "0 8px 24px rgba(132,88,179,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}>
              {status === "uploading" ? (
                <><span style={{ width:"1rem", height:"1rem", borderRadius:"9999px", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", display:"inline-block", animation:"spin 0.8s linear infinite" }} />Uploading…</>
              ) : (
                <><svg style={{ width:"1rem", height:"1rem" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>Upload {parsedRows.length.toLocaleString()} rows to Supabase</>
              )}
            </button>

            <button onClick={handleClear} style={{
              height: "3rem", padding: "0 1.25rem", borderRadius: "0.875rem",
              fontSize: "0.875rem", fontWeight: 700, color: P.textMuted,
              background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)",
              border: "1.5px solid rgba(73,77,95,0.15)", cursor: "pointer",
              boxShadow: "0 2px 8px rgba(73,77,95,0.07)",
            }}>Clear</button>
          </div>
        )}
      </div>

      {/* ── Success banner ── */}
      {status === "done" && stats && (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.875rem",
          padding: "1.125rem 1.25rem", borderRadius: "1rem",
          background: "rgba(160,210,235,0.15)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(160,210,235,0.4)",
          boxShadow: "0 4px 20px rgba(160,210,235,0.15)",
        }}>
          <div style={{
            height: "2.25rem", width: "2.25rem", borderRadius: "0.625rem", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(160,210,235,0.25)", border: "1px solid rgba(160,210,235,0.4)",
          }}>
            <svg style={{ width: "1.1rem", height: "1.1rem", color: "#2e7ca0" }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a5f7a" }}>Upload successful</p>
            <p style={{ fontSize: "0.8rem", color: "#2e7ca0", marginTop: "0.125rem" }}>
              {stats.inserted.toLocaleString()} rows inserted · {stats.total.toLocaleString()} total processed
            </p>
          </div>
        </div>
      )}

      {/* ── Error banner ── */}
      {status === "error" && (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.875rem",
          padding: "1.125rem 1.25rem", borderRadius: "1rem",
          background: "rgba(239,68,68,0.08)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(239,68,68,0.2)",
        }}>
          <div style={{
            height: "2.25rem", width: "2.25rem", borderRadius: "0.625rem", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.22)",
          }}>
            <svg style={{ width: "1.1rem", height: "1.1rem", color: "#dc2626" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p style={{ fontSize: "0.9rem", color: "#dc2626", fontWeight: 600 }}>
            Upload failed. Check the toast notification for details.
          </p>
        </div>
      )}

      {/* ── CSV Preview ── */}
      {preview.length > 0 && (
        <div style={{ ...GLASS, overflow: "hidden" }}>
          <div style={{
            padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem",
            background: "linear-gradient(90deg, rgba(160,210,235,0.12), rgba(208,188,244,0.1))",
            borderBottom: "1px solid rgba(160,210,235,0.2)",
          }}>
            <svg style={{ width: "1rem", height: "1rem", color: P.purple }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: P.textPrimary }}>Preview — first 5 rows</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
              <thead>
                <tr>
                  {["Code", "College", "Dept", "Type", "Phase", ...CATEGORY_COLS].map((h) => (
                    <th key={h} style={{
                      padding: "0.625rem 0.875rem", textAlign: "left",
                      fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                      color: P.textFaint, background: "rgba(229,234,245,0.3)",
                      borderBottom: "1px solid rgba(160,210,235,0.15)", whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(160,210,235,0.1)" }}>
                    <td style={{ padding: "0.75rem 0.875rem" }}>
                      <span style={{ fontFamily: "monospace", color: P.purple, fontWeight: 700 }}>{row.college_code}</span>
                    </td>
                    <td style={{ padding: "0.75rem 0.875rem" }}>
                      <span style={{ display: "block", maxWidth: "11rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600, color: P.textPrimary }}>{row.college_name}</span>
                    </td>
                    <td style={{ padding: "0.75rem 0.875rem" }}>
                      <span style={{ display: "block", maxWidth: "10rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: P.darkSlate }}>{row.department}</span>
                    </td>
                    <td style={{ padding: "0.75rem 0.875rem" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: P.textMuted }}>{row.college_type ?? "—"}</span>
                    </td>
                    <td style={{ padding: "0.75rem 0.875rem" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center",
                        padding: "0.2rem 0.625rem", borderRadius: "9999px",
                        fontSize: "0.6875rem", fontWeight: 700,
                        background: "rgba(132,88,179,0.1)", color: P.purple,
                        border: "1px solid rgba(132,88,179,0.2)",
                      }}>{row.phase}</span>
                    </td>
                    {CATEGORY_COLS.map((cat) => (
                      <td key={cat} style={{ padding: "0.75rem 0.875rem" }}>
                        <span style={{ fontFamily: "monospace", color: row[cat] ? P.textPrimary : P.textFaint }}>
                          {row[cat] ?? "—"}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Recent entries in DB ── */}
      {dbStats !== null && dbStats.total > 0 && (
        <div style={{ ...GLASS, overflow: "hidden" }}>
          <div style={{
            padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(90deg, rgba(208,188,244,0.1), rgba(160,210,235,0.08))",
            borderBottom: "1px solid rgba(160,210,235,0.2)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg style={{ width: "1rem", height: "1rem", color: P.purple }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: P.textPrimary }}>Latest 10 entries in DB</span>
            </div>
            <span style={{ fontSize: "0.7rem", color: P.textFaint }}>most recently inserted first</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
              <thead>
                <tr>
                  {["Code", "College Name", "Department", "Phase", "SM cutoff"].map((h) => (
                    <th key={h} style={{
                      padding: "0.625rem 0.875rem", textAlign: "left",
                      fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                      color: P.textFaint, background: "rgba(229,234,245,0.3)",
                      borderBottom: "1px solid rgba(160,210,235,0.15)", whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentEntries.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: P.textFaint }}>No entries yet</td></tr>
                ) : recentEntries.map((row) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid rgba(160,210,235,0.1)" }}>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      <span style={{ fontFamily: "monospace", color: P.purple, fontWeight: 700 }}>{row.college_code}</span>
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      <span style={{ display: "block", maxWidth: "14rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600, color: P.textPrimary }}>{row.college_name}</span>
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      <span style={{ display: "block", maxWidth: "12rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: P.darkSlate }}>{row.department}</span>
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center",
                        padding: "0.15rem 0.5rem", borderRadius: "9999px",
                        fontSize: "0.6875rem", fontWeight: 700,
                        background: row.phase === "Phase 1" ? "rgba(160,210,235,0.15)" : "rgba(208,188,244,0.2)",
                        color: row.phase === "Phase 1" ? "#2e7ca0" : "#6b35a8",
                        border: `1px solid ${row.phase === "Phase 1" ? "rgba(160,210,235,0.3)" : "rgba(208,188,244,0.35)"}`,
                      }}>{row.phase}</span>
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      <span style={{ fontFamily: "monospace", color: row.SM ? P.textPrimary : P.textFaint }}>
                        {row.SM !== null ? row.SM.toLocaleString() : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
