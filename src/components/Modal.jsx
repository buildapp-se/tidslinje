import { useEffect, useRef } from 'react'
import { imgSrc, linkIcon, LINK_LABEL } from '../shared'

export default function Modal({ event, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    closeRef.current?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

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
        className="bg-white max-w-xl w-full rounded-xl shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Stor bild högst upp — visas bara om bild finns.
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
              <figcaption className="px-6 pt-2 text-[11px] text-gray-400 leading-snug">
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
              className="text-gray-400 hover:text-gray-700 text-xl leading-none ml-4 mt-0.5"
            >
              ✕
            </button>
          </div>

          {/* Lång beskrivning */}
          <p className="text-gray-700 leading-relaxed text-sm">{event.long}</p>

          {/* Länkikoner */}
          {event.links && event.links.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-100">
              {event.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-accent transition-colors"
                >
                  <span className="text-lg">{linkIcon(link.type, 'w-[18px] h-[18px]')}</span>
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
