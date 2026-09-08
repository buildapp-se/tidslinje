// Wikipedia-ikon, cirkel med serif-"W", ersätter boksymbolen som lätt
// förväxlades med en generisk läsningsikon.
export function WikiIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <text
        x="10"
        y="14.5"
        textAnchor="middle"
        fontSize="10.5"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="bold"
        fill="currentColor"
      >
        W
      </text>
    </svg>
  )
}

// Mikrofon för podcast och en spelknapp för video. Emojin (🎙️ 🎬) var färgglad
// och olika stor på varje plattform, och bredvid den svarta W-ikonen såg raden
// ut som tre olika ikonuppsättningar. Egna SVG:er följer currentColor, så de
// byter färg med länken vid hover precis som W:et.
export function PodcastIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="7" y="2" width="6" height="10" rx="3" />
      <path d="M4 9.5a6 6 0 0 0 12 0M10 15.5V18M7 18h6" />
    </svg>
  )
}

export function VideoIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <rect x="2" y="3.5" width="16" height="13" rx="2.5" />
      <path d="M8.5 7.5v5l4-2.5z" fill="currentColor" />
    </svg>
  )
}
