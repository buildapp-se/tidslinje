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

// Ett sökord mot en normaliserad text. Korta bokstavsord är nästan alltid
// förkortningar, och som delsträng träffar de allt: "lo" gav 43 av 77 (lockout,
// lön, blockad), "ad" 69. Därför: ett eller två bokstäver måste vara ett helt ord
// (LO, AD, EU), tre bokstäver en ordbörjan (LAS, SAF, men också "str" medan man
// skriver "strejk"). Fyra och fler matchar var som helst, så att "strejk" hittar
// "storstrejken". Siffror matchar alltid var som helst: "193" ger 1930-talet.
function has(text, term) {
  if (term.length > 3 || !/^\p{L}+$/u.test(term)) return text.includes(term)
  const words = text.split(/[^\p{L}\p{N}]+/u)
  return term.length === 3 ? words.some((w) => w.startsWith(term)) : words.includes(term)
}

// Varför visas kortet? Kortet visar år, titel och (på större kort) den korta
// texten, men sökningen går även på den långa texten och taggarna. När träffen
// bara finns där ser läsaren inte varför Saltsjöbadsavtalet dyker upp på
// "semester". Då returneras den mening i den långa texten som innehåller
// sökordet, annars taggen. Hela meningar i stället för utdrag runt ordet:
// normaliseringen ändrar teckenpositioner (å blir a plus ring), så ett index i
// den normaliserade texten pekar inte säkert rätt i originalet.
export function matchHint(event, query, shown) {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  const visible = normalize(shown)
  const missing = terms.filter((term) => !has(visible, term))
  if (missing.length === 0) return null
  // Meningsgräns = skiljetecken, blanksteg och versal eller siffra. Så delar
  // varken "t.ex. driftsinskränkningar" eller Joe Hills citat med utropstecken
  // meningen mitt itu.
  const sentences = String(event.long).split(/(?<=[.!?])\s+(?=[\p{Lu}\d])/u)
  const sentence = sentences.find((s) => missing.some((term) => has(normalize(s), term)))
  if (sentence) return sentence.trim()
  const tag = (event.tags ?? []).find((t) => missing.some((term) => has(normalize(t), term)))
  return tag ? `Ämne: ${tag}` : null
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
    return terms.every((term) => has(text, term))
  })
}
