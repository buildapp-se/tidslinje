import { useEffect, useRef, useState } from 'react'
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

// Så långt måste fingret röra sig innan ett tryck blir ett drag.
const DRAG_THRESHOLD = 6
// Kanter där sidan rullar av sig själv medan man drar.
const EDGE = 90

function verdict(score) {
  if (score === ROUNDS) return 'Fullpott! Du kan din historia.'
  if (score >= 8) return 'Riktigt starkt.'
  if (score >= 5) return 'Godkänt, och mer än halvvägs.'
  return 'Tidslinjen är full av överraskningar. Ett varv till?'
}

// Tio prickar: grå för kvar, grön för rätt, röd för fel.
function Pips({ results, onColor = false }) {
  return (
    <ol className="flex gap-1.5" aria-hidden="true">
      {Array.from({ length: ROUNDS }, (_, i) => (
        <li
          key={i}
          className={`h-2 w-2 rounded-full transition-colors ${
            onColor
              ? results[i] === true ? 'bg-white' : results[i] === false ? 'bg-white/60 ring-1 ring-white' : 'bg-black/20'
              : results[i] === true ? 'bg-green-600' : results[i] === false ? 'bg-accent' : 'bg-ink/15'
          }`}
        />
      ))}
    </ol>
  )
}

function Card({ event, year, tone = 'plain', className = '' }) {
  const thumb = imgSrc(event.image)
  const TONE = {
    plain: 'border-gray-100 bg-white',
    right: 'border-green-600 bg-green-50 ring-2 ring-green-600 motion-safe:animate-pop',
    wrong: 'border-accent bg-red-50 ring-2 ring-accent motion-safe:animate-shake',
  }
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 shadow-xs ${TONE[tone]} ${className}`}>
      <span
        className={`w-12 flex-none text-center text-sm font-bold tabular-nums ${tone === 'right' ? 'text-green-800' : 'text-accent'}`}
      >
        {year ?? '?'}
      </span>
      <span className="min-w-0 flex-1 text-sm leading-snug text-gray-900">{event.title}</span>
      {thumb && <img src={thumb} alt="" className="h-10 w-10 flex-none rounded-md object-cover" loading="lazy" />}
    </div>
  )
}

export default function Game() {
  const [game, setGame] = useState(() => newGame(events))
  const [revealing, setRevealing] = useState(false)
  // drag: var kortet hålls (x, y), greppunkten i kortet och vilken plats som är vald.
  const [drag, setDrag] = useState(null)
  const press = useRef(null)
  const list = useRef(null)
  const items = useRef([])
  const nextButton = useRef(null)

  const { timeline, deck, score, results, last } = game
  const current = revealing ? null : deck[0]
  const finished = !revealing && deck.length === 0
  const played = results.length

  // Platsen under fingret: antal kort vars mitt ligger ovanför. Utanför listan
  // finns ingen plats, så ett kort som släpps där åker tillbaka.
  function slotAt(x, y) {
    const box = list.current?.getBoundingClientRect()
    if (!box || x < box.left - 40 || x > box.right + 40 || y < box.top - 60 || y > box.bottom + 60) return null
    return items.current
      .slice(0, timeline.length)
      .filter((el) => {
        const r = el.getBoundingClientRect()
        return r.top + r.height / 2 < y
      }).length
  }

  function commit(index) {
    const next = place(game, index)
    setGame(next)
    setRevealing(true)
    navigator.vibrate?.(next.last.ok ? 25 : [70, 50, 70])
  }

  function onPointerDown(e) {
    if (e.button !== 0) return
    const r = e.currentTarget.getBoundingClientRect()
    press.current = { x: e.clientX, y: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top, w: r.width }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e) {
    const p = press.current
    if (!p) return
    if (!drag && Math.hypot(e.clientX - p.x, e.clientY - p.y) < DRAG_THRESHOLD) return
    setDrag({ ...p, x: e.clientX, y: e.clientY, slot: slotAt(e.clientX, e.clientY) })
  }

  function onPointerUp() {
    press.current = null
    if (drag?.slot != null) commit(drag.slot)
    setDrag(null)
  }

  function onPointerCancel() {
    press.current = null
    setDrag(null)
  }

  // Rulla sidan när kortet hålls nära över- eller underkanten, så att en lång
  // tidslinje går att nå i mobilen utan att släppa kortet.
  const dragging = drag !== null
  const pointer = useRef(null)
  pointer.current = drag
  useEffect(() => {
    if (!dragging) return
    let frame
    const tick = () => {
      const d = pointer.current
      if (d) {
        const speed =
          d.y < EDGE ? -(EDGE - d.y) / 4 : d.y > innerHeight - EDGE ? (d.y - (innerHeight - EDGE)) / 4 : 0
        if (speed) {
          scrollBy(0, speed)
          setDrag((cur) => cur && { ...cur, slot: slotAt(cur.x, cur.y) })
        }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [dragging])

  // Tangentbord: nästa-knappen får fokus direkt, så Enter går vidare.
  useEffect(() => {
    if (revealing) nextButton.current?.focus({ preventScroll: true })
  }, [revealing])

  function restart() {
    setGame(newGame(events))
    setRevealing(false)
  }

  // Tidslinjen med det som ska in mellan korten: tryckplatser, släppmarkör
  // under drag, och facit under återkopplingen.
  const between = (i) => {
    if (dragging) {
      return drag.slot === i ? (
        <li key={`drop-${i}`} aria-hidden="true">
          <div className="flex min-h-[52px] items-center justify-center rounded-xl border-2 border-dashed border-accent bg-accent/5 text-sm font-semibold text-accent motion-safe:animate-pop">
            Släpp här: {slotLabel(timeline, i).toLowerCase()}
          </div>
        </li>
      ) : null
    }
    if (current) {
      return (
        <li key={`slot-${i}`}>
          <button
            type="button"
            onClick={() => commit(i)}
            className="group flex min-h-[44px] w-full items-center gap-2 rounded-xl text-xs font-medium text-accent/80 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            <span className="h-px flex-1 border-t border-dashed border-accent/40 group-hover:border-accent" />
            <span className="rounded-full border border-dashed border-accent/50 bg-white px-3 py-1 group-hover:border-solid group-hover:border-accent group-hover:bg-accent group-hover:text-white">
              + {slotLabel(timeline, i)}
            </span>
            <span className="h-px flex-1 border-t border-dashed border-accent/40 group-hover:border-accent" />
          </button>
        </li>
      )
    }
    if (revealing && !last.ok) {
      const out = []
      if (last.index === i)
        out.push(
          <li key={`wrong-${i}`}>
            <Card event={last.card} year="✕" tone="wrong" />
            <p className="mt-1 text-center text-xs font-semibold text-accent">Du lade den här</p>
          </li>,
        )
      if (last.right === i)
        out.push(
          <li key={`right-${i}`}>
            <Card event={last.card} year={last.card.year} tone="right" className="border-dashed" />
            <p className="mt-1 text-center text-xs font-semibold text-green-800">Hit hörde den</p>
          </li>,
        )
      return out
    }
    return null
  }

  return (
    <section aria-label="Spel: lägg korten i ordning" className="mx-auto max-w-md">
      <h2 className="text-center text-2xl font-bold text-accent">Lägg kortet rätt</h2>
      <p className="mt-2 mb-6 text-center text-sm text-ink/70">
        Dra kortet till rätt plats i tidslinjen, eller tryck på en plats. Rätt kort stannar kvar.
      </p>

      <div className="sticky top-2 z-20 mb-4">
        {/* Återkopplingen ligger i en status-region så att skärmläsare får facit
            utan att fokus flyttas. */}
        <div role="status" className="sr-only">
          {revealing && `${last.ok ? 'Rätt' : 'Fel'}: ${last.card.title} var ${last.card.year}.`}
        </div>

        {current && (
          <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5">
            <div className="mb-3 flex items-center justify-between text-xs text-ink/70">
              <span>
                Kort {played + 1} av {ROUNDS} · {score} rätt
              </span>
              <Pips results={results} />
            </div>
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              className={`flex cursor-grab touch-none select-none items-center gap-3 rounded-xl border-2 border-accent bg-cream/40 p-3 transition-opacity active:cursor-grabbing ${dragging ? 'opacity-30' : ''}`}
            >
              <span aria-hidden="true" className="grid flex-none grid-cols-2 gap-0.5 text-accent/60">
                {Array.from({ length: 6 }, (_, i) => (
                  <span key={i} className="h-1 w-1 rounded-full bg-current" />
                ))}
              </span>
              <h3 className="min-w-0 flex-1 font-semibold leading-snug text-gray-900">{current.title}</h3>
              {imgSrc(current.image) && (
                <img
                  src={imgSrc(current.image)}
                  alt=""
                  draggable="false"
                  className="h-16 w-16 flex-none rounded-lg object-cover"
                />
              )}
            </div>
            <p className="mt-2 text-center text-xs text-ink/60">Håll och dra kortet ner i tidslinjen</p>
          </div>
        )}

        {revealing && (
          <div
            className={`rounded-2xl p-4 shadow-lg ring-1 motion-safe:animate-pop ${
              last.ok ? 'bg-green-700 text-white ring-green-800' : 'bg-accent text-white ring-black/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid h-10 w-10 flex-none place-items-center rounded-full bg-white/20 text-xl font-bold"
              >
                {last.ok ? '✓' : '✕'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold">{last.ok ? 'Rätt!' : 'Inte riktigt'}</p>
                <p className="text-sm text-white/90">
                  {last.card.title} var <strong className="text-white">{last.card.year}</strong>.
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <Pips results={results} onColor />
              <button
                ref={nextButton}
                type="button"
                onClick={() => setRevealing(false)}
                className="min-h-[44px] rounded-full bg-white px-5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {deck.length ? 'Nästa kort →' : 'Se resultatet →'}
              </button>
            </div>
          </div>
        )}

        {finished && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-lg ring-1 ring-black/5 motion-safe:animate-pop">
            <p className="text-4xl font-bold text-accent tabular-nums">
              {score}/{ROUNDS}
            </p>
            <p className="mt-1 font-semibold text-gray-900">{verdict(score)}</p>
            <div className="mt-3 flex justify-center">
              <Pips results={results} />
            </div>
            <button
              type="button"
              onClick={restart}
              className="mt-4 min-h-[44px] rounded-full bg-accent px-6 text-sm font-semibold text-white hover:bg-accent/90"
            >
              Spela igen
            </button>
          </div>
        )}
      </div>

      <ol ref={list} className="relative space-y-2 pb-24">
        {timeline.map((event, i) => [
          between(i),
          <li key={event.id} ref={(el) => (items.current[i] = el)}>
            <Card
              event={event}
              year={event.year}
              tone={revealing && last.ok && last.card.id === event.id ? 'right' : 'plain'}
            />
          </li>,
        ])}
        {between(timeline.length)}
      </ol>

      {/* Kortet som följer fingret. Det riktiga kortet ligger kvar, nedtonat,
          och håller i pekaren så att drag fortsätter även utanför det. */}
      {dragging && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-50 flex items-center gap-3 rounded-xl border-2 border-accent bg-white p-3 shadow-2xl"
          style={{
            left: drag.x - drag.ox,
            top: drag.y - drag.oy,
            width: drag.w,
            transform: `rotate(${drag.slot == null ? -4 : -1.5}deg) scale(1.03)`,
          }}
        >
          <h3 className="min-w-0 flex-1 font-semibold leading-snug text-gray-900">{deck[0].title}</h3>
          {imgSrc(deck[0].image) && (
            <img src={imgSrc(deck[0].image)} alt="" className="h-16 w-16 flex-none rounded-lg object-cover" />
          )}
        </div>
      )}
    </section>
  )
}
