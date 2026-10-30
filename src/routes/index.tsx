import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  CarFront,
  CheckCircle2,
  Circle,
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
  X,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import misticoImage from "../assets/mistico-bridges.jpg";
import riverImage from "../assets/penas-blancas.jpg";

type TourCard = {
  image: string;
  title: string;
  meta: string;
  rating: string;
  category: string;
  summary: string;
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Via La Fortuna | Transfers & Tours in Arenal" },
      {
        name: "description",
        content:
          "Reserve traslados privados y tours bilingües en La Fortuna, Costa Rica. Tarifas claras, atención local y experiencias memorables cerca del Arenal.",
      },
      { property: "og:title", content: "Via La Fortuna | Transfers & Tours in Arenal" },
      {
        property: "og:description",
        content:
          "Traslados privados y tours bilingües en La Fortuna, Costa Rica. Tarifas claras, atención local y experiencias memorables cerca del Arenal.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://kevinedit506.github.io/lafortuna-rides-tours/" },
      { property: "og:site_name", content: "Via La Fortuna" },
      { property: "og:locale", content: "es_CR" },
      {
        property: "og:image",
        content:
          "https://kevinedit506.github.io/lafortuna-rides-tours/social-preview.jpg?v=20260914-2",
      },
      { property: "og:image:width", content: "2560" },
      { property: "og:image:height", content: "1440" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Via La Fortuna | Transfers & Tours in Arenal" },
      {
        name: "twitter:description",
        content:
          "Traslados privados y tours bilingües en La Fortuna, Costa Rica. Tarifas claras y atención local.",
      },
      {
        name: "twitter:image",
        content:
          "https://kevinedit506.github.io/lafortuna-rides-tours/social-preview.jpg?v=20260914-2",
      },
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
    routePreview: "Ruta del viaje",
    agenda: "Agenda de viajes",
    scheduledTrip: "Viaje programado",
    pickupShort: "Origen",
    destinationShort: "Destino",
    perPassenger: "Por pasajero",
    privateFixed: "Tarifa privada fija por viaje",
    distance: "Distancia",
    duration: "Tiempo estimado",
    mapsLoading: "Conectando con Google Maps…",
    mapsFallback: "Distancia y tiempo aproximados. Confirma el recorrido en Google Maps.",
    mapsExact: "Distancia por carretera · Google Maps",
    baseFare: "Tarifa base",
    timeFare: "Tiempo",
    distanceFare: "Distancia",
    dynamicFare: "Multiplicador dinámico",
    returnEmpty: "Regreso vacío",
    badRoad: "Camino malo",
    noReturn: "Solo ida",
    returnIncluded: "Ida y vuelta",
    roadNormal: "Recargo 50%",
    roadRough: "Recargo 20%",
    tolls: "Peajes y cuotas",
    paymentLocked: "Pago bloqueado después de confirmar",
    scheduledSuccess: "Viaje añadido a tu agenda",
    confirmedTitle: "Solicitud lista para WhatsApp",
    confirmedBody: "El mensaje fue preparado con tu ruta, horario y forma de pago.",
    remove: "Eliminar",
    estimate: "Tarifa estimada",
    trip: "Servicio de traslado",
    operations: "Costos operativos",
    platform: "Gestión y cobertura",
    total: "Total estimado",
    note: "Precio claro antes de reservar",
    curation: "Selección local",
    escapes: "Experiencias en La Fortuna",
    explore: "Ver todas",
    reserveTour: "Reservar tour",
    payment: "Pago",
    card: "Tarjeta",
    cash: "Efectivo",
    sharedDestinations: "Destinos de pasajeros",
    passengerDestination: "Destino pasajero",
    exchangeLoading: "Consultando tipo de cambio BCCR…",
    exchangeSource: "Tipo de cambio de referencia BCCR",
    hours: "horas",
    reviewsEyebrow: "Experiencias compartidas",
    reviewsTitle: "Reseñas recientes",
    reviewsIntro: "Historias de viajeros que descubrieron La Fortuna con atención local.",
    reviewDisclosure:
      "Contenido de muestra para el diseño · reemplazar por reseñas autorizadas antes de publicar.",
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
    routePreview: "Trip route",
    agenda: "Trip schedule",
    scheduledTrip: "Scheduled trip",
    pickupShort: "Pickup",
    destinationShort: "Destination",
    perPassenger: "Per passenger",
    privateFixed: "Fixed private trip fare",
    distance: "Distance",
    duration: "Estimated time",
    mapsLoading: "Connecting to Google Maps…",
    mapsFallback: "Approximate distance and time. Confirm your route in Google Maps.",
    mapsExact: "Road distance · Google Maps",
    baseFare: "Base fare",
    timeFare: "Time",
    distanceFare: "Distance",
    dynamicFare: "Dynamic multiplier",
    returnEmpty: "Empty return",
    badRoad: "Rough road",
    noReturn: "One way",
    returnIncluded: "Round trip",
    roadNormal: "50% surcharge",
    roadRough: "20% surcharge",
    tolls: "Tolls and fees",
    paymentLocked: "Payment locked after confirmation",
    scheduledSuccess: "Trip added to your schedule",
    confirmedTitle: "Request ready for WhatsApp",
    confirmedBody: "Your message was prepared with the route, timing, and payment method.",
    remove: "Remove",
    estimate: "Estimated fare",
    trip: "Transfer service",
    operations: "Operating costs",
    platform: "Management and coverage",
    total: "Estimated total",
    note: "Clear pricing before booking",
    curation: "Local selection",
    escapes: "Experiences in La Fortuna",
    explore: "View all",
    reserveTour: "Book tour",
    payment: "Payment",
    card: "Card",
    cash: "Cash",
    sharedDestinations: "Passenger destinations",
    passengerDestination: "Passenger destination",
    exchangeLoading: "Checking BCCR exchange rate…",
    exchangeSource: "BCCR reference exchange rate",
    hours: "hours",
    reviewsEyebrow: "Shared experiences",
    reviewsTitle: "Recent reviews",
    reviewsIntro: "Stories from travelers who discovered La Fortuna with local care.",
    reviewDisclosure:
      "Sample content for layout · replace with authorized reviews before publishing.",
    home: "Home",
    routes: "Trips",
    chat: "Help",
    profile: "Profile",
  },
} as const;

