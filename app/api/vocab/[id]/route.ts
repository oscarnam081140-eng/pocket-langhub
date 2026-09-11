import { auth } from "@/auth"
import { supabaseAdmin } from "@/lib/supabase"
import { NextResponse } from "next/server"

// DELETE /api/vocab/[id] — only the signed-in owner's row
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("vocab")
    .delete()
    .eq("id", id)
    .eq("user_email", session.user.email)
    .select("id")

  if (error) {
    console.error("Supabase DELETE error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
