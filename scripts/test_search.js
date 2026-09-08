// Snabbkoll på sökningen och områdesfiltret.  Kör:  node scripts/test_search.js
//
// Samma tanke som test_helpers.py: bara det som kan gå sönder tyst. Ett trasigt
// filter ser man direkt i webbläsaren, men en normalisering som slutar tåla å, ä
// och ö ger färre träffar utan att något ser fel ut.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { filterEvents, matchHint, ALL_COUNTRIES } from '../src/search.js'

const events = JSON.parse(
  readFileSync(fileURLToPath(new URL('../src/data/events.json', import.meta.url)), 'utf-8'),
)

const ids = (result) => result.map((e) => e.id)

// Tom sökning och `alla` släpper igenom allt. Startläget får aldrig dölja något.
assert.equal(filterEvents(events).length, events.length)
assert.equal(filterEvents(events, { query: '   ' }).length, events.length)

// Årtal är sökbart, inte bara text.
assert.ok(ids(filterEvents(events, { query: '1931' })).includes('1931-adalen'))

// Å, ä och ö får inte krävas av den som söker.
assert.deepEqual(
  ids(filterEvents(events, { query: 'jamstalldhet' })),
  ids(filterEvents(events, { query: 'jämställdhet' })),
)
assert.ok(filterEvents(events, { query: 'jamstalldhet' }).length > 0)

// Sökningen går på tags också, som datat alltid haft men aldrig exponerat.
assert.ok(filterEvents(events, { query: 'semester' }).length > 0)

// Flera ord smalnar av. Träffarna måste vara en delmängd av vart och ett av dem.
const strejk = new Set(ids(filterEvents(events, { query: 'strejk' })))
for (const id of ids(filterEvents(events, { query: 'strejk 1909' }))) {
  assert.ok(strejk.has(id), `"strejk 1909" gav ${id} som "strejk" ensamt inte ger`)
}

// Området filtrerar, och de tre valen täcker precis alla händelser.
const sverige = filterEvents(events, { country: 'sverige' })
const varlden = filterEvents(events, { country: 'världen' })
assert.ok(sverige.every((e) => e.country === 'sverige'))
assert.equal(sverige.length + varlden.length, events.length)
assert.equal(filterEvents(events, { country: ALL_COUNTRIES }).length, events.length)

// Sökning och område gäller samtidigt, inte det ena eller det andra.
assert.ok(filterEvents(events, { query: 'strejk', country: 'världen' }).every(
  (e) => e.country === 'världen',
))

// Träffledtråden: bara när sökordet inte redan syns på kortet, och då den
// mening i den långa texten som innehåller det. Saltsjöbadsavtalet på "semester"
// är fallet som startade det hela.
const saltsjobad = events.find((e) => e.id === '1938-saltsjobad')
const shownOnCard = `${saltsjobad.year} ${saltsjobad.title} ${saltsjobad.short}`
const hint = matchHint(saltsjobad, 'semester', shownOnCard)
assert.ok(hint && hint.includes('semester'), `ledtråd saknas: ${hint}`)
assert.ok(hint.length < saltsjobad.long.length, 'ledtråden ska vara en mening, inte hela texten')
assert.equal(matchHint(saltsjobad, 'saltsjöbadsavtalet', shownOnCard), null)
assert.equal(matchHint(saltsjobad, '1938', shownOnCard), null)
assert.equal(matchHint(saltsjobad, '', shownOnCard), null)
// Å, ä, ö får inte krävas i ledtråden heller.
assert.ok(matchHint(saltsjobad, 'forhandlingsordning', shownOnCard)?.includes('förhandlingsordning'))
// Träff bara i taggarna ger taggen.
const ad = events.find((e) => e.id === '1929-arbetsdomstolen')
assert.equal(matchHint(ad, 'rattsvasende', `${ad.year} ${ad.title} ${ad.short}`), 'Ämne: rättsväsende')

console.log(`alla kontroller OK (${events.length} händelser)`)
