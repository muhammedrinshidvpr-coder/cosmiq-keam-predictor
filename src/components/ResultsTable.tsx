"use client";

import { type PredictionResult, type Category } from "@/lib/supabase";

interface ResultsTableProps {
  results: PredictionResult[] | null;
  hasSearched: boolean;
  loading: boolean;
  rank: string;
  category: Category;
}

const P = {
  skyBlue:     "#A0D2EB",
  lavender:    "#E5EAF5",
  lightPurple: "#D0BCF4",
  purple:      "#8458B3",
  darkSlate:   "#494D5F",
  textPrimary: "#2b2c3d",
  textMuted:   "rgba(73,77,95,0.55)",
  textFaint:   "rgba(73,77,95,0.38)",
  cardBg:      "rgba(255,255,255,0.62)",
  cardBorder:  "rgba(255,255,255,0.88)",
} as const;

const TYPE_LABEL: Record<string, string> = {
  G: "Government",
  N: "Govt-Aided",
  S: "Self-Finance",
};

function StatusBadge({ margin }: { margin: number }) {
  if (margin > 3000)
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "0.25rem",
        padding: "0.3rem 0.75rem", borderRadius: "9999px",
        fontSize: "0.6875rem", fontWeight: 700,
        background: "rgba(160,210,235,0.2)", color: "#2e7ca0",
        border: "1px solid rgba(160,210,235,0.5)",
      }}>✓ Safe</span>
    );
  if (margin > 800)
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "0.25rem",
        padding: "0.3rem 0.75rem", borderRadius: "9999px",
        fontSize: "0.6875rem", fontWeight: 700,
        background: "rgba(208,188,244,0.25)", color: "#6a3fa0",
        border: "1px solid rgba(208,188,244,0.55)",
      }}>✓ Likely</span>
    );
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.25rem",
      padding: "0.3rem 0.75rem", borderRadius: "9999px",
      fontSize: "0.6875rem", fontWeight: 700,
      background: "rgba(132,88,179,0.1)", color: "#8458B3",
      border: "1px solid rgba(132,88,179,0.25)",
    }}>~ Competitive</span>
  );
}

function bufferColor(margin: number): string {
  if (margin > 2000) return "#2e7ca0";
  if (margin > 500)  return "#6a3fa0";
  return "#8458B3";
}

const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.6)",
  border: "1.5px solid rgba(255,255,255,0.88)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  boxShadow: "0 20px 60px rgba(132,88,179,0.11), inset 0 1px 0 rgba(255,255,255,0.9)",
};

