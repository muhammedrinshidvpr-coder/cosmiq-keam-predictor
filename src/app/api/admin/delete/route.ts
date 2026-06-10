import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const VALID_PHASES = ["Phase 1", "Phase 2"];

export async function DELETE(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const phase = new URL(req.url).searchParams.get("phase");

  if (!phase || !VALID_PHASES.includes(phase)) {
    return NextResponse.json(
      { error: `Invalid phase. Must be one of: ${VALID_PHASES.join(", ")}` },
      { status: 400 }
    );
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { error } = await adminClient.from("cutoffs").delete().eq("phase", phase);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, phase });
}
