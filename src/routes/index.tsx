import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Bike,
  CarFront,
  CheckCircle2,
  Circle,
  Clock3,
  Compass,
  Home,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Plane,
  Plus,
  Route as RouteIcon,
  Search,
  ShieldCheck,
  Star,
  X,
  UserRound,
  Utensils,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { User } from "firebase/auth";

import misticoImage from "../assets/mistico-bridges.jpg";
import riverImage from "../assets/penas-blancas.jpg";
import { MiniRouteMap } from "../components/MiniRouteMap";
import { saveBooking } from "../lib/firebase-bookings";
import {
  isFirebaseAuthConfigured,
  registerUser,
  signInUser,
  signOutUser,
  subscribeToUser,
} from "../lib/firebase-auth";

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
      Geocoder?: new () => {
        geocode: (
          request: { location: { lat: number; lng: number } },
          callback: (results: Array<{ formatted_address?: string }>, status: string) => void,
        ) => void;
      };
    };
  };
};

type TourCard = {
  image: string;
  title: string;
  meta: string;
  rating: string;
  category: string;
  summary: string;
};

type FeatureKey = "food" | "ride" | "send" | "motorbike" | "booking" | "promotion";

function getFeatureContent(feature: FeatureKey, language: "es" | "en") {
  const spanish = language === "es";
  const content = {
    food: {
      title: spanish ? "Alimentos" : "Food",
      eyebrow: spanish ? "Servicio local" : "Local service",
      description: spanish
        ? "Coordina un traslado para recoger alimentos en La Fortuna. Indica el punto de recogida y el destino para solicitar disponibilidad."
        : "Arrange a ride to pick up food in La Fortuna. Add the pickup point and destination to request availability.",
      action: spanish ? "Configurar traslado" : "Set up a ride",
    },
    ride: {
      title: spanish ? "Viajes" : "Rides",
      eyebrow: spanish ? "Movilidad local" : "Local mobility",
      description: spanish
        ? "Calcula tu ruta, revisa la distancia y solicita un traslado privado o compartido."
        : "Calculate your route, review the distance, and request a private or shared ride.",
      action: spanish ? "Abrir formulario de viaje" : "Open ride form",
    },
    send: {
      title: spanish ? "Enviar artículos" : "Send items",
      eyebrow: spanish ? "Traslado de artículos" : "Item transport",
      description: spanish
        ? "Solicita ayuda para trasladar artículos entre dos puntos de La Fortuna. La disponibilidad se coordina con el operador."
        : "Request help transporting items between two points in La Fortuna. Availability is coordinated with the operator.",
      action: spanish ? "Solicitar traslado" : "Request transport",
    },
    motorbike: {
      title: spanish ? "Moto" : "Motorbike",
      eyebrow: spanish ? "Movilidad ágil" : "Agile mobility",
      description: spanish
        ? "Consulta disponibilidad para una opción de movilidad en moto y coordina los detalles de tu viaje."
        : "Check motorbike mobility availability and coordinate the details of your ride.",
      action: spanish ? "Consultar disponibilidad" : "Check availability",
    },
    booking: {
      title: spanish ? "Reservas" : "Bookings",
      eyebrow: spanish ? "Planifica tu viaje" : "Plan your trip",
      description: spanish
        ? "Elige origen, destino, horario, pasajeros y forma de pago para preparar tu solicitud."
        : "Choose pickup, destination, timing, passengers, and payment method to prepare your request.",
      action: spanish ? "Abrir formulario de reserva" : "Open booking form",
    },
    promotion: {
      title: "Pizza La Fortuna",
      eyebrow: spanish ? "Promoción local" : "Local promotion",
      description: spanish
        ? "Consulta disponibilidad de la promoción 2x1 y coordina la entrega o recogida directamente con el contacto local."
        : "Ask about the 2-for-1 promotion and coordinate delivery or pickup directly with the local contact.",
      action: spanish ? "Consultar por WhatsApp" : "Ask on WhatsApp",
    },
  } as const;
  return content[feature];
}

function getFeatureIcon(feature: FeatureKey) {
  if (feature === "food") return Utensils;
  if (feature === "ride") return Plane;
  if (feature === "send") return Package;
  if (feature === "motorbike") return Bike;
  if (feature === "booking") return CalendarDays;
  return Star;
}

