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
// mening i den långa texten som innehåller det. Valsegern 1932 dyker upp på
// "adalen" för att långtexten nämner skotten, och det ska kortet kunna visa.
const val1932 = events.find((e) => e.id === '1932-sap-makten')
const shownOnCard = `${val1932.year} ${val1932.title} ${val1932.short}`
const hint = matchHint(val1932, 'adalen', shownOnCard)
assert.ok(hint && hint.includes('Ådalen'), `ledtråd saknas: ${hint}`)
assert.ok(hint.length < val1932.long.length, 'ledtråden ska vara en mening, inte hela texten')
assert.equal(matchHint(val1932, 'socialdemokraterna', shownOnCard), null)
assert.equal(matchHint(val1932, '1932', shownOnCard), null)
assert.equal(matchHint(val1932, '', shownOnCard), null)
// Träff bara i taggarna ger taggen.
const ad = events.find((e) => e.id === '1929-arbetsdomstolen')
assert.equal(matchHint(ad, 'rattsvasende', `${ad.year} ${ad.title} ${ad.short}`), 'Ämne: rättsväsende')

// Sökningen måste smala av, inte bara hitta. Utan de här raderna gick det att
// låta varje sökning visa allt utan att något test föll (mutationstest 2026-11-04).
const strejk1909 = filterEvents(events, { query: 'strejk 1909' })
assert.ok(strejk.size < events.length, '"strejk" ska inte ge allt')
assert.ok(strejk1909.length > 0 && strejk1909.length < strejk.size, '"strejk 1909" ska ge färre än "strejk"')
assert.equal(filterEvents(events, { query: 'qqqzz' }).length, 0)
assert.deepEqual(ids(filterEvents(events, { query: 'rattsvasende' })), ['1929-arbetsdomstolen'], 'träff bara i taggarna')

// Konstruerade händelser för det som datat inte tvingar fram.
const fake = (extra) => ({ id: 'x', year: 1900, title: 'Ab', short: 'Cd', long: '', country: 'sverige', ...extra })
assert.equal(filterEvents([fake()], { query: 'bc' }).length, 0, 'fälten får inte flyta ihop till ett ord')
assert.equal(filterEvents([fake()], { query: 'ab cd' }).length, 1)
assert.equal(filterEvents([fake({ tags: undefined })], { query: 'ab' }).length, 1, 'händelse utan taggar')

// Ledtråden är hela meningen med sitt skiljetecken, trimmad, och den första
// mening som innehåller något av de saknade orden.
const lang = fake({ long: 'Först kom lockouten. Sedan strejken?! Till sist avtalet.', tags: ['lön', 'avtal'] })
assert.equal(matchHint(lang, 'strejken', 'Ab Cd'), 'Sedan strejken?!')
assert.equal(matchHint(lang, 'avtalet lockouten', 'Ab Cd'), 'Först kom lockouten.')
assert.equal(matchHint(lang, 'lon', 'Ab Cd'), 'Ämne: lön')
assert.equal(matchHint(lang, 'ab lon', 'Ab Cd'), 'Ämne: lön', 'ordet som syns på kortet räknas inte')
assert.equal(matchHint(fake({ long: 'Skotten i Ådalen' }), 'adalen', 'Ab Cd'), 'Skotten i Ådalen', 'långtext utan skiljetecken')
assert.equal(matchHint(fake({ long: 'Inget här.' }), 'saknas', 'Ab Cd'), null)
assert.equal(matchHint(fake({ tags: ['lön', 'avtal'] }), 'lon avtal', 'Ab Cd'), 'Ämne: lön', 'en tagg räcker för ett av orden')

console.log(`alla kontroller OK (${events.length} händelser)`)
