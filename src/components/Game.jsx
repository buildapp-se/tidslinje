import { useState } from 'react'
import events from '../data/events.json'
import { ROUNDS, newGame, place } from '../game'
import { imgSrc } from '../shared'

// Etiketten säger var kortet hamnar, i klartext. Den är både knappens synliga
// text och det skärmläsaren läser upp, så ingen aria-label behövs.
function slotLabel(timeline, index) {
  const before = timeline[index - 1]
  const after = timeline[index]
  if (!before) return `Före ${after.year}`
  if (!after) return `Efter ${before.year}`
  if (before.year === after.year) return `Mellan ${before.year} och ${after.year} (samma år)`
  return `Mellan ${before.year} och ${after.year}`
}

const SLOT =
  'w-full min-h-[44px] rounded-lg border border-dashed border-accent/60 text-sm text-accent hover:bg-accent hover:text-white transition-colors'

export default function Game() {
  const [game, setGame] = useState(() => newGame(events))
  const { timeline, deck, score, last } = game
  const current = deck[0]
  const played = ROUNDS - deck.length
  const thumb = current && imgSrc(current.image)

  return (
    <section aria-label="Spel: lägg korten i ordning">
      <h2 className="text-2xl font-bold text-accent text-center">Lägg kortet rätt</h2>
      <p className="mt-2 mb-8 text-center text-sm text-ink/70">
        Du får en händelse utan årtal. Tryck på platsen i tidslinjen där den hör hemma.
        Rätt lagt kort stannar kvar, fel lagt kort läggs åt sidan.
      </p>

      {/* Återkopplingen ligger i en status-region så att skärmläsare får facit
          utan att fokus flyttas. */}
      <p className="mb-4 min-h-[1.5rem] text-center text-sm font-semibold" role="status">
        {last && (
          <span className={last.ok ? 'text-green-800' : 'text-accent'}>
            {last.ok ? 'Rätt' : 'Fel'}: {last.card.title} var {last.card.year}.
          </span>
        )}
      </p>

      {current ? (
        // Kortet följer med när tidslinjen blir längre än skärmen.
        <div className="sticky top-2 z-10 mb-6 flex items-center gap-3 rounded-lg border-l-4 border-accent bg-white p-4 shadow-md">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink/70">
              Kort {played + 1} av {ROUNDS}, {score} rätt
            </p>
            <h3 className="mt-1 font-semibold leading-snug text-gray-900">{current.title}</h3>
          </div>
          {thumb && <img src={thumb} alt="" className="h-16 w-16 flex-none rounded object-cover" />}
        </div>
      ) : (
        <div className="mb-6 rounded-lg bg-white p-6 text-center shadow-md">
          <p className="text-lg font-bold text-gray-900">
            {score} av {ROUNDS} rätt
          </p>
          <button
            type="button"
            onClick={() => setGame(newGame(events))}
            className="mt-3 min-h-[44px] rounded-full bg-accent px-5 text-sm text-white"
          >
            Spela igen
          </button>
        </div>
      )}

      <ol className="mx-auto max-w-md space-y-2">
        {timeline.map((event, i) => (
          <li key={event.id} className="space-y-2">
            {current && (
              <button type="button" className={SLOT} onClick={() => setGame(place(game, i))}>
                {slotLabel(timeline, i)}
              </button>
            )}
            <p className="rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm text-gray-900">
              <span className="mr-2 font-bold text-accent">{event.year}</span>
              {event.title}
            </p>
          </li>
        ))}
        {current && (
          <li>
            <button type="button" className={SLOT} onClick={() => setGame(place(game, timeline.length))}>
              {slotLabel(timeline, timeline.length)}
            </button>
          </li>
        )}
      </ol>
    </section>
  )
}
