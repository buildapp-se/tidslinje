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
// Kanter där sidan rullar av sig själv medan man drar. Överkanten räknas från
// den klistrade panelens underkant, eftersom panelen täcker toppen av sidan.
const EDGE = 80
const MAX_SPEED = 22

function verdict(score) {
  if (score === ROUNDS) return 'Fullpott! Du kan din historia.'
  if (score >= 8) return 'Riktigt starkt.'
  if (score >= 5) return 'Godkänt, och mer än halvvägs.'
  return 'Tidslinjen är full av överraskningar. Ett varv till?'
}

// Tio prickar: grå för kvar, grön för rätt, röd för fel. På färgad panel:
// fylld för rätt, ihålig för fel, så att de skiljs åt utan färg.
function Pips({ results, onColor = false }) {
  return (
    <ol className="flex gap-1 sm:gap-1.5" aria-hidden="true">
      {Array.from({ length: ROUNDS }, (_, i) => (
        <li
          key={i}
          className={`h-2 w-2 rounded-full transition-colors ${
            onColor
              ? results[i] === true ? 'bg-white' : results[i] === false ? 'ring-2 ring-white ring-inset' : 'bg-black/20'
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
        {year}
      </span>
      <span className="min-w-0 flex-1 text-sm leading-snug text-gray-900 hyphens-auto [overflow-wrap:anywhere]">{event.title}</span>
      {thumb && <img src={thumb} alt="" className="h-10 w-10 flex-none rounded-md object-cover" loading="lazy" />}
    </div>
  )
}

// Kortet på hand: samma uppställning som tidslinjens kort men med ett "?" där
// årtalet brukar stå, så att det syns vad som saknas och var det ska in.
function HandCard({ event, titleRef, className = '' }) {
  const thumb = imgSrc(event.image)
  return (
    <div className={`flex items-center gap-3 rounded-xl border-2 border-accent bg-white p-2.5 ${className}`}>
      <span aria-hidden="true" className="grid flex-none grid-cols-2 gap-0.5 text-accent/60">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="h-1 w-1 rounded-full bg-current" />
        ))}
      </span>
      <span
        aria-hidden="true"
        className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-accent text-lg font-bold text-white"
      >
        ?
      </span>
      <h3 ref={titleRef} tabIndex={-1} className="min-w-0 flex-1 font-semibold leading-snug text-gray-900 outline-none hyphens-auto [overflow-wrap:anywhere]">
        {event.title}
      </h3>
      {thumb && (
        <img
          src={thumb}
          alt=""
          draggable="false"
          className="h-12 w-12 flex-none rounded-lg object-cover sm:h-16 sm:w-16"
        />
      )}
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
  const panel = useRef(null)
  const items = useRef([])
  const nextButton = useRef(null)
  const handTitle = useRef(null)

  const { timeline, deck, score, results, last } = game
  const current = revealing ? null : deck[0]
  const finished = !revealing && deck.length === 0
  const played = results.length

  // Platsen under fingret: antal kort vars mitt ligger ovanför. Tillbaka över
  // panelen, eller långt vid sidan, finns ingen plats: kortet åker tillbaka.
  // Under sista kortet räknas som sist, så att man kan släppa i luften där.
  function slotAt(x, y) {
    const box = list.current?.getBoundingClientRect()
    const top = panel.current?.getBoundingClientRect().bottom ?? 0
    if (!box || y < top || x < box.left - 80 || x > box.right + 80) return null
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
        const top = (panel.current?.getBoundingClientRect().bottom ?? 0) + EDGE
        const bottom = innerHeight - EDGE
        const raw = d.y < top ? -(top - d.y) / 3 : d.y > bottom ? (d.y - bottom) / 3 : 0
        const speed = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, raw))
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

  // Efter ett fel: se till att både felet och facit syns under panelen, även
  // i en lång tidslinje. Får de inte plats båda två vinner facit.
  // Tangentbord: nästa-knappen får fokus, så Enter går vidare.
  useEffect(() => {
    if (!revealing) return
    nextButton.current?.focus({ preventScroll: true })
    const marks = [...(list.current?.querySelectorAll('[data-mark]') ?? [])].map((el) => el.getBoundingClientRect())
    if (!marks.length) return
    const view = (panel.current?.getBoundingClientRect().bottom ?? 0) + 8
    const top = Math.min(...marks.map((r) => r.top))
    const bottom = Math.max(...marks.map((r) => r.bottom))
    if (top >= view && bottom <= innerHeight) return
    const room = innerHeight - view
    const answerTop = list.current.querySelector('[data-mark="answer"]').getBoundingClientRect().top
    const dy = bottom - top <= room ? (top + bottom) / 2 - (view + room / 2) : answerTop - view
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    scrollBy({ top: dy, behavior: still ? 'auto' : 'smooth' })
  }, [revealing])

  // Nästa kort: fokus på kortets titel, så att skärmläsaren läser det och Tab
  // går vidare till platserna. Inte vid start, då ska sidan inte hoppa.
  useEffect(() => {
    if (!revealing && played > 0) handTitle.current?.focus({ preventScroll: true })
  }, [revealing, played])

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
          <div className="flex min-h-[56px] items-center justify-center rounded-xl border-2 border-dashed border-accent bg-accent/10 text-sm font-semibold text-accent motion-safe:animate-pop">
            Släpp här
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
            className="group flex min-h-[44px] w-full items-center gap-2 rounded-xl text-xs font-medium text-accent focus-visible:outline-2 focus-visible:outline-accent"
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
          <li key={`wrong-${i}`} data-mark>
            <Card event={last.card} year="✕" tone="wrong" />
            <p className="mt-1 text-center text-xs font-semibold text-accent">Du lade den här</p>
          </li>,
        )
      if (last.right === i)
        out.push(
          <li key={`right-${i}`} data-mark="answer">
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
      <h2 className="text-center text-xl font-bold text-accent sm:text-2xl">Lägg kortet rätt</h2>
      <p className="mt-1 mb-4 text-center text-sm text-ink/70 sm:mt-2 sm:mb-6">
        Dra kortet till rätt år i tidslinjen, eller tryck på en plats.
      </p>

      <div ref={panel} className="sticky top-2 z-20 mb-4">
        {/* Återkopplingen ligger i en status-region så att skärmläsare får facit
            utan att fokus flyttas. */}
        <div role="status" className="sr-only">
          {revealing && `${last.ok ? 'Rätt' : 'Fel'}: ${last.card.title} var ${last.card.year}.`}
        </div>

        {current && (
          <div className="rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5 sm:p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-ink/70">
              <span>
                Kort {played + 1} av {ROUNDS} · {score} rätt
              </span>
              <Pips results={results} />
            </div>
            <div
              data-hand
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              className={`cursor-grab touch-none select-none rounded-xl transition duration-150 active:cursor-grabbing motion-safe:hover:-translate-y-0.5 hover:shadow-md ${
                dragging ? 'opacity-30' : ''
              }`}
            >
              <HandCard event={current} titleRef={handTitle} className="bg-cream/40" />
            </div>
            {/* Under draget säger raden var kortet hamnar, eftersom fingret och
                kortet täcker själva släppmarkören. */}
            <p
              aria-hidden={dragging}
              className={`mt-2 text-center text-sm ${dragging && drag.slot != null ? 'font-semibold text-accent' : 'text-ink/70'}`}
            >
              {!dragging
                ? 'Håll i kortet och dra det ner i tidslinjen ↓'
                : drag.slot == null
                  ? 'Släpp här för att ångra'
                  : `Släpp: ${slotLabel(timeline, drag.slot).toLowerCase()}`}
            </p>
          </div>
        )}

        {revealing && (
          <div
            className={`rounded-2xl p-4 text-white shadow-lg ring-1 motion-safe:animate-pop ${
              last.ok ? 'bg-green-700 ring-green-800' : 'bg-accent ring-black/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`grid h-11 w-11 flex-none place-items-center rounded-full bg-white text-2xl font-bold ${
                  last.ok ? 'text-green-700' : 'text-accent'
                }`}
              >
                {last.ok ? '✓' : '✕'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold">{last.ok ? 'Rätt!' : 'Inte riktigt'}</p>
                <p className="text-sm text-white">
                  {last.card.title} var <strong>{last.card.year}</strong>
                  {last.ok ? '.' : `, alltså ${slotLabel(timeline, last.right).toLowerCase()}.`}
                </p>
                <p className="text-xs text-white/90">
                  {last.ok ? 'Kortet stannar i tidslinjen.' : 'Kortet läggs åt sidan.'}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <Pips results={results} onColor />
              <button
                ref={nextButton}
                type="button"
                onClick={() => setRevealing(false)}
                className="min-h-[44px] flex-none whitespace-nowrap rounded-full bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
          <li key={event.id} data-year={event.year} ref={(el) => (items.current[i] = el)}>
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
          och håller i pekaren så att drag fortsätter även utanför det. Över en plats
          låser det sig i tidslinjens spalt, så att det ligger där det landar. */}
      {dragging && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-50"
          style={{
            left: drag.slot == null ? drag.x - drag.ox : list.current.getBoundingClientRect().left,
            top: drag.y - drag.oy,
            width: drag.slot == null ? drag.w : list.current.offsetWidth,
            transform: `rotate(${drag.slot == null ? -4 : -1.5}deg) scale(1.04)`,
          }}
        >
          <HandCard event={deck[0]} className="shadow-2xl" />
        </div>
      )}
    </section>
  )
}
