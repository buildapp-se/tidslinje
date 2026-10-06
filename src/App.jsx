import { useState } from 'react'
import Timeline from './components/Timeline'
import Game from './components/Game'
import Logo from './components/Logo'

export default function App() {
  // Bara useState, ingen URL: en delad länk ska visa tidslinjen, som sökläget.
  const [playing, setPlaying] = useState(false)

  return (
    <div className="min-h-screen bg-cream">
      <header className="py-10 px-4 text-center">
        <Logo className="h-7 sm:h-9 w-auto mx-auto" />
        <p className="mt-3 text-ink/70 text-sm">Klass, kamp och kompromiss: från 1846 till i dag</p>
        <button
          type="button"
          onClick={() => setPlaying(!playing)}
          className="mt-4 min-h-[44px] rounded-full border border-accent px-4 text-sm text-accent hover:bg-accent hover:text-white transition-colors"
        >
          {playing ? 'Tillbaka till tidslinjen' : 'Spela: lägg korten i ordning'}
        </button>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-12">
        {playing ? <Game /> : <Timeline />}
      </main>
      <footer className="max-w-4xl mx-auto px-4 pb-10 text-sm text-ink/70">
        <a className="inline-flex min-h-[44px] items-center hover:text-accent underline underline-offset-2" href="integritet.html">
          Integritetspolicy
        </a>
      </footer>
    </div>
  )
}
