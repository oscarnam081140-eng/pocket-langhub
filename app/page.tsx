"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

interface VocabItem {
  id: string
  word: string
  translation: string
  language: string
  example?: string | null
  created_at?: string
}

const languages = [
  { code: "th", name: "Thai", flag: "🇹🇭" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
]

function clearClientLeftovers() {
  if (typeof window === "undefined") return
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && (k.startsWith("plh_") || k.includes("guest"))) keys.push(k)
    }
    keys.forEach((k) => localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}

export default function PocketLangHub() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedLang, setSelectedLang] = useState(languages[0])
  const [vocabList, setVocabList] = useState<VocabItem[]>([])
  const [newWord, setNewWord] = useState("")
  const [newTranslation, setNewTranslation] = useState("")
  const [newExample, setNewExample] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [bannerError, setBannerError] = useState<string | null>(null)

  const fetchVocab = useCallback(async () => {
    if (!session?.user?.email) return
    setLoading(true)
    try {
      const res = await fetch("/api/vocab")
      if (res.ok) {
        const data = await res.json()
        setVocabList(Array.isArray(data) ? data : [])
        setBannerError(null)
      } else {
        setBannerError("Couldn't load vocabulary. Try again.")
      }
    } catch (err) {
      console.error("Failed to fetch vocab:", err)
      setBannerError("Couldn't load vocabulary. Try again.")
    } finally {
      setLoading(false)
    }
  }, [session?.user?.email])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
      return
    }
    if (session?.user?.email) {
      fetchVocab()
    } else {
      setVocabList([])
    }
  }, [session?.user?.email, fetchVocab, status, router])

  const langVocab = vocabList.filter((item) => item.language === selectedLang.code)
  const filteredVocab = langVocab.filter(
    (item) =>
      item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translation.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const canAdd =
    Boolean(newWord.trim()) &&
    Boolean(newTranslation.trim()) &&
    Boolean(session) &&
    !saving

  const addVocab = async () => {
    if (!canAdd) return
    setSaving(true)
    setFormError(null)
    try {
      const res = await fetch("/api/vocab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: newWord.trim(),
          translation: newTranslation.trim(),
          language: selectedLang.code,
          example: newExample.trim() || null,
        }),
      })
      if (res.ok) {
        const newItem = await res.json()
        setVocabList((prev) => [newItem, ...prev])
        setNewWord("")
        setNewTranslation("")
        setNewExample("")
      } else {
        setFormError("Couldn't save. Try again.")
      }
    } catch (err) {
      console.error("Add error:", err)
      setFormError("Couldn't save. Try again.")
    } finally {
      setSaving(false)
    }
  }

  const deleteVocab = async (id: string) => {
    if (!confirm("Delete this word?")) return
    setBannerError(null)
    try {
      const res = await fetch(`/api/vocab/${id}`, { method: "DELETE" })
      if (res.ok) {
        setVocabList((prev) => prev.filter((item) => item.id !== id))
      } else {
        setBannerError("Couldn't delete. Try again.")
      }
    } catch (err) {
      console.error("Delete error:", err)
      setBannerError("Couldn't delete. Try again.")
    }
  }

  const handleSignOut = async () => {
    setMenuOpen(false)
    clearClientLeftovers()
    setVocabList([])
    await signOut({ callbackUrl: "/login" })
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-zinc-500">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-zinc-500">Redirecting to login…</div>
      </div>
    )
  }

  const chipLabel = session.user?.email || session.user?.name || "Signed in"
  const searchCountLabel =
    searchTerm.trim().length === 0
      ? `${langVocab.length} word${langVocab.length === 1 ? "" : "s"}`
      : filteredVocab.length === 0
        ? "No matches"
        : `${filteredVocab.length} word${filteredVocab.length === 1 ? "" : "s"}`

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <header className="border-b bg-white dark:bg-zinc-900 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-inner">
              👜
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Pocket LangHub</h1>
              <p className="text-sm text-zinc-500">
                Pocket-sized vocab mastery for any language
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200"
              aria-label="Account menu"
            >
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="max-w-[12rem] truncate">{chipLabel}</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-8">
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelectedLang(lang)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedLang.code === lang.code
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300"
                }`}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>

          {bannerError && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
            >
              {bannerError}
            </div>
          )}

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
              Add new {selectedLang.name} word
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void addVocab()
              }}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  type="text"
                  placeholder="Word"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Translation"
                  value={newTranslation}
                  onChange={(e) => setNewTranslation(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Example (optional)"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {formError && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
                  {formError}
                </p>
              )}
              <button
                type="submit"
                disabled={!canAdd}
                className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {saving ? "Saving..." : "+ Add Word"}
              </button>
            </form>
          </div>

          <div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search vocabulary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchTerm.length > 0 && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>
            <p className="mt-2 text-sm text-zinc-500">{searchCountLabel}</p>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-zinc-500 py-10">Loading your words...</p>
            ) : langVocab.length === 0 && searchTerm.trim().length === 0 ? (
              <p className="text-center text-zinc-500 py-10">
                No words yet. Add your first {selectedLang.name} word!
              </p>
            ) : filteredVocab.length === 0 ? (
              <p className="text-center text-zinc-500 py-10">No matches</p>
            ) : (
              filteredVocab.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 flex items-start justify-between gap-4 shadow-sm"
                >
                  <div>
                    <div className="text-xl font-semibold">{item.word}</div>
                    <div className="text-zinc-500 mt-1">{item.translation}</div>
                    {item.example && (
                      <div className="text-sm text-zinc-400 mt-2 italic">
                        “{item.example}”
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteVocab(item.id)}
                    className="text-red-500 hover:text-red-600 text-sm font-medium shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
