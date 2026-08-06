import { useState } from 'react'
import events from '../data/events.json'
import { filterEvents, ALL_COUNTRIES } from '../search'
import EpochGroup from './EpochGroup'
import Modal from './Modal'

// Epoker definierade här — lätt att uppdatera titlar och år
const EPOCHS = [
  {
    id: 'informera-och-agitera',
    title: 'Informera och agitera',
    years: '1846–1931',
  },
  {
    id: 'folkhemmet-och-valfardsstaten',
    title: 'Folkhemmet och välfärdsstaten',
    years: '1932–1983',
  },
  {
    id: 'forvaltande',
    title: 'Förvaltande',
    years: '1985–2026',
  },
]

// Värdena måste matcha `country` i events.json, inte etiketten.
const COUNTRIES = [
  { id: ALL_COUNTRIES, label: 'Alla' },
  { id: 'sverige', label: 'Sverige' },
  { id: 'världen', label: 'Världen' },
]

const CHIP = 'px-3 py-1.5 rounded-full text-sm border transition-colors'
const CHIP_ON = 'bg-accent text-white border-accent'
const CHIP_OFF = 'bg-white text-ink/70 border-ink/15 hover:border-accent/50'

export default function Timeline() {
  const [open, setOpen] = useState(null)
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState(ALL_COUNTRIES)

  const sorted = [...events].sort((a, b) => a.year - b.year)
  const visible = filterEvents(sorted, { query, country })
  const filtering = query !== '' || country !== ALL_COUNTRIES

  const clear = () => {
    setQuery('')
    setCountry(ALL_COUNTRIES)
  }

  return (
    <>
      <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* type="search" ger webbläsarens egen rensknapp och Escape-hantering gratis */}
        <input
          type="search"
          name="sok"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök på ord, årtal eller ämne"
          aria-label="Sök i tidslinjen"
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:max-w-xs"
        />

        <div className="flex gap-1.5" role="group" aria-label="Filtrera på område">
          {COUNTRIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCountry(c.id)}
              aria-pressed={country === c.id}
              className={`${CHIP} ${country === c.id ? CHIP_ON : CHIP_OFF}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Antalet visas bara när det säger något, alltså när något är bortfiltrerat */}
      {filtering && (
        <p className="mb-8 text-sm text-ink/50" role="status">
          {visible.length} av {events.length} händelser
        </p>
      )}

      {EPOCHS.map((epoch) => (
        <EpochGroup
          key={epoch.id}
          epoch={epoch}
          events={visible.filter((e) => e.epoch === epoch.id)}
          onOpen={setOpen}
        />
      ))}

      {visible.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-ink/60">Ingen händelse matchar sökningen.</p>
          <button
            type="button"
            onClick={clear}
            className="mt-3 text-sm text-accent underline hover:no-underline"
          >
            Rensa sökning och filter
          </button>
        </div>
      )}

      {open && <Modal event={open} onClose={() => setOpen(null)} />}
    </>
  )
}
