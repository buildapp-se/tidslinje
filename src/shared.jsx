import { WikiIcon, PodcastIcon, VideoIcon } from './components/icons'

// Löser sökväg för bilder i public/ med hänsyn till Vite:s base-URL.
// Ligger här och inte i komponenterna: regeln måste vara identisk i kort och
// modal, och när den fanns i två kopior var det bara en tidsfråga innan de
// gled isär och bilderna slutade fungera under GitHub Pages underkatalog.
export function imgSrc(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${import.meta.env.BASE_URL}${path}`
}

// Ikon per länktyp. Storleken skickas in eftersom kortet vill ha mindre
// ikoner än modalen, allt annat är gemensamt.
const ICON = { wiki: WikiIcon, podcast: PodcastIcon, video: VideoIcon }

export function linkIcon(type, className) {
  const Icon = ICON[type]
  return Icon ? <Icon className={className} /> : '🔗'
}

export const LINK_LABEL = { podcast: 'Podcast', video: 'Video', wiki: 'Läs mer' }
