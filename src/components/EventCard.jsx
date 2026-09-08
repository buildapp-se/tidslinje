import { imgSrc, linkIcon } from '../shared'
import { matchHint } from '../search'

// Tailwind-klasser per kortstorlek
const SIZE = {
  large: 'p-5 shadow-md border-l-4',
  medium: 'p-4 shadow-sm border-l-2',
  small: 'p-3 border-l',
}

const TITLE_SIZE = {
  large: 'text-base',
  medium: 'text-sm',
  small: 'text-sm',
}

export default function EventCard({ event, query = '', onOpen }) {
  const hasLinks = event.links && event.links.length > 0
  const thumb    = imgSrc(event.image)
  const showShort = event.size !== 'small'
  // Varför är kortet med i sökresultatet? Ledtråden visas bara när sökordet inte
  // redan syns på kortet, alltså när träffen sitter i den långa texten eller i
  // en tagg. Små kort visar ingen kort text, så för dem räknas bara år och titel.
  const hint = query
    ? matchHint(event, query, `${event.year} ${event.title} ${showShort ? event.short : ''}`)
    : null

  return (
    <button
      onClick={() => onOpen(event)}
      className={`
        text-left w-full bg-white rounded-lg border border-gray-100
        border-l-accent hover:shadow-lg transition-shadow cursor-pointer
        ${SIZE[event.size]}
      `}
    >
      {/* Rubrikrad: år + titel + eventuell thumbnail */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-accent font-bold text-xs mb-1 tracking-wide">
            {event.year}
          </p>
          <h3 className={`font-semibold text-gray-900 leading-snug ${TITLE_SIZE[event.size]}`}>
            {event.title}
          </h3>
        </div>

        {/* Thumbnail, visas på large och medium om bild finns. Krediten får
            inte plats synligt vid 64 px, så den ligger som tooltip; den fulla
            bildtexten med källänk står i modalen ett klick bort. */}
        {thumb && event.size !== 'small' && (
          <img
            src={thumb}
            alt=""
            title={event.imageCredit && [event.imageCredit.caption, event.imageCredit.by].filter(Boolean).join('. ')}
            className="w-16 h-16 object-cover rounded flex-none"
            loading="lazy"
          />
        )}
      </div>

      {/* Kort beskrivning, visas ej på small-kort */}
      {showShort && (
        <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">
          {event.short}
        </p>
      )}

      {/* Sökträff som inte syns i texten ovan: meningen ur den långa texten, eller taggen */}
      {hint && (
        <p className="text-accent/80 text-xs mt-1 italic line-clamp-2 leading-relaxed">
          {hint}
        </p>
      )}

      {/* Länkikoner */}
      {hasLinks && (
        <div className="flex items-center gap-2 mt-2">
          {event.links.map((link, i) => (
            <span key={i} title={link.type} className="text-sm leading-none">
              {linkIcon(link.type, 'w-3.5 h-3.5')}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
