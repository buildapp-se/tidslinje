// Spelets regler: lägg ett kort på rätt plats i en växande tidslinje.
//
// Ren JavaScript utan JSX och utan Vite-beroenden, av samma skäl som
// `search.js`: `node scripts/test_game.js` ska kunna köra reglerna direkt.

export const ROUNDS = 10

// Ett kort vars titel innehåller sitt eget årtal ("Storlockout 1980") avslöjar
// svaret och kan därför inte spelas.
export function playable(events) {
  return events.filter((e) => !e.title.includes(String(e.year)))
}

// Fisher-Yates. `random` skickas in så att testet kan styra blandningen.
export function shuffle(list, random = Math.random) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Plats `index` betyder "före timeline[index]", och timeline.length betyder
// sist. Samma år på båda sidor räknas som rätt: 1919 har tre händelser, och
// ingen ska behöva gissa ordningen inom ett år.
export function fits(timeline, card, index) {
  const before = timeline[index - 1]
  const after = timeline[index]
  return (!before || before.year <= card.year) && (!after || card.year <= after.year)
}

// Ett kort ligger öppet från början, resten dras ett i taget.
export function newGame(events, random = Math.random) {
  const [first, ...deck] = shuffle(playable(events), random).slice(0, ROUNDS + 1)
  return { timeline: [first], deck, score: 0, last: null }
}

// Som i Hitster: rätt lagt kort stannar i tidslinjen, fel lagt kort läggs åt
// sidan. `last` bär facit till återkopplingen.
export function place(game, index) {
  const [card, ...deck] = game.deck
  const ok = fits(game.timeline, card, index)
  const timeline = ok
    ? [...game.timeline.slice(0, index), card, ...game.timeline.slice(index)]
    : game.timeline
  return { timeline, deck, score: game.score + (ok ? 1 : 0), last: { card, ok } }
}