export function ResultsTable({ results, hasSearched, loading, rank, category }: ResultsTableProps) {

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ ...GLASS, borderRadius: "1.25rem", padding: "4rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <div style={{
          height: "3rem", width: "3rem", borderRadius: "9999px",
          border: "2.5px solid rgba(160,210,235,0.3)", borderTopColor: P.purple,
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ fontSize: "0.875rem", color: P.textMuted, fontWeight: 500 }}>Scanning cutoff data…</p>
      </div>
    );
  }

  /* ── Pre-search ── */
  if (!hasSearched) {
    return (
      <div style={{ ...GLASS, borderRadius: "1.25rem", padding: "3.5rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem", textAlign: "center" }}>
        <div style={{
          height: "4.5rem", width: "4.5rem", borderRadius: "1.25rem",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, rgba(160,210,235,0.2), rgba(208,188,244,0.2))",
          border: "1px solid rgba(160,210,235,0.3)",
          boxShadow: "0 4px 20px rgba(132,88,179,0.12)",
        }}>
          <svg style={{ height: "2.25rem", width: "2.25rem", color: P.purple }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
        </div>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: "1.125rem", color: P.textPrimary, marginBottom: "0.375rem", letterSpacing: "-0.01em" }}>Enter your rank to begin</h3>
          <p style={{ fontSize: "0.875rem", color: P.textMuted, maxWidth: "22rem", lineHeight: 1.65 }}>
            Fill in your KEAM rank and category above, then hit &ldquo;Predict&rdquo; to
            instantly see all colleges you qualify for.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
          {["SM", "EZ", "MU", "SC", "ST", "EW"].map((cat) => (
            <span key={cat} style={{
              display: "inline-flex", alignItems: "center", padding: "0.3rem 0.75rem",
              borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: 700,
              background: "rgba(132,88,179,0.08)", color: P.purple,
              border: "1px solid rgba(132,88,179,0.18)",
            }}>{cat}</span>
          ))}
          <span style={{
            display: "inline-flex", alignItems: "center", padding: "0.3rem 0.75rem",
            borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: 700,
            background: "rgba(73,77,95,0.06)", color: P.textMuted,
            border: "1px solid rgba(73,77,95,0.12)",
          }}>+7 more</span>
        </div>
      </div>
    );
  }

  /* ── No results ── */
  if (!results || results.length === 0) {
    return (
      <div style={{ ...GLASS, borderRadius: "1.25rem", padding: "3.5rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem", textAlign: "center" }}>
        <div style={{
          height: "4.5rem", width: "4.5rem", borderRadius: "1.25rem",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
        }}>
          <svg style={{ height: "2.25rem", width: "2.25rem", color: "#ef4444" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
          </svg>
        </div>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: "1.125rem", color: P.textPrimary, marginBottom: "0.375rem" }}>No matches found</h3>
          <p style={{ fontSize: "0.875rem", color: P.textMuted, maxWidth: "22rem", lineHeight: 1.65 }}>
            No colleges matched rank #{rank} in the {category} category. Try a different category or Phase 2.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
          <span style={{ padding: "0.3rem 0.75rem", borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: 700, background: "rgba(73,77,95,0.07)", color: P.textMuted, border: "1px solid rgba(73,77,95,0.14)" }}>Rank #{rank}</span>
          <span style={{ padding: "0.3rem 0.75rem", borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: 700, background: "rgba(239,68,68,0.1)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)" }}>{category}</span>
        </div>
      </div>
    );
  }

  /* ── Results table ── */
  return (
    <div style={{ ...GLASS, borderRadius: "1.25rem", overflow: "hidden" }}>

      {/* Header bar */}
      <div style={{
        padding: "1rem 1.25rem",
        display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem",
        background: "linear-gradient(90deg, rgba(160,210,235,0.12) 0%, rgba(208,188,244,0.1) 100%)",
        borderBottom: "1px solid rgba(160,210,235,0.22)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
          <div style={{
            height: "2rem", width: "2rem", borderRadius: "0.5rem", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, rgba(132,88,179,0.15), rgba(160,210,235,0.15))",
            border: "1px solid rgba(132,88,179,0.15)",
          }}>
            <svg style={{ height: "1rem", width: "1rem", color: P.purple }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: "0.875rem", color: P.textPrimary }}>{results.length} colleges matched</span>
          <span style={{ padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: 700, background: "rgba(132,88,179,0.1)", color: P.purple, border: "1px solid rgba(132,88,179,0.22)" }}>{category}</span>
          <span style={{ padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: 700, background: "rgba(73,77,95,0.06)", color: P.textMuted, border: "1px solid rgba(73,77,95,0.12)" }}>Rank #{rank}</span>
        </div>
        <span style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: P.textFaint }}>
          Best margin first
        </span>
      </div>

      {/* Desktop table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }} className="results-desktop-table">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(160,210,235,0.2)" }}>
              {["#", "College", "Branch", "Type", "Phase", "Cutoff Rank", "Your Buffer", "Status"].map((h) => (
                <th key={h} style={{
                  padding: "0.75rem 1rem", textAlign: "left",
                  fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" as const,
                  color: "rgba(73,77,95,0.45)", background: "rgba(229,234,245,0.3)", whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row, i) => (
              <tr
                key={`${row.college_code}-${row.department}-${row.phase}-${i}`}
                style={{ borderBottom: "1px solid rgba(160,210,235,0.12)", transition: "background 0.12s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(160,210,235,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "0.875rem 1rem", verticalAlign: "middle" }}>
                  <span style={{
                    display: "inline-flex", height: "1.625rem", width: "1.625rem",
                    alignItems: "center", justifyContent: "center", borderRadius: "0.4rem",
                    fontWeight: 800, fontSize: "0.6875rem",
                    background: "linear-gradient(135deg, rgba(132,88,179,0.12), rgba(160,210,235,0.12))",
                    color: P.purple, border: "1px solid rgba(132,88,179,0.15)",
                  }}>{i + 1}</span>
                </td>
                <td style={{ padding: "0.875rem 1rem", verticalAlign: "middle" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.875rem", color: P.textPrimary, lineHeight: 1.3 }}>{row.college_name}</p>
                  <p style={{ fontSize: "0.6875rem", color: P.textFaint, marginTop: "0.2rem", fontFamily: "var(--font-geist-mono), monospace" }}>{row.college_code}</p>
                </td>
                <td style={{ padding: "0.875rem 1rem", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "0.875rem", color: P.darkSlate, fontWeight: 500 }}>{row.department}</span>
                </td>
                <td style={{ padding: "0.875rem 1rem", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "0.75rem", color: P.textMuted, whiteSpace: "nowrap" }}>{TYPE_LABEL[row.college_type ?? ""] ?? "—"}</span>
                </td>
                <td style={{ padding: "0.875rem 1rem", verticalAlign: "middle" }}>
                  <span style={{
                    padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: 700,
                    background: "rgba(160,210,235,0.15)", color: "#2e7ca0", border: "1px solid rgba(160,210,235,0.3)",
                  }}>{row.phase}</span>
                </td>
                <td style={{ padding: "0.875rem 1rem", verticalAlign: "middle" }}>
                  <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontWeight: 800, color: P.textPrimary, fontSize: "0.9375rem" }}>
                    {row.cutoffRank.toLocaleString()}
                  </span>
                </td>
                <td style={{ padding: "0.875rem 1rem", verticalAlign: "middle" }}>
                  <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "0.875rem", fontWeight: 800, color: bufferColor(row.margin) }}>
                    +{row.margin.toLocaleString()}
                  </span>
                </td>
                <td style={{ padding: "0.875rem 1rem", verticalAlign: "middle" }}>
                  <StatusBadge margin={row.margin} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="results-mobile-cards">
        {results.map((row, i) => (
          <div key={`m-${row.college_code}-${row.department}-${row.phase}-${i}`} style={{
            padding: "1rem 1.125rem",
            display: "flex", alignItems: "flex-start", gap: "0.75rem",
            borderBottom: i < results.length - 1 ? "1px solid rgba(160,210,235,0.15)" : "none",
          }}>
            <div style={{
              height: "2.125rem", width: "2.125rem", borderRadius: "0.625rem", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: "0.75rem",
              background: "linear-gradient(135deg, rgba(132,88,179,0.12), rgba(160,210,235,0.12))",
              color: P.purple, border: "1px solid rgba(132,88,179,0.15)", marginTop: "0.125rem",
            }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: "0.875rem", color: P.textPrimary, lineHeight: 1.3 }}>{row.college_name}</p>
              <p style={{ fontSize: "0.75rem", color: P.purple, marginTop: "0.2rem", fontWeight: 600 }}>{row.department}</p>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: P.textMuted }}>Cutoff: <strong style={{ fontFamily: "monospace", color: P.textPrimary }}>{row.cutoffRank.toLocaleString()}</strong></span>
                <span style={{ fontSize: "0.75rem", color: P.textMuted }}>Buffer: <strong style={{ fontFamily: "monospace", color: bufferColor(row.margin) }}>+{row.margin.toLocaleString()}</strong></span>
                <span style={{ padding: "0.15rem 0.5rem", borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: 700, background: "rgba(160,210,235,0.15)", color: "#2e7ca0", border: "1px solid rgba(160,210,235,0.3)" }}>{row.phase}</span>
              </div>
            </div>
            <div style={{ flexShrink: 0, marginTop: "0.125rem" }}>
              <StatusBadge margin={row.margin} />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .results-desktop-table { display: table !important; }
          .results-mobile-cards  { display: none !important; }
        }
        @media (max-width: 767px) {
          .results-desktop-table { display: none !important; }
          .results-mobile-cards  { display: block !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
