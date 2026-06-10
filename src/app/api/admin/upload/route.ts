import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  let rows: unknown[];
  try {
    const body = await req.json();
    rows = body.rows;
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows provided." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const CHUNK = 200;
  let totalInserted = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { data, error } = await adminClient
      .from("cutoffs")
      .insert(chunk as Record<string, unknown>[])
      .select("id");

    if (error) {
      return NextResponse.json(
        { error: `Supabase error: ${error.message}`, code: error.code },
        { status: 500 }
      );
    }
    totalInserted += data?.length ?? chunk.length;
  }

  return NextResponse.json({ success: true, inserted: totalInserted, total: rows.length });
}
