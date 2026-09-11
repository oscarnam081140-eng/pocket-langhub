import { auth } from "@/auth"
import { supabaseAdmin } from "@/lib/supabase"
import { NextResponse } from "next/server"

// GET /api/vocab — list current user's vocabulary (optional ?language=)
export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const language = searchParams.get("language")

  let query = supabaseAdmin
    .from("vocab")
    .select("*")
    .eq("user_email", session.user.email)
    .order("created_at", { ascending: false })

  if (language) {
    query = query.eq("language", language)
  }

  const { data, error } = await query

  if (error) {
    console.error("Supabase GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

// POST /api/vocab — add a new word for the signed-in user only
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: {
    word?: string
    translation?: string
    language?: string
    example?: string | null
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { word, translation, language, example } = body

  if (!word?.trim() || !translation?.trim() || !language?.trim()) {
    return NextResponse.json(
      { error: "word, translation and language are required" },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from("vocab")
    .insert({
      user_email: session.user.email,
      word: word.trim(),
      translation: translation.trim(),
      language: language.trim(),
      example: example?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Supabase POST error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
