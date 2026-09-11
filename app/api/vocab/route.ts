import { auth } from "@/auth"
import { getSupabaseAdmin } from "@/lib/supabase"
import { NextResponse } from "next/server"

function userIdFromSession(
  session: { user?: { id?: string; email?: string | null } } | null
): string | null {
  return session?.user?.id || null
}

// GET /api/vocab — list current user's vocabulary
export async function GET(request: Request) {
  const session = await auth()
  const userId = userIdFromSession(session)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const language = searchParams.get("language")

  try {
    const supabaseAdmin = getSupabaseAdmin()
    let query = supabaseAdmin
      .from("vocab")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (language) {
      query = query.eq("language", language)
    }

    const { data, error } = await query

    if (error) {
      console.error("Supabase GET error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("GET /api/vocab:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    )
  }
}

// POST /api/vocab — add a new word
export async function POST(request: Request) {
  const session = await auth()
  const userId = userIdFromSession(session)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { word, translation, language, example } = body

  if (!word?.trim() || !translation?.trim() || !language) {
    return NextResponse.json(
      { error: "word, translation and language are required" },
      { status: 400 }
    )
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from("vocab")
      .insert({
        user_id: userId,
        user_email: session?.user?.email ?? null,
        word: word.trim(),
        translation: translation.trim(),
        language,
        example: example?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase POST error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error("POST /api/vocab:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    )
  }
}