function Index() {
  const localPlaceSuggestions = [
    "Centro de La Fortuna",
    "Parque Nacional Volcán Arenal",
    "Aeropuerto Internacional Juan Santamaría",
    "Terminal de buses de La Fortuna",
    "Puentes Colgantes Místico",
    "Río Peñas Blancas",
  ];
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [selectedTour, setSelectedTour] = useState<TourCard | null>(null);
  const t = copy[language];

  useEffect(() => {
    if (!selectedTour) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedTour(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedTour]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openWhatsApp = (tourName?: string) => {
    if (!tourName) return;
    const message =
      language === "es"
        ? `Hola Via La Fortuna, me gustaría reservar el tour ${tourName}. ¿Podrían ayudarme con disponibilidad y próximos pasos?`
        : `Hello Via La Fortuna, I would like to book the ${tourName} tour. Could you help me with availability and next steps?`;
    window.open(
      `https://wa.me/50663135655?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <main
      className="app-shell min-h-screen text-foreground selection:bg-accent selection:text-accent-foreground"
      style={
        {
          "--arenal-background": `url("${import.meta.env.BASE_URL}arenal-background-current.jpg")`,
        } as CSSProperties
      }
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_0%_0%,color-mix(in_oklab,var(--leaf)_10%,transparent)_0%,transparent_48%)]" />
      <div className="relative mx-auto min-h-screen w-full max-w-[430px] px-6 pb-32 pt-6 lg:max-w-6xl lg:px-10">
        <header className="rise flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-jungle px-3 py-2 text-primary-foreground shadow-[0_4px_0_rgba(9,35,26,0.45),0_8px_16px_rgba(9,35,26,0.2)] ring-1 ring-white/25">
              <span className="grid size-7 place-items-center rounded-full bg-leaf/30 font-display text-sm ring-1 ring-white/20">
                V
              </span>
              <span className="font-display text-base">Vía</span>
            </div>
            <div className="leading-tight">
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white">
                {t.place}
              </p>
            </div>
          </div>
          <div
            className="flex rounded-full bg-jungle/85 p-1 ring-1 ring-white/20"
            aria-label="Language"
          >
            {(["es", "en"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase transition-colors ${language === lang ? "bg-leaf text-leaf-foreground" : "text-white/75"}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </header>

        <div>
          <section className="dark-green-panel rise mt-8 rounded-[28px] px-5 py-5 text-white ring-1 ring-white/15 [animation-delay:80ms]">
            <div className="flex items-center gap-2 text-white">
              <span className="h-px w-4 bg-white/55" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">{t.eyebrow}</p>
            </div>
            <h1 className="mt-2 max-w-xl font-display text-[32px] leading-[1.12] text-white lg:text-5xl">
              {t.title}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 lg:text-base">
              {t.subtitle}
            </p>
          </section>

          <div>
            <section
              id="tours"
              className="dark-green-panel mt-10 scroll-mt-6 rounded-[30px] p-4 text-white ring-1 ring-white/15"
            >
              <div className="mb-4">
                <div>
                  <div className="flex items-center gap-2 text-leaf">
                    <span className="size-1.5 rounded-full bg-leaf" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em]">{t.curation}</p>
                  </div>
                  <h2 className="mt-1 font-display text-[22px] text-white">{t.escapes}</h2>
                </div>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-white/80">
                {language === "es"
                  ? "Descubre experiencias locales y escapadas por Costa Rica: playas, parques nacionales, ríos y bosque tropical."
                  : "Discover local experiences and Costa Rica escapes: beaches, national parks, rivers, and tropical forest."}
              </p>
              <div className="flex flex-col gap-4 pb-6">
                {[
                  {
                    image: `${import.meta.env.BASE_URL}category-arenal.jpg`,
                    title:
                      language === "es"
                        ? "Volcán Arenal y aguas termales"
                        : "Arenal Volcano & hot springs",
                    meta: `5 ${t.hours}`,
                    rating: "4.9",
                    category: language === "es" ? "Arenal · Naturaleza" : "Arenal · Nature",
                    summary:
                      language === "es"
                        ? "Paisajes volcánicos, senderos y una pausa relajante en aguas termales de la zona."
                        : "Volcanic views, rainforest trails, and a relaxing pause in the area's hot springs.",
                  },
                  {
                    image: misticoImage,
                    title:
                      language === "es" ? "Puentes Colgantes Místico" : "Mystic Hanging Bridges",
                    meta: `3.5 ${t.hours}`,
                    rating: "4.9",
                    category: language === "es" ? "Arenal · Naturaleza" : "Arenal · Nature",
                    summary:
                      language === "es"
                        ? "Senderos y puentes suspendidos entre bosque nuboso, con vistas del paisaje volcánico."
                        : "Trails and suspended bridges through cloud forest, with views of the volcanic landscape.",
                  },
                  {
                    image: `${import.meta.env.BASE_URL}category-playas.jpg`,
                    title:
                      language === "es"
                        ? "Escapada a playas del Pacífico"
                        : "Pacific coast beach escape",
                    meta: `10 ${t.hours}`,
                    rating: "4.8",
                    category: language === "es" ? "Playas · Día completo" : "Beaches · Full day",
                    summary:
                      language === "es"
                        ? "Un día de costa, arena y mar con traslado cómodo desde La Fortuna."
                        : "A full day of coast, sand, and sea with a comfortable transfer from La Fortuna.",
                  },
                  {
                    image: `${import.meta.env.BASE_URL}category-parques.jpg`,
                    title:
                      language === "es"
                        ? "Parques nacionales de Costa Rica"
                        : "Costa Rica national parks",
                    meta: `8 ${t.hours}`,
                    rating: "4.9",
                    category: language === "es" ? "Parques · Aventura" : "Parks · Adventure",
                    summary:
                      language === "es"
                        ? "Explora senderos protegidos, miradores y biodiversidad con acompañamiento local."
                        : "Explore protected trails, viewpoints, and biodiversity with local assistance.",
                  },
                  {
                    image: riverImage,
                    title:
                      language === "es" ? "Safari Río Peñas Blancas" : "Peñas Blancas River Safari",
                    meta: `4 ${t.hours}`,
                    rating: "4.8",
                    category: language === "es" ? "La Fortuna · Río" : "La Fortuna · River",
                    summary:
                      language === "es"
                        ? "Recorrido tranquilo por el río para observar aves y vida silvestre con guía local."
                        : "A peaceful river ride to observe birds and wildlife with a local guide.",
                  },
                  {
                    image: `${import.meta.env.BASE_URL}category-rios.jpg`,
                    title:
                      language === "es"
                        ? "Ríos y aventura tropical"
                        : "Rivers & tropical adventure",
                    meta: `6 ${t.hours}`,
                    rating: "4.7",
                    category: language === "es" ? "Ríos · Aire libre" : "Rivers · Outdoors",
                    summary:
                      language === "es"
                        ? "Naturaleza, agua dulce y actividades al aire libre para descubrir la región."
                        : "Fresh water, nature, and outdoor activities to discover the region.",
                  },
                ].map((tour) => (
                  <article
                    key={tour.title}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedTour(tour)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedTour(tour);
                      }
                    }}
                    className="experience-card flex h-[500px] w-full cursor-pointer flex-col rounded-[26px] bg-gradient-to-br from-surface via-surface to-leaf/10 p-3 text-foreground shadow-xl shadow-primary/10 ring-1 ring-border outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-leaf lg:h-[510px]"
                  >
                    <img
                      src={tour.image}
                      alt={tour.title}
                      width={1024}
                      height={768}
                      loading="lazy"
                      className="h-44 w-full rounded-[19px] object-cover"
                    />
                    <div className="flex min-h-0 flex-1 flex-col px-2 pb-2 pt-4">
                      <h3 className="font-display text-[17px] leading-snug text-foreground">
                        {tour.title}
                      </h3>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-leaf-ink">
                        {tour.category}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {tour.summary}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{tour.meta}</span>
                        <span className="flex items-center gap-1 rounded-md bg-surface px-1.5 py-0.5 font-bold text-foreground">
                          <Star className="size-3 fill-current" />
                          {tour.rating}
                        </span>
                      </div>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedTour(tour);
                        }}
                        className="mt-auto w-full rounded-xl bg-leaf py-2.5 text-xs font-bold text-leaf-foreground shadow-[0_3px_0_color-mix(in_oklch,var(--color-jungle)_35%,transparent)]"
                      >
                        {language === "es" ? "Ver tours disponibles" : "View available tours"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="reviews"
              className="dark-green-panel rise mt-5 rounded-[30px] p-4 text-white ring-1 ring-white/15 [animation-delay:320ms]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-leaf">
                    <span className="size-1.5 rounded-full bg-leaf" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em]">
                      {t.reviewsEyebrow}
                    </p>
                  </div>
                  <h2 className="mt-1 font-display text-[22px] text-white">{t.reviewsTitle}</h2>
                </div>
                <Star className="mt-1 size-5 shrink-0 fill-leaf text-leaf" aria-hidden="true" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{t.reviewsIntro}</p>

              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {[
                  {
                    quote:
                      language === "es"
                        ? "El traslado fue puntual y muy tranquilo. La comunicación antes del viaje nos dio mucha confianza."
                        : "The transfer was punctual and relaxed. The communication before the ride gave us real peace of mind.",
                    name: language === "es" ? "Cliente de La Fortuna" : "La Fortuna traveler",
                    detail: language === "es" ? "Traslado local" : "Local transfer",
                  },
                  {
                    quote:
                      language === "es"
                        ? "Nos ayudaron a organizar una visita al Arenal sin complicaciones y con información clara."
                        : "They helped us plan an Arenal visit without complications and with clear information.",
                    name: language === "es" ? "Visitante internacional" : "International visitor",
                    detail: language === "es" ? "Experiencia Arenal" : "Arenal experience",
                  },
                  {
                    quote:
                      language === "es"
                        ? "La reserva por WhatsApp fue sencilla y el servicio se sintió cercano desde el primer mensaje."
                        : "Booking through WhatsApp was simple, and the service felt personal from the first message.",
                    name: language === "es" ? "Familia viajera" : "Traveling family",
                    detail: language === "es" ? "Tour y traslado" : "Tour and transfer",
                  },
                ].map((review) => (
                  <article
                    key={review.name}
                    className="flex min-h-[190px] flex-col rounded-[22px] bg-black/25 p-4 ring-1 ring-white/10"
                  >
                    <div className="flex items-center gap-1 text-leaf" aria-label="5 estrellas">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="size-3.5 fill-current" aria-hidden="true" />
                      ))}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-white/90">“{review.quote}”</p>
                    <div className="mt-auto pt-4">
                      <p className="text-xs font-bold text-white">{review.name}</p>
                      <p className="mt-1 text-[11px] text-white/65">{review.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
              <p className="mt-4 text-[11px] leading-relaxed text-white/60">{t.reviewDisclosure}</p>
            </section>
          </div>
        </div>
      </div>

      {selectedTour && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center"
          role="presentation"
          onClick={() => setSelectedTour(null)}
        >
          <section
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-surface p-4 text-foreground shadow-2xl ring-1 ring-border sm:p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tour-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-leaf-ink">
                  {language === "es" ? "Detalle de actividad" : "Activity details"}
                </p>
                <h2 id="tour-detail-title" className="mt-1 font-display text-2xl leading-tight">
                  {selectedTour.title}
                </h2>
              </div>
              <button
                type="button"
                aria-label={language === "es" ? "Cerrar detalles" : "Close details"}
                onClick={() => setSelectedTour(null)}
                className="grid size-9 shrink-0 place-items-center rounded-full bg-background text-muted-foreground ring-1 ring-border"
              >
                <X className="size-4" />
              </button>
            </div>
            <img
              src={selectedTour.image}
              alt={selectedTour.title}
              className="mt-4 h-44 w-full rounded-[20px] object-cover"
            />
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span className="font-bold uppercase tracking-[0.12em] text-leaf-ink">
                {selectedTour.category}
              </span>
              <span>
                {selectedTour.meta} · ★ {selectedTour.rating}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {selectedTour.summary}
            </p>

            <div className="mt-5 rounded-[22px] bg-background p-3 ring-1 ring-border">
              <h3 className="text-sm font-bold">
                {language === "es" ? "Tours disponibles por tipo" : "Available tours by type"}
              </h3>
              <div className="mt-3 space-y-3">
                {(language === "es"
                  ? [
                      ["Naturaleza", "Volcán Arenal y aguas termales · Puentes Colgantes Místico"],
                      ["Playas", "Escapada a playas del Pacífico"],
                      ["Parques", "Parques nacionales de Costa Rica"],
                      ["Ríos y aventura", "Safari Río Peñas Blancas · Ríos y aventura tropical"],
                    ]
                  : [
                      ["Nature", "Arenal Volcano & hot springs · Mystic Hanging Bridges"],
                      ["Beaches", "Pacific coast beach escape"],
                      ["Parks", "Costa Rica national parks"],
                      [
                        "Rivers & adventure",
                        "Peñas Blancas River Safari · Rivers & tropical adventure",
                      ],
                    ]
                ).map(([type, activities]) => (
                  <div key={type} className="border-b border-border pb-2 last:border-0 last:pb-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-leaf-ink">
                      {type}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {activities}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const tourName = selectedTour.title;
                setSelectedTour(null);
                openWhatsApp(tourName);
              }}
              className="mt-4 w-full rounded-2xl bg-leaf py-3.5 text-sm font-bold text-leaf-foreground shadow-[0_3px_0_color-mix(in_oklch,var(--color-jungle)_35%,transparent)]"
            >
              {t.reserveTour}
            </button>
          </section>
        </div>
      )}

      <nav className="pointer-events-none fixed bottom-0 left-1/2 z-20 w-full max-w-[400px] -translate-x-1/2 px-8 pb-4 lg:max-w-lg">
        <div className="pointer-events-auto flex scale-[0.94] items-center justify-between rounded-[26px] bg-jungle/95 px-6 py-2.5 text-primary-foreground shadow-2xl ring-1 ring-primary-foreground/10 backdrop-blur-md">
          {[
            {
              label: t.home,
              icon: Home,
              active: true,
              action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
            },
            { label: t.chat, icon: MessageCircle, active: false, action: () => openWhatsApp() },
            {
              label: t.profile,
              icon: UserRound,
              active: false,
              action: () => scrollToSection("tours"),
            },
          ].map(({ label, icon: Icon, active, action }) => (
            <button
              key={label}
              onClick={action}
              className={`flex min-w-12 flex-col items-center gap-1 text-[10px] font-bold ${active ? "text-primary-foreground" : "text-panel-muted-foreground"}`}
            >
              <span
                className={`grid size-8 place-items-center rounded-xl ${active ? "bg-leaf text-leaf-foreground" : "bg-primary-foreground/5"}`}
              >
                <Icon className="size-4" />
              </span>
              {label}
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
