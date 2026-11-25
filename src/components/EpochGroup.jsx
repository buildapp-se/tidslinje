import EventCard from './EventCard'

export default function EpochGroup({ epoch, events, query, onOpen }) {
  if (events.length === 0) return null

  return (
    <section className="mb-20">
      {/* Epokrubrik */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-accent">{epoch.title}</h2>
        <p className="text-gray-600 text-sm mt-1 tracking-widest uppercase">
          {epoch.years}
        </p>
        <div className="mx-auto mt-3 w-12 h-0.5 bg-accent opacity-40" />
      </div>

      {/* Tidslinje-container med vertikal linje */}
      <div className="relative">
        {/*
          Linje: till vänster på mobil, centrerad på desktop.
          left-3 = halva bredden på dot-kolumnen (1.5rem) på mobil.
          md:left-1/2     = exakt mitten av containern på desktop.
        */}
        <div className="absolute left-3 md:left-1/2 top-0 bottom-0 w-px bg-ink/25 -translate-x-1/2" />

        {events.map((event, i) => {
          const goLeft = i % 2 === 0

          return (
            <div
              key={event.id}
              /*
                Grid på mobil:  [1.5rem dot-kolumn | 1fr kort-kolumn]
                Grid på desktop:[1fr vänster | 2rem dot-kolumn | 1fr höger]
                Kortet finns en gång och flyttas mellan kolumnerna med CSS.
                Förut låg det två gånger (en mobil- och en desktopkopia), och
                vreds telefonen med modalen öppen gick fokus tillbaka till den
                kopia som just gömts, alltså till body.
              */
              className="grid grid-cols-[1.5rem_minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)] mb-8 items-start"
            >
              {/* Dot, alltid synlig, centrerad i sin kolumn */}
              <div className="col-start-1 md:col-start-2 row-start-1 flex flex-col items-center pt-4">
                <div className="w-3 h-3 rounded-full bg-accent border-2 border-white shadow-sm relative z-10" />
              </div>

              {/* Mobil: alltid höger. Desktop: varannan till vänster */}
              <div className={`col-start-2 row-start-1 pl-3 ${goLeft ? 'md:col-start-1 md:flex md:justify-end md:pl-0 md:pr-4' : 'md:col-start-3 md:pl-4'}`}>
                <EventCard event={event} query={query} onOpen={onOpen} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
