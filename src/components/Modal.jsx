import { useEffect, useRef } from 'react'
import { imgSrc, linkIcon, LINK_LABEL } from '../shared'

// Det som går att nå med Tab inne i dialogen.
const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function Modal({ event, onClose }) {
  const closeRef = useRef(null)
  const panelRef = useRef(null)
  // onClose skickas in som ny funktion vid varje rendering av Timeline. Via en
  // ref körs effekten nedan bara en gång per öppning, så fokus inte flyttas om.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    // Fokus tillbaka till kortet som öppnade dialogen när den stängs, annars
    // hamnar tangentbordsanvändaren högst upp på sidan (WCAG 2.4.3).
    const opener = document.activeElement
    const handler = (e) => {
      if (e.key === 'Escape') { onCloseRef.current(); return }
      if (e.key !== 'Tab' || !panelRef.current) return
      // Fokusfälla: Tab från sista länken går till stängknappen och Skift+Tab
      // från stängknappen till sista länken, i stället för ut till korten bakom.
      const items = [...panelRef.current.querySelectorAll(FOCUSABLE)]
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const inside = panelRef.current.contains(document.activeElement)
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault(); first.focus()
      }
    }
    document.addEventListener('keydown', handler)
    closeRef.current?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = prevOverflow
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
    }
  }, [])

  const imgUrl = imgSrc(event.image)
  const credit = event.imageCredit

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={event.title}
    >
      <div
        ref={panelRef}
        className="bg-white max-w-xl w-full rounded-xl shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Stor bild högst upp, visas bara om bild finns.
            Bildtexten är inte pynt: bilderna är hämtade från Wikimedia
            Commons och licenserna kräver att upphovsmannen namnges. Flera av
            bilderna är dessutom tidstypiska illustrationer snarare än foton
            av själva händelsen, och då behöver läsaren veta vad hen ser. */}
        {imgUrl && (
          <figure className="m-0">
            <img
              src={imgUrl}
              alt={credit?.caption || event.title}
              className="w-full h-52 object-cover rounded-t-xl"
            />
            {credit && (
              <figcaption className="px-6 pt-2 text-[11px] text-gray-600 leading-snug">
                {credit.caption && <span>{credit.caption}. </span>}
                <a
                  href={credit.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-accent"
                >
                  {credit.by}
                </a>
              </figcaption>
            )}
          </figure>
        )}

        <div className="p-6">
          {/* Huvud: år + titel + stängknapp */}
          <div className="flex justify-between items-start mb-5">
            <div>
              <span className="text-accent font-bold text-sm tracking-wide">
                {event.year}
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-1 leading-tight">
                {event.title}
              </h2>
            </div>
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Stäng"
              className="flex-none inline-flex items-center justify-center w-11 h-11 -mr-3 -mt-2 ml-1 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* Lång beskrivning */}
          <p className="text-gray-700 leading-relaxed text-sm">{event.long}</p>

          {/* Länkikoner */}
          {event.links && event.links.length > 0 && (
            <div className="flex flex-wrap gap-x-4 mt-6 pt-2 border-t border-gray-100">
              {event.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 min-h-[44px] text-sm text-gray-600 hover:text-accent transition-colors"
                >
                  {linkIcon(link.type, 'w-[18px] h-[18px]')}
                  <span>{LINK_LABEL[link.type] || link.type}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
