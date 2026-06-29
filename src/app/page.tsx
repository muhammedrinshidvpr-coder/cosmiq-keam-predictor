"use client";

import { useCallback, useEffect, useState } from "react";
import { RotateCcw, Sparkles, Target, TrendingUp, Database, Shield } from "lucide-react";
import {
  supabase,
  CATEGORIES,
  type Category,
  type PredictionResult,
} from "@/lib/supabase";
import { SearchableSelect } from "@/components/SearchableSelect";
import { ResultsGrid }      from "@/components/ResultsGrid";

/* ── Layout helpers ─────────────────────────────────────── */
const FULL_W:   React.CSSProperties = { maxWidth: "80rem",  marginLeft: "auto", marginRight: "auto" };
const CENTER_SM: React.CSSProperties = { maxWidth: "46rem",  marginLeft: "auto", marginRight: "auto" };

/* ── Design tokens ──────────────────────────────────────── */
const P = {
  skyBlue:       "#A0D2EB",
  purple:        "#8458B3",
  darkSlate:     "#494D5F",
  pageBg:        "linear-gradient(160deg, #d8edf8 0%, #e7e3f5 40%, #f0eafb 75%, #ddd8f0 100%)",
  navBg:         "rgba(255,255,255,0.78)",
  navBorder:     "rgba(160,210,235,0.35)",
  cardBg:        "rgba(255,255,255,0.62)",
  cardBorder:    "rgba(255,255,255,0.88)",
  cardShadow:    "0 24px 64px rgba(132,88,179,0.13), inset 0 1px 0 rgba(255,255,255,0.9)",
  inputBg:       "rgba(255,255,255,0.78)",
  inputBorder:   "rgba(160,210,235,0.5)",
  textPrimary:   "#2b2c3d",
  textSecondary: "#494D5F",
  textMuted:     "rgba(73,77,95,0.55)",
  textFaint:     "rgba(73,77,95,0.38)",
} as const;

