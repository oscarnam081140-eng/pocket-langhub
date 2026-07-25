import { auth } from "@/auth"
import { supabaseAdmin } from "@/lib/supabase"
import { NextResponse } from "next/server"

// DELETE /api/vocab/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Only allow deleting own records
  const { error } = await supabaseAdmin
    .from("vocab")
    .delete()
    .eq("id", id)
    .eq("user_email", session.user.email)

  if (error) {
    console.error("Supabase DELETE error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
