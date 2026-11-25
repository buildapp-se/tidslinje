// Inline SVG (inte <img>) så webbfonterna i src/index.css faktiskt används.
export default function Logo({ className = 'h-7 sm:h-9 w-auto' }) {
  return (
    <svg viewBox="0 0 560 48" className={className} role="img" aria-label="Arbetarrörelsens tidslinje">
      {/* Fyllningen i en SVG tvingas inte om. I mörkt högkontrastläge blev den
          nästan svarta texten osynlig, därför CanvasText där. */}
      <text x="0" y="34" className="forced-colors:fill-[CanvasText]" fontFamily="Fraunces, serif" fontWeight="500" fontSize="26" letterSpacing="-0.26" fill="#1A1A1A">
        Arbetarrörelsens
      </text>
      <text x="222" y="34" fontFamily="Archivo, sans-serif" fontWeight="800" fontSize="26" letterSpacing="0.52" fill="#B0342B">
        TIDSLINJE
      </text>
      <rect x="392" y="21" width="150" height="5" rx="2.5" fill="#B0342B" />
      <circle cx="545" cy="23.5" r="6" fill="#B0342B" />
    </svg>
  )
}
