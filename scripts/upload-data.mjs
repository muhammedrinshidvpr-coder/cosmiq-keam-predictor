import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://njemnuvngzufplkrvzon.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZW1udXZuZ3p1ZnBsa3J2em9uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5NDIwNywiZXhwIjoyMDk2MTcwMjA3fQ.3Kg80uKgBa3FUrXND69l8jeD-w0HPApn-8pgwC9SiSo";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function normalizeText(value) {
  if (!value) return "";
  return value
    .trim()
    .replace(/\.+$/, "")
    .replace(/,(?=[^\s])/g, ", ")
    .trim();
}

function parseRank(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = parseFloat(String(value));
  return isNaN(num) ? null : Math.round(num);
}

function normalizeRow(raw, phase) {
  return {
    college_code: normalizeText(raw["College_Code"] || raw["college_code"] || ""),
    college_name: normalizeText(raw["College_Name"] || raw["college_name"] || ""),
    department: normalizeText(raw["Department"] || raw["department"] || ""),
    college_type: (raw["Type"] || raw["type"] || "").trim() || null,
    phase,
    SM: parseRank(raw["SM"]),
    EZ: parseRank(raw["EZ"]),
    MU: parseRank(raw["MU"]),
    LA: parseRank(raw["LA"]),
    DV: parseRank(raw["DV"]),
    VK: parseRank(raw["VK"]),
    BH: parseRank(raw["BH"]),
    BX: parseRank(raw["BX"]),
    KN: parseRank(raw["KN"]),
    KU: parseRank(raw["KU"]),
    SC: parseRank(raw["SC"]),
    ST: parseRank(raw["ST"]),
    EW: parseRank(raw["EW"]),
  };
}

async function uploadFile(filePath, phase) {
  console.log(`\n📂 Reading ${filePath}...`);
  const csv = readFileSync(filePath, "utf-8");

  const { data: rawRows, errors } = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
  });

  if (errors.length > 0) {
    console.warn("⚠️  Parse warnings:", errors.slice(0, 3));
  }

  const rows = rawRows
    .map((r) => normalizeRow(r, phase))
    .filter((r) => r.college_code && r.department);

  console.log(`✅ Parsed ${rows.length} rows for ${phase}`);

  const CHUNK = 200;
  let total = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { data, error } = await supabase
      .from("cutoffs")
      .upsert(chunk, { onConflict: "college_code,department,phase" })
      .select("id");

    if (error) {
      console.error(`❌ Error at chunk ${i / CHUNK + 1}:`, error.message);
      process.exit(1);
    }

    total += data?.length ?? chunk.length;
    process.stdout.write(`   Uploaded ${Math.min(i + CHUNK, rows.length)}/${rows.length} rows...\r`);
  }

  console.log(`\n🎉 ${phase}: ${total} rows inserted/updated`);
  return total;
}

async function main() {
  console.log("🚀 CosmIQ KEAM Data Upload");
  console.log("==========================");

  const phase1Path = "C:/Users/lenovo/Downloads/Final_Master_Phase1.csv";
  const phase2Path = "C:/Users/lenovo/Downloads/Final_Master_Phase2.csv";

  let grand = 0;
  grand += await uploadFile(phase1Path, "Phase 1");
  grand += await uploadFile(phase2Path, "Phase 2");

  console.log(`\n✨ Done! Total rows in database: ${grand}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
