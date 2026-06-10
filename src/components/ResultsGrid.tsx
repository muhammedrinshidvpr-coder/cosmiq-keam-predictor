"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import type { PredictionResult, Category } from "@/lib/supabase";

const ITEMS_PER_PAGE = 12;

const P = {
  purple:      "#8458B3",
  skyBlue:     "#A0D2EB",
  textPrimary: "#2b2c3d",
  textMuted:   "rgba(73,77,95,0.55)",
  textFaint:   "rgba(73,77,95,0.38)",
} as const;

interface Props {
  results:    PredictionResult[] | null;
  hasSearched: boolean;
  loading:    boolean;
  rank:       string;
  category:   Category;
}

export function ResultsGrid({ results, hasSearched, loading, rank, category }: Props) {
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [results]);

  const handlePageChange = (p: number) => {
    setPage(p);
    document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div style={GLASS}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "4rem 2rem" }}>
          <LoadingSpinner />
          <p style={{ fontSize: "0.875rem", color: P.textMuted, fontWeight: 500 }}>Scanning cutoff data…</p>
        </div>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div style={{ ...GLASS, padding: "3.5rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", textAlign: "center" }}>
        <div style={{
          width: "5rem", height: "5rem", borderRadius: "1.25rem", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, rgba(160,210,235,0.2), rgba(208,188,244,0.2))",
          border: "1px solid rgba(160,210,235,0.3)",
          boxShadow: "0 4px 20px rgba(132,88,179,0.12)",
        }}>
          <svg style={{ height: "2.5rem", width: "2.5rem", color: P.purple }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
        </div>
        <div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: P.textPrimary, marginBottom: "0.375rem", letterSpacing: "-0.01em" }}>
            Enter your rank to begin
          </h3>
          <p style={{ fontSize: "0.875rem", color: P.textMuted, maxWidth: "24rem", lineHeight: 1.7 }}>
            Fill in your KEAM rank and category above, then hit{" "}
            <strong style={{ color: P.purple }}>Predict My Colleges</strong> to
            see every college and branch you qualify for.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
          {["SM", "EZ", "MU", "SC", "ST", "EW"].map((cat) => (
            <span key={cat} style={{
              padding: "0.3rem 0.75rem", borderRadius: "9999px",
              fontSize: "0.6875rem", fontWeight: 700,
              background: "rgba(132,88,179,0.08)", color: P.purple,
              border: "1px solid rgba(132,88,179,0.18)",
            }}>{cat}</span>
          ))}
          <span style={{
            padding: "0.3rem 0.75rem", borderRadius: "9999px",
            fontSize: "0.6875rem", fontWeight: 700,
            background: "rgba(73,77,95,0.06)", color: P.textMuted,
            border: "1px solid rgba(73,77,95,0.12)",
          }}>+7 more</span>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div style={{
        ...GLASS,
        padding: "3.5rem 2rem",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "1.25rem", textAlign: "center",
        border: "2px dashed rgba(239,68,68,0.25)",
        background: "rgba(255,255,255,0.5)",
      }}>
        <div style={{
          width: "4.5rem", height: "4.5rem", borderRadius: "1.25rem",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
        }}>
          <svg style={{ height: "2.25rem", width: "2.25rem", color: "#ef4444" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
          </svg>
        </div>
        <div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: P.textPrimary, marginBottom: "0.375rem" }}>No matches found</h3>
          <p style={{ fontSize: "0.875rem", color: P.textMuted, maxWidth: "22rem", lineHeight: 1.65 }}>
            No colleges matched rank #{rank} in the {category} category.
            Try a different category or phase.
          </p>
        </div>
      </div>
    );
  }

  const totalPages   = Math.ceil(results.length / ITEMS_PER_PAGE);
  const pageResults  = results.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div>
      {/* Results header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.375rem",
            padding: "0.3rem 0.875rem", borderRadius: "9999px",
            background: "rgba(255,255,255,0.8)", border: "1px solid rgba(160,210,235,0.4)",
            boxShadow: "0 2px 8px rgba(132,88,179,0.1)", backdropFilter: "blur(12px)",
            fontSize: "0.8125rem", fontWeight: 700, color: P.purple,
          }}>
            {results.length} matches
          </span>
          <span style={CHIP_PURPLE}>{category}</span>
          <span style={CHIP_SLATE}>Rank #{rank}</span>
        </div>
        <span style={{ fontSize: "0.75rem", color: P.textFaint, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Most competitive first
        </span>
      </div>

      {/* Card grid */}
      <div className="rg-grid">
        {pageResults.map((row, idx) => (
          <ResultCard
            key={`${row.college_code}-${row.department}-${row.phase}`}
            row={row}
            idx={idx}
            rank={rank}
            category={category}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      )}

      <p style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.6875rem", color: P.textFaint, lineHeight: 1.6 }}>
        * Predictions are based on historical KEAM allotment data. Actual cutoffs may vary each year.
      </p>

      <style>{`
        .rg-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 600px)  { .rg-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .rg-grid { grid-template-columns: repeat(3, 1fr); } }
        @keyframes rg-card-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rg-card {
          border-radius: 1.25rem;
          padding: 1.25rem;
          background: rgba(255,255,255,0.72);
          border: 1.5px solid rgba(255,255,255,0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 4px 24px rgba(132,88,179,0.09), inset 0 1px 0 rgba(255,255,255,0.95);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          opacity: 0;
          transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s;
        }
        .rg-card:hover {
          box-shadow: 0 12px 40px rgba(132,88,179,0.16), inset 0 1px 0 rgba(255,255,255,0.95);
          border-color: rgba(160,210,235,0.65);
          transform: translateY(-2px);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

/* ── Result Card ─────────────────────────────────────────── */
function ResultCard({
  row, idx, rank, category,
}: {
  row: PredictionResult; idx: number; rank: string; category: Category;
}) {
  const delay = `${Math.min(idx * 45, 450)}ms`;

  return (
    <div
      className="rg-card"
      style={{ animationDelay: delay, animation: `rg-card-in 0.35s ease forwards ${delay}` }}
    >
      {/* Phase + Category badges */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "0.3rem",
          padding: "0.25rem 0.625rem", borderRadius: "9999px",
          fontSize: "0.6875rem", fontWeight: 700,
          background: "rgba(160,210,235,0.2)", color: "#2e7ca0",
          border: "1px solid rgba(160,210,235,0.45)",
        }}>
          <Trophy style={{ width: "0.625rem", height: "0.625rem" }} />
          {row.phase}
        </span>
        <span style={CHIP_PURPLE}>{category}</span>
      </div>

      {/* College name + department */}
      <div>
        <p
          className="line-clamp-2"
          style={{ fontSize: "0.875rem", fontWeight: 700, color: "#2b2c3d", lineHeight: 1.35 }}
        >
          {row.college_name}
        </p>
        <p
          className="line-clamp-1"
          style={{ fontSize: "0.75rem", color: "rgba(73,77,95,0.6)", marginTop: "0.25rem", fontWeight: 500 }}
        >
          {row.department}
        </p>
      </div>

      {/* Rank comparison */}
      <div style={{ display: "flex", gap: "0.625rem", marginTop: "auto" }}>
        {/* Cutoff rank box */}
        <div style={{
          flex: 1, borderRadius: "0.75rem",
          background: "rgba(132,88,179,0.07)",
          padding: "0.625rem 0.875rem",
        }}>
          <p style={{
            fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "rgba(73,77,95,0.38)", marginBottom: "0.2rem",
          }}>
            Cutoff Rank
          </p>
          <p style={{
            fontSize: "1.625rem", fontWeight: 900, lineHeight: 1,
            background: "linear-gradient(135deg, #494D5F 0%, #8458B3 55%, #A0D2EB 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            {row.cutoffRank.toLocaleString()}
          </p>
        </div>

        {/* Your rank box */}
        <div style={{
          borderRadius: "0.75rem",
          background: "rgba(73,77,95,0.05)",
          padding: "0.625rem 0.875rem",
          minWidth: "5.5rem",
          display: "flex", flexDirection: "column",
        }}>
          <p style={{
            fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "rgba(73,77,95,0.38)", marginBottom: "0.2rem",
          }}>
            Your Rank
          </p>
          <p style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#2b2c3d", lineHeight: 1.2 }}>
            {Number(rank).toLocaleString()}
          </p>
          <StatusPill margin={row.margin} />
        </div>
      </div>
    </div>
  );
}

/* ── Status pill ─────────────────────────────────────────── */
function StatusPill({ margin }: { margin: number }) {
  const s =
    margin > 3000 ? { bg: "rgba(160,210,235,0.25)", color: "#2e7ca0", label: "✓ Safe" }
    : margin > 800 ? { bg: "rgba(208,188,244,0.3)",   color: "#6a3fa0", label: "✓ Likely" }
    :               { bg: "rgba(132,88,179,0.12)",   color: "#8458B3", label: "~ Close" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      marginTop: "0.375rem", padding: "0.2rem 0.5rem",
      borderRadius: "9999px", fontSize: "0.5625rem", fontWeight: 700,
      background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  );
}

/* ── Pagination ──────────────────────────────────────────── */
function Pagination({
  page, totalPages, onPageChange,
}: {
  page: number; totalPages: number; onPageChange: (p: number) => void;
}) {
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    const start = Math.max(2, page - 1);
    const end   = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const base: React.CSSProperties = {
    height: "2.25rem", minWidth: "2.25rem", padding: "0 0.625rem",
    borderRadius: "0.625rem", border: "1.5px solid rgba(160,210,235,0.4)",
    fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s", background: "rgba(255,255,255,0.78)",
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "2.5rem" }}>
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        style={{ ...base, color: page === 1 ? "rgba(73,77,95,0.35)" : "#8458B3", opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}
      >
        ← Prev
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e-${i}`} style={{ color: "rgba(73,77,95,0.38)", fontSize: "0.875rem", padding: "0 0.25rem" }}>…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p as number)}
            style={{
              ...base,
              background: page === p ? "linear-gradient(135deg, #8458B3, #A0D2EB)" : "rgba(255,255,255,0.78)",
              color:       page === p ? "#fff"    : "#8458B3",
              borderColor: page === p ? "transparent" : "rgba(160,210,235,0.4)",
              boxShadow:   page === p ? "0 4px 12px rgba(132,88,179,0.3)" : "none",
            }}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        style={{ ...base, color: page === totalPages ? "rgba(73,77,95,0.35)" : "#8458B3", opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }}
      >
        Next →
      </button>

      <span style={{ width: "100%", textAlign: "center", fontSize: "0.75rem", color: "rgba(73,77,95,0.38)", marginTop: "0.25rem" }}>
        Page {page} of {totalPages}
      </span>
    </div>
  );
}

