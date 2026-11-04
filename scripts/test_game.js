// Snabbkoll på spelets regler.  Kör:  node scripts/test_game.js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { ROUNDS, playable, shuffle, fits, newGame, place, rightIndex } from '../src/game.js'

const events = JSON.parse(
  readFileSync(fileURLToPath(new URL('../src/data/events.json', import.meta.url)), 'utf-8'),
)
const card = (year) => ({ id: `k${year}`, year, title: 'x' })

// Inget spelbart kort avslöjar sitt år i titeln, och det finns nog för en omgång.
assert.ok(playable(events).every((e) => !e.title.includes(String(e.year))))
assert.ok(playable(events).length > ROUNDS)
assert.ok(playable(events).length < events.length, 'minst en titel med årtal ska ha sållats bort')

// Blandningen tappar och dubblerar ingenting.
assert.deepEqual([...shuffle(events)].map((e) => e.id).sort(), events.map((e) => e.id).sort())

// Platsregeln: före, mellan, efter, och samma år räknas som rätt åt båda håll.
const line = [card(1900), card(1950)]
assert.equal(fits(line, card(1890), 0), true)
assert.equal(fits(line, card(1920), 0), false)
assert.equal(fits(line, card(1920), 1), true)
assert.equal(fits(line, card(1960), 1), false)
assert.equal(fits(line, card(1960), 2), true)
assert.equal(fits(line, card(1920), 2), false)
assert.equal(fits(line, card(1950), 1), true)
assert.equal(fits(line, card(1950), 2), true)

// En hel omgång där varje kort läggs på första platsen som passar: allt rätt,
// tidslinjen sorterad, leken tom. Sedan en omgång med avsiktligt fel plats.
let game = newGame(events)
assert.equal(game.timeline.length, 1)
assert.equal(game.deck.length, ROUNDS)
while (game.deck.length > 0) {
  const next = game.deck[0]
  const index = game.timeline.findIndex((e) => e.year >= next.year)
  game = place(game, index === -1 ? game.timeline.length : index)
  assert.equal(game.last.ok, true)
}
assert.equal(game.score, ROUNDS)
assert.equal(game.timeline.length, ROUNDS + 1)
assert.ok(game.timeline.every((e, i, all) => i === 0 || all[i - 1].year <= e.year))

const wrong = place({ timeline: [card(1900)], deck: [card(1950)], score: 0, last: null }, 0)
assert.equal(wrong.last.ok, false)
assert.equal(wrong.score, 0)
assert.equal(wrong.timeline.length, 1, 'fel lagt kort ska inte hamna i tidslinjen')
assert.equal(wrong.deck.length, 0)
assert.equal(wrong.last.right, 1, 'facit ska peka på platsen efter 1900')
assert.deepEqual(wrong.results, [false])

// Facit hamnar alltid på en plats där kortet passar, även vid samma år.
for (const y of [1850, 1900, 1925, 1950, 2000]) assert.ok(fits(line, card(y), rightIndex(line, card(y))))

// Blandningen blandar, och följer `random` exakt (mutationstest 2026-11-04).
assert.deepEqual(shuffle([1, 2, 3, 4], () => 0.5), [1, 4, 2, 3])
assert.deepEqual(shuffle([1, 2, 3, 4], () => 0), [2, 3, 4, 1])
assert.deepEqual(shuffle([], () => 0), [])
const input = [1, 2, 3]
shuffle(input, () => 0)
assert.deepEqual(input, [1, 2, 3], 'listan som skickas in rörs inte')
const fresh = newGame(events, () => 0.5)
assert.deepEqual(fresh.results, [])
assert.deepEqual([fresh.score, fresh.last], [0, null])
assert.deepEqual([fresh.timeline[0], ...fresh.deck], shuffle(playable(events), () => 0.5).slice(0, ROUNDS + 1))

// Facit vid samma år pekar efter korten med samma år, inte före.
assert.equal(rightIndex(line, card(1900)), 1)
assert.equal(rightIndex(line, card(1950)), 2)
assert.equal(rightIndex(line, card(1800)), 0)

console.log('spelet: alla kontroller OK')