function featureFromHash(hash: string): FeatureKey | null {
  const value = hash.replace(/^#feature\//, "");
  return ["food", "ride", "send", "motorbike", "booking", "promotion"].includes(value)
    ? (value as FeatureKey)
    : null;
}

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
  const [mode, setMode] = useState<"transfers" | "tours">("transfers");
  const [activeNav, setActiveNav] = useState<"home" | "routes" | "chat" | "profile">("home");
  const [timing, setTiming] = useState<"now" | "schedule">("now");
  const [rideType, setRideType] = useState<"private" | "shared">("private");
  const [passengers, setPassengers] = useState(2);
  const [returnEmpty, setReturnEmpty] = useState(false);
  const [badRoad, setBadRoad] = useState(false);
  const [origin, setOrigin] = useState("Centro de La Fortuna");
  const [destination, setDestination] = useState("Parque Nacional Volcán Arenal");
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "locating" | "ready" | "denied">(
    "idle",
  );
  const [passengerOrigins, setPassengerOrigins] = useState([
    "Centro de La Fortuna",
    "Centro de La Fortuna",
  ]);
  const [passengerDestinations, setPassengerDestinations] = useState([
    "Parque Nacional Volcán Arenal",
    "Parque Nacional Volcán Arenal",
  ]);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("cash");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [scheduledTrips, setScheduledTrips] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    return new Date(today.getTime() - offset * 60_000).toISOString().slice(0, 10);
  });
  const [scheduleTime, setScheduleTime] = useState("09:30");
  const [distanceKm, setDistanceKm] = useState(8);
  const [durationMinutes, setDurationMinutes] = useState(18);
  const [passengerDistances, setPassengerDistances] = useState<number[]>([8, 8]);
  const [passengerDurations, setPassengerDurations] = useState<number[]>([18, 18]);
  const [mapsStatus, setMapsStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const [routeStatus, setRouteStatus] = useState<"idle" | "updating" | "updated">("idle");
  const [selectedTour, setSelectedTour] = useState<TourCard | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<FeatureKey | null>(() =>
    typeof window === "undefined" ? null : featureFromHash(window.location.hash),
  );
  const [featureTransition, setFeatureTransition] = useState<"enter" | "exit">("enter");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const dynamicMultiplier = 2.8;
  const returnMultiplier = returnEmpty ? 2 : 1;
  const roadMultiplier = badRoad ? 1.2 : 1.5;
  const tollsAndFees = 0;
  const mapsScriptLoaded = useRef(false);
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const t = copy[language];

  useEffect(() => {
    const unsubscribe = subscribeToUser(setUser);
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    if (!selectedTour) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTourDetail();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedTour]);

  useEffect(() => {
    const handleBack = () => setSelectedTour(null);
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  useEffect(() => {
    const handleFeatureBack = () => {
      if (featureFromHash(window.location.hash)) {
        setSelectedFeature(featureFromHash(window.location.hash));
        setFeatureTransition("enter");
        return;
      }
      if (!selectedFeature) return;
      setFeatureTransition("exit");
      window.setTimeout(() => setSelectedFeature(null), 260);
    };
    window.addEventListener("popstate", handleFeatureBack);
    return () => window.removeEventListener("popstate", handleFeatureBack);
  }, [selectedFeature]);

  useEffect(() => {
    if (!selectedFeature) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setFeatureTransition("exit");
      if (window.location.hash.startsWith("#feature/")) {
        window.setTimeout(() => window.history.back(), 260);
      } else {
        window.setTimeout(() => setSelectedFeature(null), 260);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedFeature]);

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
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }

    setLocationStatus("locating");
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const maps = (window as MapsWindow).google?.maps;
        if (!maps?.Geocoder) {
          setCurrentLocation(null);
          setLocationStatus("ready");
          return;
        }

        setCurrentLocation(null);
        setLocationStatus("locating");
        const geocoder = new maps.Geocoder();
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
          if (status === "OK" && results[0]?.formatted_address) {
            setCurrentLocation(results[0].formatted_address);
            setLocationStatus("ready");
            return;
          }
          setCurrentLocation(null);
          setLocationStatus("ready");
        });
      },
      () => {
        setLocationStatus("denied");
        setCurrentLocation(null);
      },
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 12_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [language, mapsStatus]);

  useEffect(() => {
    if (mapsStatus !== "ready" || !origin.trim() || !destination.trim()) return;
    setRouteStatus("updating");
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
        if (status !== maps.DirectionsStatus.OK || !leg?.distance?.value || !leg.duration?.value) {
          setRouteStatus("updated");
          return;
        }
        setDistanceKm(Math.max(1, Number(leg.distance.value) / 1000));
        setDurationMinutes(Math.max(1, Math.round(Number(leg.duration.value) / 60)));
        setRouteStatus("updated");
      },
    );
  }, [destination, mapsStatus, origin]);

  useEffect(() => {
    if (mapsStatus !== "fallback" || !origin.trim() || !destination.trim()) return;
    const fallbackDistance = Math.max(
      1,
      4 + ((origin.length * 7 + destination.length * 11) % 120) / 10,
    );
    setDistanceKm(fallbackDistance);
    setDurationMinutes(Math.max(3, Math.round(fallbackDistance * 2.2)));
    setRouteStatus("updated");
  }, [destination, mapsStatus, origin]);

  useEffect(() => {
    if (rideType !== "shared" || mapsStatus !== "fallback") return;
    setPassengerDistances((current) =>
      Array.from({ length: passengers }, (_, index) => {
        const passengerOrigin = passengerOrigins[index] ?? origin;
        const passengerDestination = passengerDestinations[index] ?? destination;
        return Math.max(
          1,
          4 + ((passengerOrigin.length * 7 + passengerDestination.length * 11) % 120) / 10,
        );
      }),
    );
    setPassengerDurations(() =>
      Array.from({ length: passengers }, (_, index) => {
        const passengerOrigin = passengerOrigins[index] ?? origin;
        const passengerDestination = passengerDestinations[index] ?? destination;
        const fallbackDistance = Math.max(
          1,
          4 + ((passengerOrigin.length * 7 + passengerDestination.length * 11) % 120) / 10,
        );
        return Math.max(3, Math.round(fallbackDistance * 2.2));
      }),
    );
  }, [
    destination,
    durationMinutes,
    mapsStatus,
    origin,
    passengerDestinations,
    passengerOrigins,
    passengers,
    rideType,
  ]);

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
            result as {
              routes?: Array<{
                legs?: Array<{ distance?: { value: number }; duration?: { value: number } }>;
              }>;
            }
          )?.routes?.[0]?.legs?.[0];
          if (status === maps.DirectionsStatus.OK && leg?.distance?.value && leg.duration?.value) {
            setPassengerDistances((current) => {
              const next = [...current];
              next[index] = Math.max(1, leg.distance!.value / 1000);
              return next;
            });
            setPassengerDurations((current) => {
              const next = [...current];
              next[index] = Math.max(1, Math.round(leg.duration!.value / 60));
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
        types: ["geocode", "establishment"],
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
    const refreshExchangeRate = () => {
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
    };

    refreshExchangeRate();
    const refreshTimer = window.setInterval(refreshExchangeRate, 15 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, []);
  const fare = useMemo(() => {
    const crcToUsd = (amount: number) => amount / (exchangeRate ?? 500);
    const calculateCrc = (distance: number) => {
      const tripKm = distance * returnMultiplier;
      return Math.round(((tripKm / 11) * 764 + tripKm * 40) * dynamicMultiplier * roadMultiplier);
    };
    if (rideType === "private") {
      const totalCrc = calculateCrc(distanceKm);
      const service = Math.round(crcToUsd(totalCrc) * 100) / 100;
      return {
        base: 0,
        timeCharge: 0,
        distanceCharge: service,
        dynamicMultiplier,
        returnMultiplier,
        roadMultiplier,
        tollsAndFees,
        service,
        operations: 0,
        platform: tollsAndFees,
        total: Math.round((service + tollsAndFees) * 100) / 100,
        totalCrc,
        perPassenger: [] as Array<{
          destination: string;
          distance: number;
          duration: number;
          total: number;
        }>,
      };
    }
    const perPassenger = passengerDestinations
      .slice(0, passengers)
      .map((passengerDestination, index) => {
        const passengerDistance = passengerDistances[index] ?? distanceKm;
        const totalCrc = calculateCrc(passengerDistance);
        const total = Math.round((crcToUsd(totalCrc) + tollsAndFees) * 100) / 100;
        return {
          destination: passengerDestination,
          distance: passengerDistance,
          duration: passengerDurations[index] ?? durationMinutes,
          total,
        };
      });
    const total = perPassenger.reduce((sum, item) => sum + item.total, 0);
    return {
      base: 0,
      timeCharge: 0,
      distanceCharge: Math.round(crcToUsd(calculateCrc(distanceKm)) * 100) / 100,
      dynamicMultiplier,
      returnMultiplier,
      roadMultiplier,
      tollsAndFees,
      service: total,
      operations: 0,
      platform: 0,
      total: Math.round(total * 100) / 100,
      totalCrc: Math.round(total * (exchangeRate ?? 500)),
      perPassenger,
    };
  }, [
    distanceKm,
    durationMinutes,
    exchangeRate,
    passengerDestinations,
    passengerDistances,
    passengerDurations,
    passengers,
    rideType,
    dynamicMultiplier,
    returnMultiplier,
    roadMultiplier,
    tollsAndFees,
  ]);

  const formatColones = (amount: number) =>
    exchangeRate ? `₡${Math.round(amount * exchangeRate).toLocaleString("es-CR")}` : "₡—";
  const formatDollars = (amount: number) => `$${amount.toFixed(2)}`;
  const formatFareAmount = (amount: number) =>
    language === "es" ? formatColones(amount) : formatDollars(amount);
  const formatFareSecondary = (amount: number) =>
    language === "es" ? `${formatDollars(amount)} USD` : `${formatColones(amount)} CRC`;
  const formatFareForMessage = (amount: number) =>
    language === "es"
      ? `${formatColones(amount)} CRC (${formatDollars(amount)} USD)`
      : `${formatDollars(amount)} USD (${formatColones(amount)} CRC)`;

  const updatePassengers = (nextPassengers: number) => {
    setPassengers(nextPassengers);
    setPassengerOrigins((current) =>
      Array.from({ length: nextPassengers }, (_, index) => current[index] ?? origin),
    );
    setPassengerDestinations((current) =>
      Array.from({ length: nextPassengers }, (_, index) => current[index] ?? destination),
    );
    setPassengerDistances((current) =>
      Array.from({ length: nextPassengers }, (_, index) => current[index] ?? distanceKm),
    );
    setPassengerDurations((current) =>
      Array.from({ length: nextPassengers }, (_, index) => current[index] ?? durationMinutes),
    );
  };

  const submitAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthSubmitting(true);
    setAuthError("");
    try {
      if (authMode === "login") await signInUser(authEmail, authPassword);
      else await registerUser(authEmail, authPassword);
      setAuthPassword("");
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? "No se pudo completar la solicitud. Revisa tus datos e inténtalo de nuevo."
          : "Error de autenticación.",
      );
    } finally {
      setAuthSubmitting(false);
    }
  };

  const scheduleTrip = () => {
    const label = `${scheduleDate} · ${scheduleTime} · ${origin} → ${destination}`;
    setScheduledTrips((current) => (current.includes(label) ? current : [...current, label]));
    setTiming("schedule");
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openWhatsApp = (tourName?: string) => {
    const isSpanish = language === "es";
    const message = tourName
      ? isSpanish
        ? `Hola Via La Fortuna, me gustaría reservar el tour ${tourName}. ¿Podrían ayudarme con disponibilidad y próximos pasos?`
        : `Hello Via La Fortuna, I would like to book the ${tourName} tour. Could you help me with availability and next steps?`
      : isSpanish
        ? `Hola Via La Fortuna, me gustaría reservar un traslado.\n\nOrigen: ${origin}\nDestino: ${destination}\n${rideType === "shared" ? `Rutas por pasajero:\n${passengerDestinations.map((item, index) => `Pasajero ${index + 1}: ${passengerOrigins[index]} → ${item}`).join("\n")}` : ""}\nTipo: ${rideType === "private" ? "Privado" : "Compartido"}\nHorario: ${timing === "now" ? "Ahora" : `${scheduleDate} · ${scheduleTime}`}\nPasajeros: ${passengers}\nPago: ${paymentMethod === "card" ? "Tarjeta" : "Efectivo"}\nTarifa estimada: ${formatFareForMessage(fare.total)}`
        : `Hello Via La Fortuna, I would like to book a transfer.\n\nPickup: ${origin}\nDestination: ${destination}\n${rideType === "shared" ? `Passenger routes:\n${passengerDestinations.map((item, index) => `Passenger ${index + 1}: ${passengerOrigins[index]} → ${item}`).join("\n")}` : ""}\nType: ${rideType === "private" ? "Private" : "Shared"}\nTiming: ${timing === "now" ? "Now" : `${scheduleDate} · ${scheduleTime}`}\nPassengers: ${passengers}\nPayment: ${paymentMethod === "card" ? "Card" : "Cash"}\nEstimated fare: ${formatFareForMessage(fare.total)}`;

    window.open(
      `https://wa.me/50663135655?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    if (!tourName) {
      setConfirmed(true);
    }
  };

  const confirmTransferBooking = async () => {
    if (confirmed || bookingStatus === "saving") return;
    if (paymentMethod === "card" && !user) {
      setProfileOpen(true);
      setAuthError(
        language === "es"
          ? "Para pagar con tarjeta debes iniciar sesión o crear una cuenta."
          : "You must sign in or create an account to pay by card.",
      );
      return;
    }
    if (paymentMethod === "card") {
      setPaymentOpen(true);
      return;
    }
    setBookingStatus("saving");
    try {
      const result = await saveBooking({
        serviceType: "transfer",
        origin,
        destination,
        rideType,
        passengers,
        paymentMethod,
        timing,
        scheduleDate,
        scheduleTime,
        fareCrc: fare.total,
        fareUsd: exchangeRate ? fare.total / exchangeRate : null,
        distanceKm,
        durationMinutes,
        language,
        ...(user?.uid ? { userId: user.uid } : {}),
      });
      if (!result.ok) {
        setBookingStatus("error");
        return;
      }
      setConfirmed(true);
      setBookingStatus("saved");
    } catch {
      setBookingStatus("error");
    }
  };

  const confirmTourBooking = async (tour: TourCard) => {
    if (bookingStatus === "saving") return;
    if (isFirebaseAuthConfigured() && !user) {
      setProfileOpen(true);
      setAuthError(
        language === "es"
          ? "Inicia sesión para confirmar y guardar tu reserva."
          : "Sign in to confirm and save your booking.",
      );
      return;
    }
    setBookingStatus("saving");
    try {
      const result = await saveBooking({
        serviceType: "tour",
        tourName: tour.title,
        language,
        userId: user?.uid,
      });
      if (!result.ok) {
        setBookingStatus("error");
        openWhatsApp(tour.title);
        return;
      }
      setBookingStatus("saved");
      setSelectedTour(null);
    } catch {
      setBookingStatus("error");
      openWhatsApp(tour.title);
    }
  };

  const openTourDetail = (tour: TourCard) => {
    window.history.pushState({ tour: tour.title }, "", `#tour/${encodeURIComponent(tour.title)}`);
    setSelectedTour(tour);
  };

  const closeTourDetail = () => {
    if (window.location.hash.startsWith("#tour/")) window.history.back();
    else setSelectedTour(null);
  };

  const openFeatureDetail = (feature: FeatureKey) => {
    window.history.pushState({ feature }, "", `#feature/${feature}`);
    setFeatureTransition("enter");
    setSelectedFeature(feature);
  };

  const closeFeatureDetail = useCallback(() => {
    if (!selectedFeature) return;
    setFeatureTransition("exit");
    if (window.location.hash.startsWith("#feature/")) {
      window.setTimeout(() => window.history.back(), 260);
    } else {
      window.setTimeout(() => setSelectedFeature(null), 260);
    }
  }, [selectedFeature]);

  const continueFromFeature = (feature: FeatureKey) => {
    if (feature === "promotion") {
      openWhatsApp();
      return;
    }
    closeFeatureDetail();
    window.setTimeout(() => scrollToSection("route-preview"), 0);
  };

  const featureContent = selectedFeature ? getFeatureContent(selectedFeature, language) : null;
  const FeatureIcon = selectedFeature ? getFeatureIcon(selectedFeature) : Star;
  const locationLabel = (
    currentLocation ??
    (locationStatus === "locating"
      ? language === "es"
        ? "BUSCANDO UBICACIÓN..."
        : "SEARCHING FOR LOCATION..."
      : language === "es"
        ? "UBICACIÓN ACTUAL"
        : "CURRENT LOCATION")
  ).toLocaleUpperCase(language === "es" ? "es-CR" : "en-US");

  return (
    <main
      className="app-shell min-h-screen text-foreground selection:bg-accent selection:text-accent-foreground"
      style={
        {
          "--arenal-background": `url("${import.meta.env.BASE_URL}arenal-background-light.jpg")`,
        } as CSSProperties
      }
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_0%_0%,color-mix(in_oklab,var(--leaf)_10%,transparent)_0%,transparent_48%)]" />
      <div className="relative mx-auto min-h-screen w-full max-w-[430px] px-6 pb-32 pt-6 lg:max-w-6xl lg:px-10">
        <header className="top-header rise flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex min-w-[10.5rem] items-center gap-2 rounded-full bg-jungle px-3 py-2 text-primary-foreground shadow-[0_4px_0_rgba(9,35,26,0.45),0_8px_16px_rgba(9,35,26,0.2)] ring-1 ring-white/25">
              <span className="grid size-7 place-items-center rounded-full bg-leaf/30 font-display text-sm ring-1 ring-white/20">
                V
              </span>
              <span
                className="flex h-7 flex-col justify-center leading-none"
                aria-label="Via La Fortuna · Tours y Viajes"
              >
                <span className="font-display text-base">Via La Fortuna</span>
                <span className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.12em] text-white/75">
                  TOURS Y VIAJES
                </span>
              </span>
            </div>
            <div
              className="flex h-7 w-[8rem] max-w-[8rem] min-w-0 shrink-0 items-center gap-1.5 overflow-hidden leading-tight"
              aria-live="polite"
            >
              <span
                className="relative grid size-4 shrink-0 place-items-center text-leaf-ink"
                aria-label={
                  locationStatus === "locating"
                    ? language === "es"
                      ? "Actualizando ubicación en tiempo real"
                      : "Updating location in real time"
                    : language === "es"
                      ? "Ubicación actualizada"
                      : "Location updated"
                }
              >
                <MapPin className="size-3.5" aria-hidden="true" />
              </span>
              <p className="min-w-0 flex-1 truncate text-[9px] font-semibold tracking-[0.03em] text-foreground/70">
                {locationLabel}
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

        {mode === "transfers" && (
          <section
            className="reference-shortcuts rise mt-5"
            aria-label={language === "es" ? "Accesos rápidos" : "Quick actions"}
          >
            <div className="reference-location">
              <MapPin className="size-4" />
              <span>{origin || (language === "es" ? "Ubicación actual" : "Current location")}</span>
            </div>
            <div className="reference-shortcut-row">
              {[
                {
                  key: "food" as const,
                  label: language === "es" ? "Alimentos" : "Food",
                  icon: Utensils,
                  tone: "orange",
                },
                {
                  key: "ride" as const,
                  label: language === "es" ? "Viaje" : "Ride",
                  icon: Plane,
                  tone: "blue",
                },
                {
                  key: "send" as const,
                  label: language === "es" ? "Enviar artículos" : "Send items",
                  icon: Package,
                  tone: "green",
                },
                {
                  key: "motorbike" as const,
                  label: language === "es" ? "Moto" : "Motorbike",
                  icon: Bike,
                  tone: "amber",
                },
                {
                  key: "booking" as const,
                  label: language === "es" ? "Reserva" : "Booking",
                  icon: CalendarDays,
                  tone: "purple",
                },
              ].map(({ key, label, icon: Icon, tone }) => (
                <button
                  key={label}
                  type="button"
                  className={`reference-shortcut reference-shortcut-${tone}`}
                  onClick={() => openFeatureDetail(key)}
                >
                  <span className="reference-shortcut-icon">
                    <Icon className="size-6" />
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="reference-search"
              onClick={() => scrollToSection("route-preview")}
            >
              <Search className="size-7 shrink-0" />
              <span>{language === "es" ? "¿A dónde vas?" : "Where are you going?"}</span>
              <span className="reference-search-action">
                <CalendarDays className="size-4" />
                {timing === "now"
                  ? language === "es"
                    ? "Ahora"
                    : "Now"
                  : language === "es"
                    ? "Programado"
                    : "Scheduled"}
              </span>
            </button>
          </section>
        )}

        <div
          className={`lg:gap-16 ${mode === "transfers" ? "lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(390px,0.72fr)]" : "lg:block"}`}
        >
          <div>
            {mode === "transfers" && (
              <section className="fare-card experience-panel rise mt-3 overflow-hidden rounded-[28px] p-4 ring-1 ring-border [animation-delay:140ms]">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-panel-muted-foreground">
                    {t.estimate}
                  </p>
                  <ShieldCheck className="size-5 text-leaf" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="font-display text-[38px] leading-none">
                    {formatFareAmount(fare.total)}
                  </p>
                  <p className="text-xs text-panel-muted-foreground">
                    {language === "es" ? "CRC" : "USD"}
                  </p>
                </div>
                <p className="mt-1 text-sm font-semibold text-panel-muted-foreground">
                  {formatFareSecondary(fare.total)}
                </p>
                <p className="mt-1 text-[10px] text-panel-muted-foreground">
                  {exchangeRate
                    ? `${t.exchangeSource}: ₡${exchangeRate.toLocaleString("es-CR")} / USD`
                    : t.exchangeLoading}
                </p>
              </section>
            )}

            {mode === "transfers" && (
              <section
                id="route-preview"
                className="experience-panel mt-3 overflow-hidden rounded-[28px] p-4 ring-1 ring-border"
              >
                <MiniRouteMap
                  origin={origin}
                  destination={destination}
                  language={language}
                  distanceKm={distanceKm}
                  durationMinutes={durationMinutes}
                />
              </section>
            )}

            {mode === "transfers" && (
              <section
                className="promo-banner rise mt-4"
                aria-label={language === "es" ? "Promoción" : "Promotion"}
                role="button"
                tabIndex={0}
                onClick={() => openFeatureDetail("promotion")}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openFeatureDetail("promotion");
                  }
                }}
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em]">
                    {language === "es" ? "Promoción local" : "Local promotion"}
                  </p>
                  <h2 className="mt-1 font-display text-[22px] leading-tight">
                    {language === "es" ? "Pizza La Fortuna" : "Pizza La Fortuna"}
                  </h2>
                  <p className="mt-1 text-sm font-bold">
                    {language === "es" ? "2x1 · desde ₡9.990" : "2-for-1 · from ₡9,990"}
                  </p>
                  <p className="mt-1 text-[11px] opacity-80">
                    {language === "es"
                      ? "Consulta disponibilidad local"
                      : "Ask about local availability"}
                  </p>
                </div>
                <div className="promo-pizza" aria-hidden="true">
                  🍕
                </div>
              </section>
            )}

            {mode === "transfers" ? (
              <section className="control-relief rise mt-4 rounded-[30px] bg-surface p-4 [animation-delay:200ms]">
                <h2 className="mb-3 rounded-full bg-jungle px-5 py-3 text-center font-display text-xl text-primary-foreground shadow-[0_4px_0_color-mix(in_oklch,var(--color-jungle)_35%,transparent)]">
                  {language === "es" ? "Reservar Tours" : "Book Tours"}
                </h2>
                <div className="address-fields rounded-[24px] bg-background p-3.5 text-foreground ring-1 ring-border">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/10"
                      aria-hidden="true"
                    >
                      <Circle className="size-3.5 text-muted-foreground" />
                    </span>
                    <label className="min-w-0 flex-1">
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {t.origin}
                      </span>
                      <input
                        ref={originInputRef}
                        aria-label={t.origin}
                        value={origin}
                        onChange={(event) => {
                          setOrigin(event.target.value);
                          setRouteStatus("updating");
                        }}
                        list="place-suggestions"
                        className="address-input mt-1.5 min-h-12 w-full min-w-0 rounded-full bg-surface px-4 py-2.5 text-base font-semibold text-foreground outline-none"
                      />
                    </label>
                  </div>
                  <div className="my-3.5 border-t border-border" aria-hidden="true" />
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/10"
                      aria-hidden="true"
                    >
                      <MapPin className="size-4 text-muted-foreground" />
                    </span>
                    <label className="min-w-0 flex-1">
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {t.destination}
                      </span>
                      <input
                        ref={destinationInputRef}
                        aria-label={t.destination}
                        value={destination}
                        onChange={(event) => {
                          setDestination(event.target.value);
                          setRouteStatus("updating");
                        }}
                        list="place-suggestions"
                        className="address-input mt-1.5 min-h-12 w-full min-w-0 rounded-full bg-surface px-4 py-2.5 text-base font-semibold text-foreground outline-none"
                      />
                    </label>
                  </div>
                </div>
                <datalist id="place-suggestions">
                  {localPlaceSuggestions.map((place) => (
                    <option key={place} value={place} />
                  ))}
                </datalist>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-full bg-background p-1 ring-1 ring-border">
                  {(["private", "shared"] as const).map((value) => (
                    <button
                      key={value}
                      onClick={() => setRideType(value)}
                      className={`rounded-full py-2.5 text-[13px] font-bold ${rideType === value ? "bg-leaf text-leaf-foreground shadow-sm" : "bg-leaf/15 text-leaf-ink"}`}
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
                      {timing === "now" ? t.now : `${scheduleDate} · ${scheduleTime}`}
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
                        min={scheduleDate}
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
                      className="mt-2 w-full rounded-full bg-leaf py-2 text-xs font-bold text-leaf-foreground transition-transform active:scale-[0.98]"
                    >
                      {t.agenda}
                    </button>
                  </div>
                )}
                {scheduledTrips.length > 0 && (
                  <div className="mt-3 rounded-[24px] bg-background p-3 ring-1 ring-border">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        {t.agenda}
                      </p>
                      <span className="rounded-full bg-leaf/15 px-2 py-1 text-[10px] font-bold text-leaf">
                        {scheduledTrips.length}
                      </span>
                    </div>
                    <div className="mt-2 space-y-2">
                      {scheduledTrips.map((trip, index) => (
                        <div
                          key={`${trip}-${index}`}
                          className="flex items-center gap-2 rounded-2xl bg-surface px-3 py-2 text-xs font-semibold"
                        >
                          <CalendarDays className="size-3.5 shrink-0 text-leaf" />
                          <span className="min-w-0 flex-1 truncate">{trip}</span>
                          <button
                            type="button"
                            aria-label={`${t.remove}: ${trip}`}
                            title={t.remove}
                            onClick={() =>
                              setScheduledTrips((current) =>
                                current.filter((_, itemIndex) => itemIndex !== index),
                              )
                            }
                            className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
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
                    {(["cash", "card"] as const).map((method) => (
                      <button
                        key={method}
                        disabled={confirmed}
                        onClick={() => {
                          setPaymentMethod(method);
                          if (method === "card") {
                            if (!user) {
                              setProfileOpen(true);
                              setAuthError(
                                language === "es"
                                  ? "Para pagar con tarjeta debes iniciar sesión o crear una cuenta."
                                  : "You must sign in or create an account to pay by card.",
                              );
                            } else {
                              setPaymentOpen(true);
                            }
                          }
                        }}
                        className={`rounded-xl py-2.5 text-sm font-bold transition-colors ${paymentMethod === method ? "bg-leaf text-leaf-foreground" : "bg-leaf/15 text-leaf-ink"} ${confirmed ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        {method === "card" ? t.card : t.cash}
                      </button>
                    ))}
                  </div>
                  {confirmed && (
                    <p className="px-3 pb-2 pt-1 text-[10px] font-semibold text-muted-foreground">
                      {t.paymentLocked}
                    </p>
                  )}
                </div>
                {confirmed && (
                  <div
                    className="mt-3 flex items-start gap-2 rounded-2xl bg-leaf/15 p-3 text-xs text-primary ring-1 ring-leaf/25"
                    role="status"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-leaf" />
                    <div>
                      <p className="font-bold">{t.confirmedTitle}</p>
                      <p className="mt-0.5 text-muted-foreground">{t.confirmedBody}</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => void confirmTransferBooking()}
                  className="confirm-booking-button mt-4 w-full rounded-full bg-leaf py-3.5 text-sm font-bold text-leaf-foreground transition-transform active:scale-[0.98]"
                >
                  {bookingStatus === "saving"
                    ? language === "es"
                      ? "Guardando reserva…"
                      : "Saving booking…"
                    : confirmed
                      ? language === "es"
                        ? "Solicitud confirmada"
                        : "Request confirmed"
                      : language === "es"
                        ? "Confirmar reserva"
                        : "Confirm booking"}
                </button>
                {bookingStatus === "saved" && (
                  <p className="mt-2 text-center text-xs text-leaf">
                    {language === "es"
                      ? "Reserva guardada y enviada al panel del conductor."
                      : "Booking saved and sent to the driver panel."}
                  </p>
                )}
                {bookingStatus === "error" && (
                  <div className="mt-2 space-y-2">
                    <p className="text-center text-xs text-amber-200">
                      {language === "es"
                        ? "No se pudo guardar ahora. Puedes enviarla por WhatsApp como respaldo."
                        : "It could not be saved now. You can send it by WhatsApp as a fallback."}
                    </p>
                    <button
                      onClick={() => openWhatsApp()}
                      className="w-full rounded-2xl border border-white/20 bg-white/10 py-2.5 text-xs font-bold text-white"
                    >
                      {language === "es" ? "Enviar por WhatsApp" : "Send by WhatsApp"}
                    </button>
                  </div>
                )}
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
                <button
                  onClick={() => scrollToSection("tours")}
                  className="mt-5 w-full rounded-2xl bg-jungle py-4 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98]"
                >
                  {t.explore}
                </button>
              </section>
            )}
          </div>

          <div>
            <section
              id="tours"
              className="experience-panel mt-10 scroll-mt-6 rounded-[30px] p-4 ring-1 ring-border"
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
                    onClick={() => openTourDetail(tour)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openTourDetail(tour);
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
              className="experience-panel rise mt-5 rounded-[30px] p-4 ring-1 ring-border [animation-delay:320ms]"
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
        <main className="fixed inset-0 z-40 overflow-y-auto bg-background px-4 pb-10 pt-4 sm:px-8 sm:pt-8">
          <section
            className="mx-auto min-h-[calc(100vh-2rem)] w-full max-w-2xl rounded-[28px] bg-surface p-4 text-foreground shadow-xl ring-1 ring-border sm:min-h-[calc(100vh-4rem)] sm:p-7"
            aria-labelledby="tour-detail-title"
          >
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <button
                type="button"
                aria-label={language === "es" ? "Volver a la lista" : "Back to list"}
                onClick={closeTourDetail}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-background text-muted-foreground ring-1 ring-border transition-transform active:scale-95"
              >
                <ArrowLeft className="size-4" />
              </button>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-leaf-ink">
                  {language === "es" ? "Detalle de actividad" : "Activity details"}
                </p>
                <h2 id="tour-detail-title" className="mt-1 font-display text-2xl leading-tight">
                  {selectedTour.title}
                </h2>
              </div>
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
              onClick={() => void confirmTourBooking(selectedTour)}
              className="mt-4 w-full rounded-2xl bg-leaf py-3.5 text-sm font-bold text-leaf-foreground shadow-[0_3px_0_color-mix(in_oklch,var(--color-jungle)_35%,transparent)]"
            >
              {bookingStatus === "saving"
                ? language === "es"
                  ? "Guardando…"
                  : "Saving…"
                : t.reserveTour}
            </button>
          </section>
        </main>
      )}

      {paymentOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center"
          role="presentation"
          onClick={() => setPaymentOpen(false)}
        >
          <section
            className="w-full max-w-md rounded-[28px] bg-surface p-5 text-foreground shadow-2xl ring-1 ring-border"
            role="dialog"
            aria-modal="true"
            aria-labelledby="card-payment-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-leaf-ink">
                  {language === "es" ? "Pago protegido" : "Protected payment"}
                </p>
                <h2 id="card-payment-title" className="mt-1 font-display text-2xl">
                  {language === "es" ? "Pagar con tarjeta" : "Pay by card"}
                </h2>
              </div>
              <button
                type="button"
                aria-label={language === "es" ? "Cerrar pago" : "Close payment"}
                onClick={() => setPaymentOpen(false)}
                className="grid size-9 place-items-center rounded-full bg-background text-muted-foreground ring-1 ring-border"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 rounded-2xl bg-background p-4 text-sm leading-relaxed ring-1 ring-border">
              {language === "es"
                ? "Serás dirigido a Stripe Checkout o Payment Element para completar el pago. Via La Fortuna no almacena números de tarjeta ni códigos de seguridad."
                : "You will continue to Stripe Checkout or Payment Element to complete payment. Via La Fortuna never stores card numbers or security codes."}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <ShieldCheck className="size-4 text-leaf" />
              {language === "es" ? "Procesamiento seguro y cifrado" : "Secure encrypted processing"}
            </div>
            <button
              type="button"
              disabled
              className="mt-5 w-full rounded-2xl bg-leaf py-3.5 text-sm font-bold text-leaf-foreground disabled:cursor-not-allowed disabled:opacity-55"
            >
              {language === "es"
                ? "Configurar Stripe para continuar"
                : "Configure Stripe to continue"}
            </button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              {language === "es"
                ? "El pago real se habilita al conectar Stripe Checkout en el backend."
                : "Live payment is enabled after connecting Stripe Checkout in the backend."}
            </p>
          </section>
        </div>
      )}

      {profileOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center"
          role="presentation"
          onClick={() => setProfileOpen(false)}
        >
          <section
            className="w-full max-w-md rounded-[28px] bg-surface p-5 text-foreground shadow-2xl ring-1 ring-border"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-leaf-ink">
                  {language === "es" ? "Cuenta segura" : "Secure account"}
                </p>
                <h2 id="profile-title" className="mt-1 font-display text-2xl">
                  {language === "es" ? "Tu perfil" : "Your profile"}
                </h2>
              </div>
              <button
                type="button"
                aria-label={language === "es" ? "Cerrar perfil" : "Close profile"}
                onClick={() => setProfileOpen(false)}
                className="grid size-9 place-items-center rounded-full bg-background text-muted-foreground ring-1 ring-border"
              >
                <X className="size-4" />
              </button>
            </div>
            {!isFirebaseAuthConfigured() ? (
              <p className="mt-5 rounded-2xl bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-500/20">
                {language === "es"
                  ? "La cuenta estará disponible cuando se configuren las variables VITE_FIREBASE_* del despliegue."
                  : "Accounts become available after the deployment VITE_FIREBASE_* variables are configured."}
              </p>
            ) : user ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-background p-4 ring-1 ring-border">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    {language === "es" ? "Sesión activa" : "Signed in"}
                  </p>
                  <p className="mt-1 font-semibold">{user.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {language === "es"
                      ? "Cliente · tus reservas pueden asociarse a esta cuenta."
                      : "Client · your bookings can be associated with this account."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void signOutUser()}
                  className="w-full rounded-2xl bg-jungle py-3 font-bold text-white"
                >
                  {language === "es" ? "Cerrar sesión" : "Sign out"}
                </button>
              </div>
            ) : (
              <form className="mt-5 space-y-4" onSubmit={submitAuth}>
                <p className="text-sm text-muted-foreground">
                  {language === "es"
                    ? "Crea una cuenta para identificar tus reservas. Los clientes no tienen acceso al panel del conductor."
                    : "Create an account to identify your bookings. Clients cannot access the driver panel."}
                </p>
                <label className="block text-sm font-semibold">
                  {language === "es" ? "Correo" : "Email"}
                  <input
                    required
                    type="email"
                    value={authEmail}
                    onChange={(event) => setAuthEmail(event.target.value)}
                    className="mt-1 w-full rounded-xl bg-background px-3 py-3 ring-1 ring-border outline-none focus:ring-2 focus:ring-leaf"
                  />
                </label>
                <label className="block text-sm font-semibold">
                  {language === "es" ? "Contraseña" : "Password"}
                  <input
                    required
                    minLength={6}
                    type="password"
                    value={authPassword}
                    onChange={(event) => setAuthPassword(event.target.value)}
                    className="mt-1 w-full rounded-xl bg-background px-3 py-3 ring-1 ring-border outline-none focus:ring-2 focus:ring-leaf"
                  />
                </label>
                {authError && (
                  <p
                    role="alert"
                    className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
                  >
                    {authError}
                  </p>
                )}
                <button
                  disabled={authSubmitting}
                  className="w-full rounded-2xl bg-leaf py-3 font-bold text-leaf-foreground disabled:opacity-60"
                >
                  {authSubmitting
                    ? language === "es"
                      ? "Procesando…"
                      : "Processing…"
                    : authMode === "login"
                      ? language === "es"
                        ? "Iniciar sesión"
                        : "Sign in"
                      : language === "es"
                        ? "Crear cuenta"
                        : "Create account"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "register" : "login");
                    setAuthError("");
                  }}
                  className="w-full text-xs font-bold text-leaf-ink"
                >
                  {authMode === "login"
                    ? language === "es"
                      ? "¿No tienes cuenta? Regístrate"
                      : "No account? Register"
                    : language === "es"
                      ? "Ya tengo cuenta · Iniciar sesión"
                      : "I already have an account · Sign in"}
                </button>
              </form>
            )}
          </section>
        </div>
      )}

      {selectedFeature && featureContent && (
        <main
          className={`push-screen fixed inset-0 z-[55] overflow-y-auto bg-background px-4 pb-10 pt-4 text-foreground sm:px-8 sm:pt-8 ${featureTransition === "exit" ? "is-exiting" : ""}`}
        >
          <section className="mx-auto min-h-[calc(100vh-2rem)] w-full max-w-2xl rounded-[30px] bg-surface p-5 shadow-xl ring-1 ring-border sm:min-h-[calc(100vh-4rem)] sm:p-8">
            <header className="flex items-center gap-3 border-b border-border pb-5">
              <button
                type="button"
                onClick={closeFeatureDetail}
                aria-label={language === "es" ? "Volver" : "Go back"}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-background text-muted-foreground ring-1 ring-border transition-transform active:scale-95"
              >
                <ArrowLeft className="size-4" />
              </button>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-leaf-ink">
                  {featureContent.eyebrow}
                </p>
                <h1 className="font-display text-2xl font-bold">{featureContent.title}</h1>
              </div>
            </header>

            <div className="mt-8 grid place-items-center rounded-[26px] bg-gradient-to-br from-leaf/20 via-background to-primary/10 py-12 ring-1 ring-border">
              <span className="grid size-24 place-items-center rounded-full bg-leaf text-leaf-foreground shadow-[0_7px_0_color-mix(in_oklch,var(--color-jungle)_35%,transparent)]">
                <FeatureIcon className="size-11" />
              </span>
            </div>

            <p className="mt-7 text-base leading-relaxed text-muted-foreground">
              {featureContent.description}
            </p>

            {selectedFeature === "promotion" && (
              <div className="mt-6 rounded-2xl bg-[#ff9f1c] p-5 text-[#22170a] shadow-lg">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]">
                  {language === "es" ? "Promoción local" : "Local promotion"}
                </p>
                <p className="mt-1 font-display text-3xl font-bold">Pizza La Fortuna</p>
                <p className="mt-2 font-bold">
                  {language === "es" ? "2x1 · desde ₡9.990" : "2-for-1 · from ₡9,990"}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => continueFromFeature(selectedFeature)}
              className="mt-8 w-full rounded-2xl bg-jungle py-4 text-sm font-bold text-primary-foreground shadow-[0_4px_0_color-mix(in_oklch,var(--color-jungle)_35%,transparent)] transition-transform active:scale-[0.98]"
            >
              {featureContent.action}
            </button>
          </section>
        </main>
      )}

      <nav
        className="pointer-events-none fixed bottom-0 left-1/2 z-20 w-full max-w-[400px] -translate-x-1/2 px-8 pb-4 lg:max-w-lg"
        aria-label={language === "es" ? "Navegación principal" : "Main navigation"}
      >
        <div className="bottom-nav-shell pointer-events-auto flex scale-[0.94] items-center justify-between rounded-[26px] bg-jungle/95 px-6 py-2.5 text-primary-foreground shadow-2xl ring-1 ring-primary-foreground/10 backdrop-blur-md">
          {[
            {
              id: "home" as const,
              label: t.home,
              icon: Home,
              action: () => {
                setActiveNav("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              },
            },
            {
              id: "routes" as const,
              label: t.routes,
              icon: RouteIcon,
              action: () => {
                setActiveNav("routes");
                openFeatureDetail("ride");
              },
            },
            {
              id: "chat" as const,
              label: t.chat,
              icon: MessageCircle,
              action: () => {
                setActiveNav("chat");
                openWhatsApp();
              },
            },
            {
              id: "profile" as const,
              label: t.profile,
              icon: UserRound,
              action: () => {
                setActiveNav("profile");
                setProfileOpen(true);
              },
            },
          ].map(({ id, label, icon: Icon, action }) => (
            <button
              key={label}
              onClick={action}
              aria-current={activeNav === id ? "page" : undefined}
              className={`bottom-nav-item flex min-w-12 flex-col items-center gap-1 text-[10px] font-bold ${activeNav === id ? "is-active text-primary-foreground" : "text-panel-muted-foreground"}`}
            >
              <span className="bottom-nav-icon grid size-8 place-items-center rounded-xl">
                <Icon className="size-4" />
              </span>
              <span className="bottom-nav-label">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