/* ── Loading spinner ─────────────────────────────────────── */
function LoadingSpinner() {
  return (
    <>
      <div style={{
        height: "3rem", width: "3rem", borderRadius: "9999px",
        border: "2.5px solid rgba(160,210,235,0.3)", borderTopColor: "#8458B3",
        animation: "rg-spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes rg-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

/* ── Shared styles ───────────────────────────────────────── */
const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.62)",
  border: "1.5px solid rgba(255,255,255,0.88)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  boxShadow: "0 20px 60px rgba(132,88,179,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
  borderRadius: "1.25rem",
};

const CHIP_PURPLE: React.CSSProperties = {
  display: "inline-flex", alignItems: "center",
  padding: "0.25rem 0.625rem", borderRadius: "9999px",
  fontSize: "0.6875rem", fontWeight: 700,
  background: "rgba(132,88,179,0.1)", color: "#8458B3",
  border: "1px solid rgba(132,88,179,0.22)",
};

const CHIP_SLATE: React.CSSProperties = {
  padding: "0.25rem 0.625rem", borderRadius: "9999px",
  fontSize: "0.6875rem", fontWeight: 700,
  background: "rgba(73,77,95,0.06)", color: "rgba(73,77,95,0.55)",
  border: "1px solid rgba(73,77,95,0.12)",
};
