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
  Navigation,
  Minus,
  Plus,
  Route as RouteIcon,
  ShieldCheck,
  Star,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import misticoImage from "../assets/mistico-bridges.jpg";
import riverImage from "../assets/penas-blancas.jpg";

type MapsWindow = Window & {
  google?: {
    maps?: {
      DirectionsService: new () => {
        route: (request: unknown, callback: (result: unknown, status: string) => void) => void;
      };
      DirectionsStatus: { OK: string };
      TravelMode: { DRIVING: string };
      places?: {
        Autocomplete: new (
          input: HTMLInputElement,
          options?: unknown,
        ) => {
          addListener: (event: string, callback: () => void) => void;
          getPlace: () => { formatted_address?: string; name?: string };
        };
      };
    };
  };
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
    mapsFallback: "Activa Google Maps para calcular la ruta exacta",
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
    payment: "Pago",
    card: "Tarjeta",
    cash: "Efectivo",
    sharedDestinations: "Destinos de pasajeros",
    passengerDestination: "Destino pasajero",
    exchangeLoading: "Consultando tipo de cambio BCCR…",
    exchangeSource: "Tipo de cambio de referencia BCCR",
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
    mapsFallback: "Enable Google Maps for exact routing",
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
    payment: "Payment",
    card: "Card",
    cash: "Cash",
    sharedDestinations: "Passenger destinations",
    passengerDestination: "Passenger destination",
    exchangeLoading: "Checking BCCR exchange rate…",
    exchangeSource: "BCCR reference exchange rate",
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
  const [origin, setOrigin] = useState("Centro de La Fortuna");
  const [destination, setDestination] = useState("Parque Nacional Volcán Arenal");
  const [passengerOrigins, setPassengerOrigins] = useState([
    "Centro de La Fortuna",
    "Centro de La Fortuna",
  ]);
  const [passengerDestinations, setPassengerDestinations] = useState([
    "Parque Nacional Volcán Arenal",
    "Parque Nacional Volcán Arenal",
  ]);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [fareExpanded, setFareExpanded] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [scheduledTrips, setScheduledTrips] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState("2026-09-18");
  const [scheduleTime, setScheduleTime] = useState("09:30");
  const [distanceKm, setDistanceKm] = useState(8);
  const [durationMinutes, setDurationMinutes] = useState(18);
  const [passengerDistances, setPassengerDistances] = useState<number[]>([8, 8]);
  const [mapsStatus, setMapsStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const mapsScriptLoaded = useRef(false);
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const t = copy[language];
  useEffect(() => {
    const key = import.meta.env["VITE_GOOGLE_MAPS_API_KEY"];
    if (!key) {
      setMapsStatus("fallback");
      return;
    }
    if (mapsScriptLoaded.current || document.querySelector("script[data-google-maps]")) {
      mapsScriptLoaded.current = true;
      setMapsStatus("ready");
      return;
    }
    const script = document.createElement("script");
    script.dataset["googleMaps"] = "true";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
    script.async = true;
    script.onload = () => {
      mapsScriptLoaded.current = true;
      setMapsStatus("ready");
    };
    script.onerror = () => setMapsStatus("fallback");
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (mapsStatus !== "ready" || !origin.trim() || !destination.trim()) return;
    const maps = (window as MapsWindow).google?.maps;
    if (!maps) return;
    const service = new maps.DirectionsService();
    service.route(
      { origin, destination, travelMode: maps.TravelMode.DRIVING },
      (result: unknown, status) => {
        const leg = (
          result as {
            routes?: Array<{
              legs?: Array<{ distance?: { value: number }; duration?: { value: number } }>;
            }>;
          }
        )?.routes?.[0]?.legs?.[0];
        if (status !== maps.DirectionsStatus.OK || !leg?.distance?.value || !leg.duration?.value)
          return;
        setDistanceKm(Math.max(1, Number(leg.distance.value) / 1000));
        setDurationMinutes(Math.max(1, Math.round(Number(leg.duration.value) / 60)));
      },
    );
  }, [destination, mapsStatus, origin]);

  useEffect(() => {
    if (rideType !== "shared" || mapsStatus !== "ready") return;
    const maps = (window as MapsWindow).google?.maps;
    if (!maps) return;
    const service = new maps.DirectionsService();
    passengerOrigins.slice(0, passengers).forEach((passengerOrigin, index) => {
      const passengerDestination = passengerDestinations[index] ?? destination;
      service.route(
        {
          origin: passengerOrigin,
          destination: passengerDestination,
          travelMode: maps.TravelMode.DRIVING,
        },
        (result: unknown, status) => {
          const leg = (
            result as { routes?: Array<{ legs?: Array<{ distance?: { value: number } }> }> }
          )?.routes?.[0]?.legs?.[0];
          if (status === maps.DirectionsStatus.OK && leg?.distance?.value) {
            setPassengerDistances((current) => {
              const next = [...current];
              next[index] = Math.max(1, leg.distance!.value / 1000);
              return next;
            });
          }
        },
      );
    });
  }, [destination, mapsStatus, passengerDestinations, passengerOrigins, passengers, rideType]);

  useEffect(() => {
    if (mapsStatus !== "ready") return;
    const places = (window as MapsWindow).google?.maps?.places;
    if (!places) return;
    const setup = (input: HTMLInputElement | null, setter: (value: string) => void) => {
      if (!input || input.dataset["autocompleteReady"] === "true") return;
      const autocomplete = new places.Autocomplete(input, {
        componentRestrictions: { country: "cr" },
        fields: ["formatted_address", "name"],
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        setter(place.formatted_address ?? place.name ?? input.value);
      });
      input.dataset["autocompleteReady"] = "true";
    };
    setup(originInputRef.current, setOrigin);
    setup(destinationInputRef.current, setDestination);
  }, [mapsStatus]);

  useEffect(() => {
    let active = true;
    fetch("https://api.frankfurter.dev/v2/providers/bccr/rates?base=usd")
      .then((response) => {
        if (!response.ok) throw new Error("Exchange rate request failed");
        return response.json() as Promise<Array<{ quote: string; rate: number }>>;
      })
      .then((rates) => {
        const usdToCrc = rates.find((rate) => rate.quote === "CRC")?.rate;
        if (active && usdToCrc) setExchangeRate(usdToCrc);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  const fare = useMemo(() => {
    const pricingFactor = 1;
    if (rideType === "private") {
      const base = 8;
      const distanceCharge = distanceKm * 1.35;
      const timeCharge = durationMinutes * 0.18;
      const service = Math.round((base + distanceCharge + timeCharge) * pricingFactor);
      const operations = Math.round(7 * pricingFactor);
      const platform = Math.round(4 * pricingFactor);
      return {
        service,
        operations,
        platform,
        total: service + operations + platform,
        perPassenger: [] as Array<{ destination: string; total: number }>,
      };
    }
    const perPassenger = passengerDestinations
      .slice(0, passengers)
      .map((passengerDestination, index) => {
        const passengerDistance = passengerDistances[index] ?? distanceKm;
        const service = Math.round(
          (5 + passengerDistance * 0.95 + durationMinutes * 0.1) * pricingFactor,
        );
        const operations = Math.round(4 * pricingFactor);
        const platform = Math.round(3 * pricingFactor);
        return { destination: passengerDestination, total: service + operations + platform };
      });
    const total = perPassenger.reduce((sum, item) => sum + item.total, 0);
    return { service: total, operations: 0, platform: 0, total, perPassenger };
  }, [
    distanceKm,
    durationMinutes,
    passengerDestinations,
    passengerDistances,
    passengers,
    rideType,
  ]);

  const formatColones = (amount: number) =>
    exchangeRate
      ? `₡${Math.round(amount * exchangeRate).toLocaleString("es-CR")}`
      : t.exchangeLoading;

  const updatePassengers = (nextPassengers: number) => {
    setPassengers(nextPassengers);
    setPassengerOrigins((current) =>
      Array.from({ length: nextPassengers }, (_, index) => current[index] ?? origin),
    );
    setPassengerDestinations((current) =>
      Array.from({ length: nextPassengers }, (_, index) => current[index] ?? destination),
    );
  };

  const scheduleTrip = () => {
    const label = `${scheduleDate} · ${scheduleTime} · ${origin} → ${destination}`;
    setScheduledTrips((current) => [...current, label]);
    setTiming("schedule");
  };

  const openWhatsApp = (tourName?: string) => {
    const isSpanish = language === "es";
    const message = tourName
      ? isSpanish
        ? `Hola Via La Fortuna, me gustaría reservar el tour ${tourName}. ¿Podrían ayudarme con disponibilidad y próximos pasos?`
        : `Hello Via La Fortuna, I would like to book the ${tourName} tour. Could you help me with availability and next steps?`
      : isSpanish
        ? `Hola Via La Fortuna, me gustaría reservar un traslado.\n\nOrigen: ${origin}\nDestino: ${destination}\n${rideType === "shared" ? `Rutas por pasajero:\n${passengerDestinations.map((item, index) => `Pasajero ${index + 1}: ${passengerOrigins[index]} → ${item}`).join("\n")}` : ""}\nTipo: ${rideType === "private" ? "Privado" : "Compartido"}\nHorario: ${timing === "now" ? "Ahora" : `${scheduleDate} · ${scheduleTime}`}\nPasajeros: ${passengers}\nPago: ${paymentMethod === "card" ? "Tarjeta" : "Efectivo"}\nTarifa estimada: $${fare.total} USD (${formatColones(fare.total)})`
        : `Hello Via La Fortuna, I would like to book a transfer.\n\nPickup: ${origin}\nDestination: ${destination}\n${rideType === "shared" ? `Passenger routes:\n${passengerDestinations.map((item, index) => `Passenger ${index + 1}: ${passengerOrigins[index]} → ${item}`).join("\n")}` : ""}\nType: ${rideType === "private" ? "Private" : "Shared"}\nTiming: ${timing === "now" ? "Now" : `${scheduleDate} · ${scheduleTime}`}\nPassengers: ${passengers}\nPayment: ${paymentMethod === "card" ? "Card" : "Cash"}\nEstimated fare: $${fare.total} USD (${formatColones(fare.total)})`;

    window.open(
      `https://wa.me/50663135655?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    if (!tourName) setConfirmed(true);
  };

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
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                {t.place}
              </p>
            </div>
          </div>
          <div
            className="flex rounded-full bg-mist/25 p-1 ring-1 ring-border"
            aria-label="Language"
          >
            {(["es", "en"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase transition-colors ${language === lang ? "bg-jungle text-primary-foreground" : "text-muted-foreground"}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(390px,0.72fr)] lg:gap-16">
          <div>
            <section className="rise mt-8 [animation-delay:80ms]">
              <div className="flex items-center gap-2 text-leaf">
                <span className="h-px w-4 bg-leaf/50" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">{t.eyebrow}</p>
              </div>
              <h1 className="mt-2 max-w-xl font-display text-[32px] leading-[1.12] lg:text-5xl">
                {t.title}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground lg:text-base">
                {t.subtitle}
              </p>
            </section>

            <div className="rise mt-7 grid grid-cols-2 gap-2 rounded-3xl bg-mist/20 p-1.5 ring-1 ring-border [animation-delay:140ms]">
              <button
                onClick={() => setMode("transfers")}
                className={`rounded-[18px] py-3.5 text-sm font-bold transition-all ${mode === "transfers" ? "bg-jungle text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground"}`}
              >
                {t.transfers}
              </button>
              <button
                onClick={() => setMode("tours")}
                className={`rounded-[18px] py-3.5 text-sm font-bold transition-all ${mode === "tours" ? "bg-jungle text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground"}`}
              >
                {t.tours}
              </button>
            </div>

            {mode === "transfers" && (
              <section className="mt-3 overflow-hidden rounded-[28px] bg-jungle p-4 text-primary-foreground shadow-lg shadow-primary/15">
                <div className="relative h-44 overflow-hidden rounded-[22px] bg-[#1d2929]">
                  <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(18deg,transparent_11%,#41514b_12%,#41514b_13%,transparent_14%,transparent_58%,#41514b_59%,#41514b_60%,transparent_61%),linear-gradient(112deg,transparent_18%,#33433f_19%,#33433f_22%,transparent_23%),linear-gradient(78deg,transparent_67%,#33433f_68%,#33433f_70%,transparent_71%),linear-gradient(160deg,transparent_42%,#52615a_43%,#52615a_44%,transparent_45%)]" />
                  <div className="absolute inset-x-0 top-[30%] h-px bg-[#718078]/50" />
                  <div className="absolute -left-8 top-[68%] h-px w-[120%] rotate-[-18deg] bg-[#718078]/60" />
                  <div className="absolute left-[14%] top-[63%] h-3 w-3 rounded-full bg-white shadow-[0_0_0_5px_rgba(255,255,255,0.18)]" />
                  <div className="absolute right-[18%] top-[22%] h-4 w-4 rounded-full border-[3px] border-white bg-[#ff5a5f] shadow-[0_0_0_5px_rgba(255,90,95,0.2)]" />
                  <div className="absolute left-[18%] top-[59%] h-[3px] w-[65%] rotate-[-34deg] rounded-full bg-[#b9e36d] shadow-[0_0_8px_rgba(185,227,109,0.8)]" />
                  <div className="absolute left-3 top-3 rounded-full bg-[#101818]/80 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white/80">
                    Ruta sugerida
                  </div>
                  <div className="absolute right-3 top-3 grid gap-1 rounded-xl bg-[#101818]/80 p-1 text-white/80">
                    <button
                      aria-label="Acercar mapa"
                      className="grid size-6 place-items-center rounded-lg text-sm"
                    >
                      +
                    </button>
                    <button
                      aria-label="Alejar mapa"
                      className="grid size-6 place-items-center rounded-lg text-sm"
                    >
                      −
                    </button>
                  </div>
                  <Navigation className="absolute bottom-3 right-3 size-4 text-[#b9e36d]" />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-mist/60">
                      {t.pickupShort}
                    </p>
                    <p className="truncate font-semibold">{origin}</p>
                  </div>
                  <ArrowDownUp className="size-4 shrink-0 text-leaf" />
                  <div className="min-w-0 text-right">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-mist/60">
                      {t.destinationShort}
                    </p>
                    <p className="truncate font-semibold">{destination}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-mist/15 pt-3 text-[11px] text-mist/70">
                  <span>
                    {t.distance}: {distanceKm.toFixed(1)} km
                  </span>
                  <span>
                    {t.duration}: {durationMinutes} min
                  </span>
                </div>
                <p className="mt-2 text-[10px] text-mist/50">
                  {mapsStatus === "ready"
                    ? "Google Maps · ruta en automóvil"
                    : mapsStatus === "loading"
                      ? t.mapsLoading
                      : t.mapsFallback}
                </p>
              </section>
            )}

            {mode === "transfers" ? (
              <section className="rise mt-4 rounded-[30px] bg-surface p-4 shadow-xl shadow-primary/10 ring-1 ring-border [animation-delay:200ms]">
                <div className="rounded-2xl bg-background/70 p-4 ring-1 ring-border">
                  <div className="flex items-center gap-4">
                    <MapPin className="size-4 shrink-0 text-leaf" />
                    <label className="flex-1">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        {t.origin}
                      </span>
                      <input
                        ref={originInputRef}
                        aria-label={t.origin}
                        value={origin}
                        onChange={(event) => setOrigin(event.target.value)}
                        className="mt-0.5 w-full rounded-full bg-surface px-4 py-2 text-[15px] font-semibold outline-none ring-1 ring-border transition focus:ring-2 focus:ring-leaf"
                      />
                    </label>
                    <ArrowDownUp className="size-4 text-muted-foreground" />
                  </div>
                  <div className="my-3 ml-2 h-5 w-px bg-border" />
                  <div className="flex items-center gap-4">
                    <MapPin className="size-4 shrink-0 text-primary" />
                    <label className="flex-1">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        {t.destination}
                      </span>
                      <input
                        ref={destinationInputRef}
                        aria-label={t.destination}
                        value={destination}
                        onChange={(event) => setDestination(event.target.value)}
                        className="mt-0.5 w-full rounded-full bg-surface px-4 py-2 text-[15px] font-semibold outline-none ring-1 ring-border transition focus:ring-2 focus:ring-leaf"
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-full bg-background p-1 ring-1 ring-border">
                  {(["private", "shared"] as const).map((value) => (
                    <button
                      key={value}
                      onClick={() => setRideType(value)}
                      className={`rounded-full py-2.5 text-[13px] font-bold ${rideType === value ? "bg-leaf text-accent-foreground shadow-sm" : "text-muted-foreground"}`}
                    >
                      {t[value]}
                    </button>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-background px-3 py-2.5 ring-1 ring-border">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      <Clock3 className="size-3.5" />
                      {timing === "now" ? t.now : t.schedule}
                    </div>
                    <button
                      onClick={() => setTiming(timing === "now" ? "schedule" : "now")}
                      className="mt-1 flex w-full items-center justify-between text-sm font-semibold"
                    >
                      {timing === "now" ? t.now : "18 Sep · 09:30"}
                      <CalendarDays className="size-4 text-leaf" />
                    </button>
                  </div>
                  <div className="rounded-2xl bg-background px-3 py-2.5 ring-1 ring-border">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      <UsersRound className="size-3.5" />
                      {t.passengers}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <button
                        aria-label="Restar pasajero"
                        onClick={() => updatePassengers(Math.max(1, passengers - 1))}
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="text-sm font-bold">{passengers}</span>
                      <button
                        aria-label="Agregar pasajero"
                        onClick={() => updatePassengers(Math.min(8, passengers + 1))}
                      >
                        <Plus className="size-4 text-leaf" />
                      </button>
                    </div>
                  </div>
                </div>
                {timing === "schedule" && (
                  <div className="mt-3 rounded-[24px] bg-background p-3 ring-1 ring-border">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      <CalendarDays className="size-3.5 text-leaf" />
                      {t.scheduledTrip}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(event) => setScheduleDate(event.target.value)}
                        className="rounded-full bg-surface px-3 py-2 text-sm font-semibold ring-1 ring-border outline-none"
                      />
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(event) => setScheduleTime(event.target.value)}
                        className="rounded-full bg-surface px-3 py-2 text-sm font-semibold ring-1 ring-border outline-none"
                      />
                    </div>
                    <button
                      onClick={scheduleTrip}
                      className="mt-2 w-full rounded-full bg-leaf py-2 text-xs font-bold text-accent-foreground"
                    >
                      {t.agenda}
                    </button>
                  </div>
                )}
                {scheduledTrips.length > 0 && (
                  <div className="mt-3 rounded-[24px] bg-background p-3 ring-1 ring-border">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {t.agenda}
                    </p>
                    <div className="mt-2 space-y-2">
                      {scheduledTrips.map((trip, index) => (
                        <p
                          key={`${trip}-${index}`}
                          className="rounded-full bg-surface px-3 py-2 text-xs font-semibold"
                        >
                          {trip}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {rideType === "shared" && (
                  <div className="mt-3 rounded-2xl bg-background p-3 ring-1 ring-border">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      <MapPin className="size-3.5 text-leaf" />
                      {t.sharedDestinations}
                    </div>
                    <div className="mt-2 space-y-2">
                      {Array.from({ length: passengers }, (_, index) => (
                        <div key={index} className="space-y-1">
                          <label className="block">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              {t.pickupShort} {index + 1}
                            </span>
                            <input
                              value={passengerOrigins[index] ?? ""}
                              onChange={(event) =>
                                setPassengerOrigins((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index ? event.target.value : item,
                                  ),
                                )
                              }
                              placeholder={origin}
                              className="mt-0.5 w-full rounded-full bg-surface px-3 py-2 text-sm font-semibold outline-none ring-1 ring-border"
                            />
                          </label>
                          <label className="block">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              {t.passengerDestination} {index + 1}
                            </span>
                            <input
                              value={passengerDestinations[index] ?? ""}
                              onChange={(event) =>
                                setPassengerDestinations((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index ? event.target.value : item,
                                  ),
                                )
                              }
                              placeholder={destination}
                              className="mt-0.5 w-full rounded-full bg-surface px-3 py-2 text-sm font-semibold outline-none ring-1 ring-border"
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-3 rounded-2xl bg-background p-1 ring-1 ring-border">
                  <p className="px-3 pt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {t.payment}
                  </p>
                  <div className="mt-1 grid grid-cols-2 gap-1">
                    {(["card", "cash"] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`rounded-xl py-2.5 text-sm font-bold transition-colors ${paymentMethod === method ? "bg-leaf text-accent-foreground" : "text-muted-foreground"}`}
                      >
                        {method === "card" ? t.card : t.cash}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <section className="rise mt-4 rounded-[30px] bg-surface p-5 shadow-xl shadow-primary/10 ring-1 ring-border">
                <Compass className="size-7 text-leaf" />
                <h2 className="mt-3 font-display text-2xl">{t.escapes}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {language === "es"
                    ? "Elija una experiencia con transporte y acompañamiento bilingüe incluidos."
                    : "Choose an experience with transport and bilingual assistance included."}
                </p>
                <button className="mt-5 w-full rounded-2xl bg-jungle py-4 text-sm font-bold text-primary-foreground">
                  {t.explore}
                </button>
              </section>
            )}
          </div>

          <div>
            {mode === "transfers" && (
              <section className="rise mt-4 overflow-hidden rounded-[28px] bg-jungle p-5 text-primary-foreground shadow-2xl shadow-primary/25 lg:mt-8 [animation-delay:260ms]">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mist/70">
                    {t.estimate}
                  </p>
                  <ShieldCheck className="size-5 text-leaf" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="font-display text-[38px] leading-none">${fare.total}</p>
                  <p className="text-xs text-mist/60">USD</p>
                </div>
                <p className="mt-1 text-sm font-semibold text-mist/85">
                  {formatColones(fare.total)} {exchangeRate ? "CRC" : ""}
                </p>
                <p className="mt-2 text-[10px] text-mist/55">
                  {rideType === "private" ? t.privateFixed : t.perPassenger}
                </p>
                <p className="mt-1 text-[10px] text-mist/55">
                  {exchangeRate
                    ? `${t.exchangeSource}: ₡${exchangeRate.toLocaleString("es-CR")} / USD`
                    : t.exchangeLoading}
                </p>
                <button
                  onClick={() => setFareExpanded(!fareExpanded)}
                  className="mt-4 flex w-full items-center justify-between border-t border-mist/15 pt-4 text-xs font-semibold text-mist/80"
                >
                  <span>{t.details}</span>
                  <ChevronDown
                    className={`size-4 transition-transform ${fareExpanded ? "rotate-180" : ""}`}
                  />
                </button>
                {fareExpanded && (
                  <div className="mt-3 space-y-2 rounded-2xl bg-primary-foreground/5 p-3 text-[13px] ring-1 ring-primary-foreground/10">
                    {fare.perPassenger.length > 0 &&
                      fare.perPassenger.map((item, index) => (
                        <div
                          key={`${item.destination}-${index}`}
                          className="flex justify-between gap-3"
                        >
                          <span className="truncate text-mist/75">
                            Pasajero {index + 1} · {item.destination}
                          </span>
                          <strong>${item.total}</strong>
                        </div>
                      ))}
                    <div className="flex justify-between">
                      <span className="text-mist/75">{t.trip}</span>
                      <strong>${fare.service}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mist/75">{t.operations}</span>
                      <strong>${fare.operations}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mist/75">{t.platform}</span>
                      <strong>${fare.platform}</strong>
                    </div>
                    <div className="flex justify-between border-t border-mist/15 pt-2">
                      <span>{t.total}</span>
                      <strong className="font-display text-lg">${fare.total}</strong>
                    </div>
                  </div>
                )}
                <p className="mt-3 flex items-center gap-2 text-xs italic text-mist/65">
                  <ShieldCheck className="size-4" />
                  {t.note}
                </p>
                <button
                  onClick={() => openWhatsApp()}
                  className="mt-4 w-full rounded-2xl bg-leaf py-3.5 text-sm font-bold text-accent-foreground transition-transform active:scale-[0.98]"
                >
                  {confirmed
                    ? language === "es"
                      ? "Solicitud confirmada"
                      : "Request confirmed"
                    : language === "es"
                      ? "Confirmar reserva"
                      : "Confirm booking"}
                </button>
              </section>
            )}

            <section className="mt-10">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 text-leaf">
                    <span className="size-1.5 rounded-full bg-leaf" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em]">{t.curation}</p>
                  </div>
                  <h2 className="mt-1 font-display text-[22px]">{t.escapes}</h2>
                </div>
                <button className="text-xs font-bold text-leaf">{t.explore}</button>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                {language === "es"
                  ? "Descubre experiencias locales y escapadas por Costa Rica: playas, parques nacionales, ríos y bosque tropical."
                  : "Discover local experiences and Costa Rica escapes: beaches, national parks, rivers, and tropical forest."}
              </p>
              <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                {["Arenal", "Playas", "Parques nacionales", "Ríos"].map((category) => (
                  <button
                    key={category}
                    className="shrink-0 rounded-full bg-mist/30 px-4 py-2 text-xs font-bold text-primary ring-1 ring-border"
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="hide-scrollbar -mx-6 flex gap-4 overflow-x-auto px-6 pb-6 lg:mx-0 lg:grid lg:grid-cols-2 lg:px-0">
                {[
                  {
                    image: misticoImage,
                    title: "Puentes Colgantes Místico",
                    meta: `3.5 ${t.hours}`,
                    price: "$85",
                    rating: "4.9",
                    category: "Arenal · Naturaleza",
                    summary:
                      "Senderos y puentes suspendidos entre bosque nuboso, con vistas del paisaje volcánico.",
                  },
                  {
                    image: riverImage,
                    title: "Safari Río Peñas Blancas",
                    meta: `4 ${t.hours}`,
                    price: "$60",
                    rating: "4.8",
                    category: "La Fortuna · Río",
                    summary:
                      "Recorrido tranquilo por el río para observar aves y vida silvestre con guía local.",
                  },
                ].map((tour) => (
                  <article
                    key={tour.title}
                    className="w-[260px] shrink-0 rounded-[26px] bg-surface p-3 shadow-xl shadow-primary/10 ring-1 ring-border lg:w-auto"
                  >
                    <img
                      src={tour.image}
                      alt={tour.title}
                      width={1024}
                      height={768}
                      loading="lazy"
                      className="aspect-[4/3] w-full rounded-[19px] object-cover"
                    />
                    <div className="px-2 pb-2 pt-4">
                      <h3 className="font-display text-[17px] leading-snug">{tour.title}</h3>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-leaf">
                        {tour.category}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {tour.summary}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {tour.meta} · {tour.price}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-leaf">
                          <Star className="size-3 fill-current" />
                          {tour.rating}
                        </span>
                      </div>
                      <button
                        onClick={() => openWhatsApp(tour.title)}
                        className="mt-3 w-full rounded-xl bg-mist/30 py-2.5 text-xs font-bold text-primary"
                      >
                        {t.reserveTour}
                      </button>
                    </div>
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
          ].map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              className={`flex min-w-12 flex-col items-center gap-1 text-[10px] font-bold ${active ? "text-primary-foreground" : "text-mist/45"}`}
            >
              <span
                className={`grid size-8 place-items-center rounded-xl ${active ? "bg-leaf" : "bg-primary-foreground/5"}`}
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
