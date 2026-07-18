'use client';

import React, { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface VocabItem {
  id: number;
  word: string;
  translation: string;
  language: string;
  example?: string;
}

const languages = [
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
];

export default function PocketLangHub() {
  const { data: session } = useSession();
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [vocabList, setVocabList] = useState<VocabItem[]>([
    { id: 1, word: 'สวัสดี', translation: 'Hello', language: 'th', example: 'สวัสดีครับ' },
  ]);
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newExample, setNewExample] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVocab = vocabList.filter(item => 
    item.language === selectedLang.code && 
    (item.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
     item.translation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addVocab = () => {
    if (newWord.trim() && newTranslation.trim()) {
      setVocabList([...vocabList, {
        id: Date.now(),
        word: newWord.trim(),
        translation: newTranslation.trim(),
        language: selectedLang.code,
        example: newExample.trim() || undefined,
      }]);
      setNewWord(''); setNewTranslation(''); setNewExample('');
    }
  };

  const deleteVocab = (id: number) => setVocabList(vocabList.filter(item => item.id !== id));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <header className="border-b bg-white dark:bg-zinc-900 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-inner">👜</div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Pocket LangHub</h1>
              <p className="text-sm text-zinc-500">Pocket-sized vocab mastery for any language</p>
            </div>
          </div>
          {session ? (
            <div className="flex items-center gap-4">
              <span>Welcome, {session.user?.name}</span>
              <button onClick={() => signOut()} className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium">Sign Out</button>
            </div>
          ) : (
            <button onClick={() => signIn()} className="px-5 py-2 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-xl text-sm font-medium">Login / Sign Up</button>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {session ? (
          <div>
            {/* Language Selector + Add Form + List */}
            <p>Logged in! Full features coming in next steps.</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold mb-4">Sign in to save your vocab</h2>
            <p className="text-zinc-500">Your personal language learning hub</p>
          </div>
        )}
      </div>
    </div>
  );
}
