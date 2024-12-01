import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const returnUrl = requestUrl.searchParams.get("returnUrl");

  // Use the Host header to construct the correct origin
  const host = request.headers.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https"; // Default to https in production
  const origin = `${protocol}://${host}`;

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}${returnUrl || '/dashboard'}`);
}