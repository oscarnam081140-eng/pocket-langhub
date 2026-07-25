"use client"

import React, { useState } from "react"
import { useSession, signIn, signOut } from "next-auth/react"

interface VocabItem {
  id: number
  word: string
  translation: string
  language: string
  example?: string
}

const languages = [
  { code: "th", name: "Thai", flag: "🇹🇭" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
]

export default function PocketLangHub() {
  const { data: session, status } = useSession()
  const [selectedLang, setSelectedLang] = useState(languages[0])
  const [vocabList, setVocabList] = useState<VocabItem[]>([
    { id: 1, word: "สวัสดี", translation: "Hello", language: "th", example: "สวัสดีครับ" },
  ])
  const [newWord, setNewWord] = useState("")
  const [newTranslation, setNewTranslation] = useState("")
  const [newExample, setNewExample] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredVocab = vocabList.filter(
    (item) =>
      item.language === selectedLang.code &&
      (item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.translation.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const addVocab = () => {
    if (newWord.trim() && newTranslation.trim()) {
      setVocabList([
        ...vocabList,
        {
          id: Date.now(),
          word: newWord.trim(),
          translation: newTranslation.trim(),
          language: selectedLang.code,
          example: newExample.trim() || undefined,
        },
      ])
      setNewWord("")
      setNewTranslation("")
      setNewExample("")
    }
  }

  const deleteVocab = (id: number) =>
    setVocabList(vocabList.filter((item) => item.id !== id))

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-zinc-500">Loading...</div>
      </div>
    )
  }

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

          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm hidden sm:inline">
                Welcome, {session.user?.name}
              </span>
              <button
                onClick={() => signOut()}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              className="px-5 py-2 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {session ? (
          <div className="space-y-8">
            {/* Language Selector */}
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
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

            {/* Add Form */}
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
                onClick={addVocab}
                className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                + Add Word
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search vocabulary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* Vocab List */}
            <div className="space-y-3">
              {filteredVocab.length === 0 ? (
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
        ) : (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold mb-4">Sign in to save your vocab</h2>
            <p className="text-zinc-500 mb-8">
              Your personal language learning hub
            </p>
            <button
              onClick={() => signIn()}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
            >
              Login with Google
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
