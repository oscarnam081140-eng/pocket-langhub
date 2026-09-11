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

  const fetchVocab = useCallback(async () => {
    if (!session?.user?.email) return
    setLoading(true)
    try {
      const res = await fetch("/api/vocab")
      if (res.ok) {
        const data = await res.json()
        setVocabList(data)
      }
    } catch (err) {
      console.error("Failed to fetch vocab:", err)
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

  const filteredVocab = vocabList.filter(
    (item) =>
      item.language === selectedLang.code &&
      (item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.translation.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const addVocab = async () => {
    if (!newWord.trim() || !newTranslation.trim() || !session) return
    setSaving(true)
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
        const err = await res.json()
        alert(err.error || "Failed to add word")
      }
    } catch (err) {
      console.error("Add error:", err)
      alert("Failed to add word")
    } finally {
      setSaving(false)
    }
  }

  const deleteVocab = async (id: string) => {
    if (!confirm("Delete this word?")) return
    try {
      const res = await fetch(`/api/vocab/${id}`, { method: "DELETE" })
      if (res.ok) {
        setVocabList((prev) => prev.filter((item) => item.id !== id))
      } else {
        alert("Failed to delete")
      }
    } catch (err) {
      console.error("Delete error:", err)
      alert("Failed to delete")
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

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
              Add new {selectedLang.name} word
            </h2>
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
            <button
              type="button"
              onClick={addVocab}
              disabled={saving}
              className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {saving ? "Saving..." : "+ Add Word"}
            </button>
          </div>

          <input
            type="text"
            placeholder="Search vocabulary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-zinc-500 py-10">Loading your words...</p>
            ) : filteredVocab.length === 0 ? (
              <p className="text-center text-zinc-500 py-10">
                No words yet. Add your first {selectedLang.name} word!
              </p>
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