export default function Home() {
  const [rank, setRank]                     = useState("");
  const [category, setCategory]             = useState<Category>("SM");
  const [phase, setPhase]                   = useState("All");
  const [collegeSearch, setCollegeSearch]   = useState("");
  const [branchSearch, setBranchSearch]     = useState("");
  const [rankError, setRankError]           = useState(false);
  const [colleges, setColleges]             = useState<string[]>([]);
  const [branches, setBranches]             = useState<string[]>([]);
  const [results, setResults]               = useState<PredictionResult[] | null>(null);
  const [loading, setLoading]               = useState(false);
  const [cooldown, setCooldown]             = useState(false);
  const [hasSearched, setHasSearched]       = useState(false);
  const [dbError, setDbError]              = useState<string | null>(null);

  /* Load all college names on mount — paginate to bypass Supabase's 1000-row REST cap */
  useEffect(() => {
    async function loadColleges() {
      const PAGE = 1000;
      let offset = 0;
      const names: string[] = [];
      while (true) {
        const { data } = await supabase
          .from("cutoffs")
          .select("college_name")
          .range(offset, offset + PAGE - 1);
        if (!data || data.length === 0) break;
        names.push(...data.map((r) => r.college_name as string));
        if (data.length < PAGE) break;
        offset += PAGE;
      }
      setColleges([...new Set(names)].sort());
    }
    loadColleges();
  }, []);

  /* Load branches when a college is selected */
  useEffect(() => {
    if (!collegeSearch) return;
    supabase
      .from("cutoffs")
      .select("department")
      .ilike("college_name", `%${collegeSearch}%`)
      .order("department")
      .limit(500)
      .then(({ data }) => {
        if (data) setBranches([...new Set(data.map((r) => r.department))].sort());
      });
  }, [collegeSearch]);

  const handlePredict = useCallback(async () => {
    if (!rank || isNaN(Number(rank))) {
      setRankError(true);
      setTimeout(() => setRankError(false), 700);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    setRankError(false);
    setDbError(null);
    try {
      let q = supabase.from("cutoffs").select("*").gte(category, Number(rank));
      if (phase !== "All")   q = q.eq("phase",       phase);
      if (collegeSearch)     q = q.ilike("college_name", `%${collegeSearch}%`);
      if (branchSearch)      q = q.ilike("department",   `%${branchSearch}%`);
      const { data, error } = await q.order(category, { ascending: true });
      if (error) throw error;
      const userRank = Number(rank);
      setResults(
        (data || [])
          .filter((r) => r[category] !== null)
          .map((r) => ({
            ...r,
            cutoffRank: r[category] as number,
            status: "match" as const,
            margin: (r[category] as number) - userRank,
          }))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDbError(msg);
      setResults([]);
    } finally {
      setLoading(false);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 2000);
    }
  }, [rank, category, phase, collegeSearch, branchSearch]);

  const clearAll = () => {
    setCollegeSearch("");
    setBranchSearch("");
    setBranches([]);
    setResults(null);
    setHasSearched(false);
    setRank("");
    setRankError(false);
  };

  const handleCollegeChange = (v: string) => {
    setCollegeSearch(v);
    if (!v) { setBranches([]); setBranchSearch(""); }
  };

  const predictBtnDisabled = loading || cooldown;
  const predictBtnLabel =
    loading ? "Predicting…"
    : cooldown ? "Please wait…"
    : "Predict My Colleges";

  return (
    <main style={{ minHeight: "100vh", background: P.pageBg, fontFamily: "var(--font-geist-sans), system-ui, sans-serif", position: "relative" }}>

      {/* ── Background blobs ── */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "45vw", height: "45vw", borderRadius: "9999px", background: "radial-gradient(circle, rgba(160,210,235,0.35) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "5%", right: "-8%", width: "50vw", height: "50vw", borderRadius: "9999px", background: "radial-gradient(circle, rgba(208,188,244,0.28) 0%, transparent 70%)", filter: "blur(48px)" }} />
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: "35vw", height: "35vw", borderRadius: "9999px", background: "radial-gradient(circle, rgba(132,88,179,0.1) 0%, transparent 70%)", filter: "blur(36px)" }} />
      </div>

      {/* ── Navbar ── */}
      <nav style={{
        width: "100%", position: "sticky", top: 0, zIndex: 50,
        background: P.navBg, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${P.navBorder}`,
        boxShadow: "0 2px 20px rgba(132,88,179,0.07)",
      }}>
        <div style={{ ...FULL_W, padding: "0 1.5rem", height: "3.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="CosmIQ" style={{ height: "2.5rem", width: "auto", objectFit: "contain" }} />
            <span style={{ fontWeight: 700, color: P.purple, fontSize: "0.8125rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              KEAM Predictor
            </span>
          </div>
          <a href="#predictor" style={{
            fontSize: "0.8125rem", fontWeight: 600, color: P.purple, textDecoration: "none",
            padding: "0.375rem 1rem", borderRadius: "9999px",
            background: "rgba(132,88,179,0.08)", border: "1px solid rgba(132,88,179,0.18)",
          }}>
            Predict Now ↓
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ padding: "5rem 1.5rem 3.5rem", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={CENTER_SM}>

          <h1 style={{ fontSize: "clamp(2.25rem, 6vw, 3.75rem)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.07, marginBottom: "1.25rem", color: P.textPrimary }}>
            Find your KEAM colleges{" "}
            <span style={{
              background: `linear-gradient(135deg, ${P.darkSlate} 0%, ${P.purple} 45%, ${P.skyBlue} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>instantly.</span>
          </h1>

          <p style={{ color: P.textSecondary, fontSize: "1.05rem", lineHeight: 1.75, marginBottom: "2.25rem" }}>
            Enter your rank and category once — get a ranked list of every college
            and branch you can secure based on real cutoff history.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
            {[
              { icon: <TrendingUp style={{ width: "0.875rem", height: "0.875rem" }} />, text: "Rank-based prediction",       color: P.purple },
              { icon: <Database  style={{ width: "0.875rem", height: "0.875rem" }} />, text: "13 reservation categories",   color: "#5b7fa8" },
              { icon: <Shield    style={{ width: "0.875rem", height: "0.875rem" }} />, text: "Historical accuracy",         color: P.purple },
            ].map(({ icon, text, color }) => (
              <span key={text} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8125rem", color: P.textMuted }}>
                <span style={{ color }}>{icon}</span> {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Predictor Section ── */}
      <section id="predictor" style={{ padding: "0 1.5rem 6rem", scrollMarginTop: "5rem", position: "relative", zIndex: 1 }}>
        <div style={{ ...FULL_W }}>

          {/* Section badge */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.35rem 1.125rem", borderRadius: "9999px",
              background: "rgba(255,255,255,0.75)", border: "1px solid rgba(132,88,179,0.22)",
              backdropFilter: "blur(12px)",
              color: P.purple, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
              boxShadow: "0 2px 12px rgba(132,88,179,0.1)",
            }}>
              <Sparkles style={{ width: "0.875rem", height: "0.875rem" }} />
              KEAM 2025 Predictor
            </span>
          </div>

          {/* ── Input panel ── */}
          <div style={{
            borderRadius: "1.5rem",
            padding: "clamp(1.5rem, 4vw, 2.25rem)",
            background: P.cardBg,
            border: `1.5px solid ${P.cardBorder}`,
            backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
            boxShadow: P.cardShadow,
            marginBottom: "2rem",
            position: "relative",
            zIndex: 10,
          }}>
            {/* Panel header */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1.75rem", paddingBottom: "1.25rem", borderBottom: "1px solid rgba(160,210,235,0.25)" }}>
              <div style={{
                height: "2.5rem", width: "2.5rem", borderRadius: "0.75rem", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg, rgba(132,88,179,0.12), rgba(160,210,235,0.12))",
                border: "1px solid rgba(132,88,179,0.15)",
              }}>
                <Target style={{ height: "1.125rem", width: "1.125rem", color: P.purple }} />
              </div>
              <div>
                <div style={{ fontSize: "0.9375rem", fontWeight: 800, color: P.textPrimary, letterSpacing: "-0.01em" }}>Rank Predictor</div>
                <div style={{ fontSize: "0.75rem", color: P.textMuted }}>Fill in your details to find eligible colleges</div>
              </div>
            </div>

            {/* 5-input grid */}
            <div className="pg-grid">

              {/* 1. Rank */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                <FieldLabel>Your KEAM Rank *</FieldLabel>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.875rem", fontWeight: 900, color: P.purple, pointerEvents: "none" }}>#</span>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePredict()}
                    style={{
                      width: "100%", height: "3rem", paddingLeft: "2rem", paddingRight: "1rem",
                      borderRadius: "0.75rem", fontSize: "0.875rem", fontWeight: 600,
                      color: P.textPrimary, background: P.inputBg,
                      border: rankError ? "1.5px solid rgba(239,68,68,0.6)" : `1.5px solid ${P.inputBorder}`,
                      outline: "none", boxSizing: "border-box",
                      boxShadow: rankError ? "0 0 0 3px rgba(239,68,68,0.12)" : "0 1px 4px rgba(132,88,179,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                  />
                </div>
                {rankError && <p style={{ fontSize: "0.7rem", color: "#dc2626", fontWeight: 600 }}>Please enter a valid rank.</p>}
              </div>

              {/* 2. Category */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                <FieldLabel>Category *</FieldLabel>
                <div style={{ position: "relative" }}>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    style={selectStyle}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.value} — {c.label.split("—")[1]?.trim() ?? c.label}</option>
                    ))}
                  </select>
                  <ChevronIcon />
                </div>
              </div>

              {/* 3. Phase */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                <FieldLabel>Phase *</FieldLabel>
                <div style={{ position: "relative" }}>
                  <select
                    value={phase}
                    onChange={(e) => setPhase(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="All">All Phases</option>
                    <option value="Phase 1">Phase 1</option>
                    <option value="Phase 2">Phase 2</option>
                  </select>
                  <ChevronIcon />
                </div>
              </div>

              {/* 4. College */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                <FieldLabel>
                  College{" "}
                  <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: P.textFaint, fontSize: "0.6875rem" }}>(optional)</span>
                </FieldLabel>
                <SearchableSelect
                  value={collegeSearch}
                  onChange={handleCollegeChange}
                  options={colleges}
                  allOptionLabel="All Colleges"
                  placeholder="All Colleges"
                />
              </div>

              {/* 5. Branch */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                <FieldLabel>
                  Branch{" "}
                  <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: P.textFaint, fontSize: "0.6875rem" }}>(optional)</span>
                </FieldLabel>
                <SearchableSelect
                  value={branchSearch}
                  onChange={setBranchSearch}
                  options={branches}
                  allOptionLabel="All Branches"
                  placeholder="All Branches"
                  disabled={!collegeSearch}
                />
                {!collegeSearch && (
                  <p style={{ fontSize: "0.7rem", color: P.textFaint }}>Select a college first.</p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div style={{ marginTop: "1.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={handlePredict}
                disabled={predictBtnDisabled}
                style={{
                  width: "100%", height: "3.375rem", borderRadius: "0.875rem",
                  fontSize: "1rem", fontWeight: 700, color: "#fff", border: "none",
                  cursor: predictBtnDisabled ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem",
                  background: predictBtnDisabled
                    ? "rgba(132,88,179,0.55)"
                    : `linear-gradient(135deg, ${P.purple} 0%, #9a6cc8 40%, ${P.skyBlue} 100%)`,
                  boxShadow: predictBtnDisabled ? "none" : "0 8px 28px rgba(132,88,179,0.38), inset 0 1px 0 rgba(255,255,255,0.25)",
                  letterSpacing: "-0.01em",
                  transition: "all 0.2s",
                }}
              >
                {loading ? (
                  <><Spinner />&nbsp;{predictBtnLabel}</>
                ) : (
                  <><Sparkles style={{ height: "1rem", width: "1rem" }} /> {predictBtnLabel}</>
                )}
              </button>

              {(results !== null || !!rank) && !loading && (
                <button
                  type="button"
                  onClick={clearAll}
                  style={{
                    width: "100%", height: "2.75rem", borderRadius: "0.75rem",
                    fontSize: "0.875rem", fontWeight: 700, color: P.purple,
                    border: "1.5px solid rgba(132,88,179,0.22)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                    background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)",
                    boxShadow: "0 2px 12px rgba(132,88,179,0.08)",
                  }}
                >
                  <RotateCcw style={{ height: "0.875rem", width: "0.875rem" }} />
                  Clear &amp; Reset
                </button>
              )}
            </div>
          </div>

          {/* ── DB Error banner ── */}
          {dbError && (
            <div style={{
              marginBottom: "1.5rem", padding: "1rem 1.25rem", borderRadius: "0.875rem",
              background: "rgba(255,80,80,0.08)", border: "1.5px solid rgba(255,80,80,0.25)",
              color: "#c0392b", fontSize: "0.875rem", fontWeight: 500,
            }}>
              <strong>Database error:</strong> {dbError}
            </div>
          )}

          {/* ── Results ── */}
          <div id="results-section" style={{ scrollMarginTop: "5.5rem" }}>
            <ResultsGrid
              results={results}
              hasSearched={hasSearched}
              loading={loading}
              rank={rank}
              category={category}
            />
          </div>
        </div>
      </section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        input:focus, select:focus {
          border-color: #8458B3 !important;
          box-shadow: 0 0 0 3px rgba(132,88,179,0.14), 0 1px 4px rgba(132,88,179,0.08) !important;
        }
        /* Predictor input grid */
        .pg-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .pg-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .pg-grid { grid-template-columns: repeat(5, 1fr); }
        }
      `}</style>
    </main>
  );
}

/* ── Small shared sub-components ─────────────────────────── */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(73,77,95,0.55)" }}>
      {children}
    </label>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%", height: "3rem", paddingLeft: "1rem", paddingRight: "2.5rem",
  borderRadius: "0.75rem", fontSize: "0.875rem", fontWeight: 600,
  color: "#2b2c3d", background: "rgba(255,255,255,0.78)",
  border: "1.5px solid rgba(160,210,235,0.5)", outline: "none",
  appearance: "none", cursor: "pointer", boxSizing: "border-box",
  boxShadow: "0 1px 4px rgba(132,88,179,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function ChevronIcon() {
  return (
    <svg
      style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", width: "1rem", height: "1rem", color: "rgba(132,88,179,0.45)" }}
      fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function Spinner() {
  return (
    <span style={{
      height: "1.125rem", width: "1.125rem", borderRadius: "9999px", display: "inline-block",
      border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
      animation: "spin 0.8s linear infinite",
    }} />
  );
}
