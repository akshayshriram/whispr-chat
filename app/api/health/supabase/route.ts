import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const TABLES = ["user_profile", "message", "chat_room"];

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { ok: false, error: "Missing environment variables" },
        { status: 500 },
      );
    }

    const getTABLE = TABLES[Math.floor(Math.random() * TABLES.length)];
    console.log("getTABLE", getTABLE);
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from(getTABLE)
      .select("id")
      .limit(Math.floor(Math.random() * 10) + 1);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
