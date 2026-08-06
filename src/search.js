// Sökning och filtrering av händelser.
//
// Ligger i en egen fil utan JSX och utan Vite-beroenden. Skälet är att
// `scripts/test_search.mjs` ska kunna importera den med bara `node`, precis som
// `scripts/test_helpers.py` kontrollerar nedladdningsskriptet utan ramverk.

// Gemener och utan diakriter. Den som söker snabbt skriver "jamstalldhet" lika
// ofta som "jämställdhet", och NFD plus borttagna diakriter gör de två lika.
function normalize(text) {
  return String(text).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

// Allt sökbart i en händelse som en enda sträng. Årtalet ingår, så "1931" hittar
// Ådalen. `tags` har alltid funnits i datat men har aldrig varit sökbart förrän nu.
function haystack(event) {
  return normalize(
    [event.year, event.title, event.short, event.long, ...(event.tags ?? [])].join(' '),
  )
}

export const ALL_COUNTRIES = 'alla'

// Flera ord smalnar av träffmängden i stället för att vidga den: "strejk 1909"
// ska ge storstrejken, inte allt som rör strejker plus allt från 1909.
export function filterEvents(events, { query = '', country = ALL_COUNTRIES } = {}) {
  const terms = normalize(query).split(/\s+/).filter(Boolean)

  return events.filter((event) => {
    if (country !== ALL_COUNTRIES && event.country !== country) return false
    if (terms.length === 0) return true
    const text = haystack(event)
    return terms.every((term) => text.includes(term))
  })
}
