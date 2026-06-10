import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Cutoff = {
  id: string;
  college_code: string;
  college_name: string;
  department: string;
  college_type: string | null;
  phase: string;
  SM: number | null;
  EZ: number | null;
  MU: number | null;
  LA: number | null;
  DV: number | null;
  VK: number | null;
  BH: number | null;
  BX: number | null;
  KN: number | null;
  KU: number | null;
  SC: number | null;
  ST: number | null;
  EW: number | null;
};

export type Category = "SM" | "EZ" | "MU" | "LA" | "DV" | "VK" | "BH" | "BX" | "KN" | "KU" | "SC" | "ST" | "EW";

export type PredictionResult = Cutoff & {
  cutoffRank: number;
  status: "match";
  margin: number;
};

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "SM", label: "SM — State Merit" },
  { value: "EZ", label: "EZ — Ezhava" },
  { value: "MU", label: "MU — Muslim" },
  { value: "LA", label: "LA — Latin Catholic / Anglo Indian" },
  { value: "DV", label: "DV — Dheevara" },
  { value: "VK", label: "VK — Viswakarma" },
  { value: "BH", label: "BH — Backward Hindu" },
  { value: "BX", label: "BX — Backward Christian" },
  { value: "KN", label: "KN — Kudumbi" },
  { value: "KU", label: "KU — Kurava" },
  { value: "SC", label: "SC — Scheduled Caste" },
  { value: "ST", label: "ST — Scheduled Tribe" },
  { value: "EW", label: "EW — Economically Weaker Section" },
];
