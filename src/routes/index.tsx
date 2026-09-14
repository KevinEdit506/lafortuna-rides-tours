import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownUp,
  CalendarDays,
  CarFront,
  ChevronDown,
  Clock3,
  Compass,
  Home,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  Route as RouteIcon,
  ShieldCheck,
  Star,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";

import misticoImage from "../assets/mistico-bridges.jpg";
import riverImage from "../assets/penas-blancas.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Via La Fortuna | Traslados y tours" },
      { name: "description", content: "Reserve traslados privados, viajes programados y tours bilingües en La Fortuna." },
      { property: "og:title", content: "Via La Fortuna | Traslados y tours" },
      { property: "og:description", content: "Movilidad confiable y experiencias locales bilingües en La Fortuna." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const copy = {
  es: {
    place: "La Fortuna",
    eyebrow: "Movilidad local",
    title: "Su viaje, bien cuidado.",
    subtitle: "Traslados puntuales y experiencias seleccionadas en el corazón del Arenal.",
    transfers: "Traslados",
    tours: "Tours",
    origin: "Origen",
    destination: "Destino",
    private: "Privado",
    shared: "Compartido",
    now: "Ahora",
    schedule: "Programar",
    passengers: "Pasajeros",
    calculate: "Calcular tarifa",
    estimate: "Tarifa estimada",
    details: "Ver desglose",
    trip: "Servicio de traslado",
    operations: "Costos operativos",
    platform: "Gestión y cobertura",
    total: "Total estimado",
    note: "Precio claro antes de reservar",
    curation: "Selección local",
    escapes: "Experiencias en La Fortuna",
    explore: "Ver todas",
    reserveTour: "Reservar tour",
    hours: "horas",
    home: "Inicio",
    routes: "Viajes",
    chat: "Ayuda",
    profile: "Perfil",
  },
  en: {
    place: "La Fortuna",
    eyebrow: "Local mobility",
    title: "Your journey, well cared for.",
    subtitle: "Punctual transfers and curated experiences in the heart of Arenal.",
    transfers: "Transfers",
    tours: "Tours",
    origin: "Pickup",
    destination: "Destination",
    private: "Private",
    shared: "Shared",
    now: "Now",
    schedule: "Schedule",
    passengers: "Passengers",
    calculate: "Calculate fare",
    estimate: "Estimated fare",
    details: "View breakdown",
    trip: "Transfer service",
    operations: "Operating costs",
    platform: "Management and coverage",
    total: "Estimated total",
    note: "Clear pricing before booking",
    curation: "Local selection",
    escapes: "Experiences in La Fortuna",
    explore: "View all",
    reserveTour: "Book tour",
    hours: "hours",
    home: "Home",
    routes: "Trips",
    chat: "Help",
    profile: "Profile",
  },
} as const;

function Index() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [mode, setMode] = useState<"transfers" | "tours">("transfers");
  const [timing, setTiming] = useState<"now" | "schedule">("now");
  const [rideType, setRideType] = useState<"private" | "shared">("private");
  const [passengers, setPassengers] = useState(2);
  const [showFare, setShowFare] = useState(true);
  const t = copy[language];
  const fare = useMemo(() => {
    const sharedFactor = rideType === "shared" ? 0.68 : 1;
    const passengerExtra = Math.max(0, passengers - 2) * 4;
    const service = Math.round((34 + passengerExtra) * sharedFactor);
    const operations = Math.round(11 * sharedFactor);
    return { service, operations, platform: 5, total: service + operations + 5 };
  }, [passengers, rideType]);

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_0%_0%,color-mix(in_oklab,var(--leaf)_10%,transparent)_0%,transparent_48%)]" />
      <div className="relative mx-auto min-h-screen w-full max-w-[430px] px-6 pb-32 pt-6 lg:max-w-6xl lg:px-10">
        <header className="rise flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-jungle text-primary-foreground shadow-lg shadow-primary/20">
              <span className="font-display text-xl">V</span>
            </div>
            <div className="leading-tight">
              <p className="font-display text-lg">Via</p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">{t.place}</p>
            </div>
          </div>
          <div className="flex rounded-full bg-mist/25 p-1 ring-1 ring-border" aria-label="Language">
            {(["es", "en"] as const).map((lang) => (
              <button key={lang} onClick={() => setLanguage(lang)} className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase transition-colors ${language === lang ? "bg-jungle text-primary-foreground" : "text-muted-foreground"}`}>{lang}</button>
            ))}
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(390px,0.72fr)] lg:gap-16">
          <div>
            <section className="rise mt-8 [animation-delay:80ms]">
              <div className="flex items-center gap-2 text-leaf"><span className="h-px w-4 bg-leaf/50" /><p className="text-[11px] font-semibold uppercase tracking-[0.22em]">{t.eyebrow}</p></div>
              <h1 className="mt-2 max-w-xl font-display text-[32px] leading-[1.12] lg:text-5xl">{t.title}</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground lg:text-base">{t.subtitle}</p>
            </section>

            <div className="rise mt-7 grid grid-cols-2 gap-2 rounded-3xl bg-mist/20 p-1.5 ring-1 ring-border [animation-delay:140ms]">
              <button onClick={() => setMode("transfers")} className={`rounded-[18px] py-3.5 text-sm font-bold transition-all ${mode === "transfers" ? "bg-jungle text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground"}`}>{t.transfers}</button>
              <button onClick={() => setMode("tours")} className={`rounded-[18px] py-3.5 text-sm font-bold transition-all ${mode === "tours" ? "bg-jungle text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground"}`}>{t.tours}</button>
            </div>

            {mode === "transfers" ? (
              <section className="rise mt-4 rounded-[30px] bg-surface p-4 shadow-xl shadow-primary/10 ring-1 ring-border [animation-delay:200ms]">
                <div className="rounded-2xl bg-background/70 p-4 ring-1 ring-border">
                  <div className="flex items-center gap-4">
                    <MapPin className="size-4 shrink-0 text-leaf" />
                    <label className="flex-1"><span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{t.origin}</span><input aria-label={t.origin} defaultValue="Centro de La Fortuna" className="mt-0.5 w-full bg-transparent text-[15px] font-semibold outline-none" /></label>
                    <ArrowDownUp className="size-4 text-muted-foreground" />
                  </div>
                  <div className="my-3 ml-2 h-5 w-px bg-border" />
                  <div className="flex items-center gap-4">
                    <MapPin className="size-4 shrink-0 text-primary" />
                    <label className="flex-1"><span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{t.destination}</span><input aria-label={t.destination} defaultValue="Parque Nacional Volcán Arenal" className="mt-0.5 w-full bg-transparent text-[15px] font-semibold outline-none" /></label>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-full bg-background p-1 ring-1 ring-border">
                  {(["private", "shared"] as const).map((value) => <button key={value} onClick={() => setRideType(value)} className={`rounded-full py-2.5 text-[13px] font-bold ${rideType === value ? "bg-leaf text-accent-foreground shadow-sm" : "text-muted-foreground"}`}>{t[value]}</button>)}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-background px-3 py-2.5 ring-1 ring-border">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground"><Clock3 className="size-3.5" />{timing === "now" ? t.now : t.schedule}</div>
                    <button onClick={() => setTiming(timing === "now" ? "schedule" : "now")} className="mt-1 flex w-full items-center justify-between text-sm font-semibold">{timing === "now" ? t.now : "18 Sep · 09:30"}<CalendarDays className="size-4 text-leaf" /></button>
                  </div>
                  <div className="rounded-2xl bg-background px-3 py-2.5 ring-1 ring-border">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground"><UsersRound className="size-3.5" />{t.passengers}</div>
                    <div className="mt-1 flex items-center justify-between"><button aria-label="Restar pasajero" onClick={() => setPassengers(Math.max(1, passengers - 1))}><Minus className="size-4" /></button><span className="text-sm font-bold">{passengers}</span><button aria-label="Agregar pasajero" onClick={() => setPassengers(Math.min(8, passengers + 1))}><Plus className="size-4 text-leaf" /></button></div>
                  </div>
                </div>
                <button onClick={() => setShowFare(true)} className="mt-4 w-full rounded-2xl bg-jungle py-4 text-[15px] font-bold text-primary-foreground shadow-xl shadow-primary/25 transition-transform active:scale-[0.98]">{t.calculate}</button>
              </section>
            ) : (
              <section className="rise mt-4 rounded-[30px] bg-surface p-5 shadow-xl shadow-primary/10 ring-1 ring-border">
                <Compass className="size-7 text-leaf" />
                <h2 className="mt-3 font-display text-2xl">{t.escapes}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{language === "es" ? "Elija una experiencia con transporte y acompañamiento bilingüe incluidos." : "Choose an experience with transport and bilingual assistance included."}</p>
                <button className="mt-5 w-full rounded-2xl bg-jungle py-4 text-sm font-bold text-primary-foreground">{t.explore}</button>
              </section>
            )}
          </div>

          <div>
            {mode === "transfers" && showFare && (
              <section className="rise mt-4 overflow-hidden rounded-[28px] bg-jungle p-5 text-primary-foreground shadow-2xl shadow-primary/25 lg:mt-8 [animation-delay:260ms]">
                <div className="flex items-center justify-between"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mist/70">{t.estimate}</p><ShieldCheck className="size-5 text-leaf" /></div>
                <div className="mt-2 flex items-baseline gap-2"><p className="font-display text-[38px] leading-none">${fare.total}</p><p className="text-xs text-mist/60">USD</p></div>
                <button onClick={() => setShowFare(!showFare)} className="mt-4 flex w-full items-center justify-between border-t border-mist/15 pt-4 text-xs font-semibold text-mist/80"><span>{t.details}</span><ChevronDown className="size-4 rotate-180" /></button>
                <div className="mt-3 space-y-2 rounded-2xl bg-primary-foreground/5 p-3 text-[13px] ring-1 ring-primary-foreground/10">
                  <div className="flex justify-between"><span className="text-mist/75">{t.trip}</span><strong>${fare.service}</strong></div>
                  <div className="flex justify-between"><span className="text-mist/75">{t.operations}</span><strong>${fare.operations}</strong></div>
                  <div className="flex justify-between"><span className="text-mist/75">{t.platform}</span><strong>${fare.platform}</strong></div>
                  <div className="flex justify-between border-t border-mist/15 pt-2"><span>{t.total}</span><strong className="font-display text-lg">${fare.total}</strong></div>
                </div>
                <p className="mt-3 flex items-center gap-2 text-xs italic text-mist/65"><ShieldCheck className="size-4" />{t.note}</p>
              </section>
            )}

            <section className="mt-10">
              <div className="mb-4 flex items-end justify-between"><div><div className="flex items-center gap-2 text-leaf"><span className="size-1.5 rounded-full bg-leaf" /><p className="text-[11px] font-bold uppercase tracking-[0.2em]">{t.curation}</p></div><h2 className="mt-1 font-display text-[22px]">{t.escapes}</h2></div><button className="text-xs font-bold text-leaf">{t.explore}</button></div>
              <div className="hide-scrollbar -mx-6 flex gap-4 overflow-x-auto px-6 pb-6 lg:mx-0 lg:grid lg:grid-cols-2 lg:px-0">
                {[
                  { image: misticoImage, title: "Puentes Colgantes Místico", meta: `3.5 ${t.hours}`, price: "$85", rating: "4.9" },
                  { image: riverImage, title: "Safari Río Peñas Blancas", meta: `4 ${t.hours}`, price: "$60", rating: "4.8" },
                ].map((tour) => (
                  <article key={tour.title} className="w-[260px] shrink-0 rounded-[26px] bg-surface p-3 shadow-xl shadow-primary/10 ring-1 ring-border lg:w-auto">
                    <img src={tour.image} alt={tour.title} width={1024} height={768} loading="lazy" className="aspect-[4/3] w-full rounded-[19px] object-cover" />
                    <div className="px-2 pb-2 pt-4"><h3 className="font-display text-[17px] leading-snug">{tour.title}</h3><div className="mt-2 flex items-center justify-between text-xs text-muted-foreground"><span>{tour.meta} · {tour.price}</span><span className="flex items-center gap-1 font-bold text-leaf"><Star className="size-3 fill-current" />{tour.rating}</span></div><button className="mt-3 w-full rounded-xl bg-mist/30 py-2.5 text-xs font-bold text-primary">{t.reserveTour}</button></div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <nav className="pointer-events-none fixed bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 px-6 pb-5 lg:max-w-xl">
        <div className="pointer-events-auto flex items-center justify-between rounded-[26px] bg-jungle/95 px-7 py-3 text-primary-foreground shadow-2xl ring-1 ring-primary-foreground/10 backdrop-blur-md">
          {[
            { label: t.home, icon: Home, active: true },
            { label: t.routes, icon: RouteIcon, active: false },
            { label: t.chat, icon: MessageCircle, active: false },
            { label: t.profile, icon: UserRound, active: false },
          ].map(({ label, icon: Icon, active }) => <button key={label} className={`flex min-w-12 flex-col items-center gap-1 text-[10px] font-bold ${active ? "text-primary-foreground" : "text-mist/45"}`}><span className={`grid size-8 place-items-center rounded-xl ${active ? "bg-leaf" : "bg-primary-foreground/5"}`}><Icon className="size-4" /></span>{label}</button>)}
        </div>
      </nav>
    </main>
  );
}