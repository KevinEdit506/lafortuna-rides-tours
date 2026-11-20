import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  CarFront,
  Fuel,
  Gauge,
  Plus,
  Route as RouteIcon,
  ShieldCheck,
  Smartphone,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { User } from "firebase/auth";
import { enableDriverPush } from "../lib/firebase-messaging";
import { subscribeToBookings, type DriverBooking } from "../lib/firebase-bookings";
import { createPaymentRequest } from "../lib/payment-requests";

type Trip = {
  id: number;
  route: string;
  km: number;
  revenue: number;
  net: number;
  status: string;
  date: string;
  driver: string;
  rideType: "private" | "shared";
  paymentMethod: "cash" | "card";
};
type DriverNotification = {
  id: number;
  driver: string;
  route: string;
  createdAt: string;
  read: boolean;
};
const fuelRate = 764;
const fuelEfficiency = 11;
const wearRate = 40;
const fareMultiplier = 2.8;

export function DriverDashboardContent({ user }: { user: User }) {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [distance, setDistance] = useState(8);
  const [returnEmpty, setReturnEmpty] = useState(false);
  const [roughRoad, setRoughRoad] = useState(false);
  const [revenue, setRevenue] = useState(4500);
  const [driver, setDriver] = useState("Kevin");
  const [rideType, setRideType] = useState<"private" | "shared">("private");
  const [tripDate, setTripDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [filterDate, setFilterDate] = useState("");
  const [filterDriver, setFilterDriver] = useState("");
  const [notifications, setNotifications] = useState<DriverNotification[]>([]);
  const [pushStatus, setPushStatus] = useState<"idle" | "enabled" | "unavailable">("idle");
  const [cloudBookings, setCloudBookings] = useState<DriverBooking[]>([]);
  const [cloudStatus, setCloudStatus] = useState<"connecting" | "connected" | "unavailable">(
    "connecting",
  );
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [paymentBookingId, setPaymentBookingId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentRequestStatus, setPaymentRequestStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const historyHydrated = useRef(false);
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: 1,
      route: "Centro → Arenal",
      km: 13.9,
      revenue: 6390,
      net: 4869,
      status: "Completado",
      date: "2026-10-26",
      driver: "Kevin",
      rideType: "private",
      paymentMethod: "cash",
    },
    {
      id: 2,
      route: "Arenal → La Fortuna",
      km: 8.4,
      revenue: 3860,
      net: 3137,
      status: "Completado",
      date: "2026-10-25",
      driver: "María",
      rideType: "shared",
      paymentMethod: "cash",
    },
    {
      id: 3,
      route: "La Fortuna → Místico",
      km: 11.2,
      revenue: 5120,
      net: 4103,
      status: "Pendiente",
      date: "2026-10-27",
      driver: "Kevin",
      rideType: "private",
      paymentMethod: "cash",
    },
  ]);
  const t =
    language === "es"
      ? {
          eyebrow: "Panel del conductor",
          title: "Operación bajo control.",
          subtitle: "Ingresos, costos y rentabilidad de TuraVía en una sola vista.",
          today: "Resumen de la semana",
          revenue: "Ingresos",
          fuel: "Combustible",
          wear: "Desgaste",
          net: "Ganancia neta",
          calculator: "Calculadora de viaje",
          distance: "Distancia de ida",
          returnEmpty: "Regreso vacío",
          roughRoad: "Camino malo",
          gross: "Ingreso bruto",
          fuelCost: "Costo combustible",
          wearCost: "Costo desgaste",
          netProfit: "Ganancia neta",
          save: "Agregar viaje",
          trips: "Historial de viajes",
          km: "km operativos",
          delete: "Eliminar",
          driver: "Conductor",
          date: "Fecha",
          filterDate: "Filtrar por fecha",
          filterDriver: "Filtrar por conductor",
          allDrivers: "Todos los conductores",
          clearFilters: "Limpiar filtros",
          private: "Privado",
          shared: "Compartido",
          reservationType: "Tipo de reserva",
          dailyEarnings: "Ganancias totales de la semana",
          dailyGross: "Ingreso bruto de la semana",
          dailyNet: "Ganancia neta de la semana",
          statistics: "Rendimiento estadístico",
          fuelPerformance: "Rendimiento de combustible por conductor",
          fuelPerformanceIntro: "Kilómetros operativos y costo estimado de combustible.",
          earningsByDriver: "Ganancias por conductor",
          earningsByDriverIntro: "Ganancia neta acumulada según el historial registrado.",
          operatingKm: "Km operativos",
          empty: "Sí",
          no: "No",
          access: "Panel interno · no compartir con clientes",
          roleLabel: "Conductor",
          notifications: "Notificaciones a conductores",
          newSharedTrip: "Nuevo viaje compartido asignado",
          noNotifications: "No hay notificaciones nuevas.",
          enableNotifications: "Activar avisos del navegador",
          pushEnabled: "Avisos push activos",
          pushUnavailable: "Configura FCM para activar avisos push",
        }
      : {
          eyebrow: "Driver control",
          title: "Operations under control.",
          subtitle: "Revenue, costs, and profitability for TuraVía in one view.",
          today: "Weekly summary",
          revenue: "Revenue",
          fuel: "Fuel",
          wear: "Wear",
          net: "Net profit",
          calculator: "Trip calculator",
          distance: "One-way distance",
          returnEmpty: "Empty return",
          roughRoad: "Rough road",
          gross: "Gross revenue",
          fuelCost: "Fuel cost",
          wearCost: "Wear cost",
          netProfit: "Net profit",
          save: "Add trip",
          trips: "Trip history",
          km: "operating km",
          delete: "Delete",
          driver: "Driver",
          date: "Date",
          filterDate: "Filter by date",
          filterDriver: "Filter by driver",
          allDrivers: "All drivers",
          clearFilters: "Clear filters",
          private: "Private",
          shared: "Shared",
          reservationType: "Reservation type",
          dailyEarnings: "Total weekly earnings",
          dailyGross: "Weekly gross revenue",
          dailyNet: "Weekly net profit",
          statistics: "Performance statistics",
          fuelPerformance: "Fuel performance by driver",
          fuelPerformanceIntro: "Operating kilometers and estimated fuel cost.",
          earningsByDriver: "Earnings by driver",
          earningsByDriverIntro: "Accumulated net profit from recorded trips.",
          operatingKm: "Operating km",
          empty: "Yes",
          no: "No",
          access: "Internal panel · do not share with customers",
          roleLabel: "Driver",
          notifications: "Driver notifications",
          newSharedTrip: "New shared trip assigned",
          noNotifications: "No new notifications.",
          enableNotifications: "Enable browser alerts",
          pushEnabled: "Push alerts enabled",
          pushUnavailable: "Configure FCM to enable push alerts",
        };
  const estimate = useMemo(() => {
    const operatingKm = distance * (returnEmpty ? 2 : 1);
    const roadFactor = roughRoad ? 1.2 : 1.5;
    const fuelCost = Math.round((operatingKm / fuelEfficiency) * fuelRate);
    const wearCost = Math.round(operatingKm * wearRate);
    const minimumFare = Math.round(
      ((operatingKm / 11) * 764 + operatingKm * 40) * fareMultiplier * roadFactor,
    );
    const gross = Math.max(revenue, minimumFare);
    return { operatingKm, fuelCost, wearCost, gross, net: gross - fuelCost - wearCost };
  }, [distance, returnEmpty, roughRoad, revenue]);
  useEffect(() => {
    const stored = window.localStorage.getItem("via-la-fortuna-driver-trip-history");
    if (stored) {
      try {
        setTrips(
          (JSON.parse(stored) as Trip[]).map((trip) => ({
            ...trip,
            date: trip.date ?? new Date().toISOString().slice(0, 10),
            driver: trip.driver ?? "Sin asignar",
            rideType: trip.rideType ?? "private",
            paymentMethod: trip.paymentMethod ?? "cash",
          })),
        );
      } catch {
        window.localStorage.removeItem("via-la-fortuna-driver-trip-history");
      }
    }
    historyHydrated.current = true;
  }, []);
  useEffect(() => {
    if (!historyHydrated.current) return;
    window.localStorage.setItem("via-la-fortuna-driver-trip-history", JSON.stringify(trips));
  }, [trips]);
  useEffect(() => {
    const stored = window.localStorage.getItem("via-la-fortuna-driver-notifications");
    if (!stored) return;
    try {
      setNotifications(JSON.parse(stored) as DriverNotification[]);
    } catch {
      window.localStorage.removeItem("via-la-fortuna-driver-notifications");
    }
  }, []);
  useEffect(() => {
    window.localStorage.setItem(
      "via-la-fortuna-driver-notifications",
      JSON.stringify(notifications),
    );
  }, [notifications]);
  useEffect(() => {
    try {
      const unsubscribe = subscribeToBookings((bookings) => {
        setCloudBookings(bookings);
        setCloudStatus("connected");
      });
      if (!unsubscribe) setCloudStatus("unavailable");
      return () => unsubscribe?.();
    } catch {
      setCloudStatus("unavailable");
      return undefined;
    }
  }, []);
  useEffect(() => {
    const handleBack = () => setSelectedTrip(null);
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);
  const cloudTrips: Trip[] = cloudBookings.map((booking, index) => ({
    id: Number.parseInt(booking.id.slice(0, 10), 16) || -(index + 1),
    route:
      booking.serviceType === "tour"
        ? `Tour · ${booking.tourName ?? "Sin nombre"}`
        : `${booking.origin ?? "Origen"} → ${booking.destination ?? "Destino"}`,
    km: booking.distanceKm ?? 0,
    revenue: booking.fareCrc ?? 0,
    net: booking.fareCrc ?? 0,
    status: booking.status ?? "Pendiente",
    date: booking.createdAt
      ? new Date(booking.createdAt.seconds * 1000).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    driver: "Sin asignar",
    rideType: booking.rideType ?? "private",
    paymentMethod: booking.paymentMethod ?? "cash",
  }));
  const allTrips = [...cloudTrips, ...trips];
  const driverOptions = Array.from(
    new Set(allTrips.map((trip) => trip.driver || "Sin asignar")),
  ).sort();
  const filteredTrips = allTrips.filter((trip) => {
    const matchesDate = !filterDate || trip.date === filterDate;
    const matchesDriver = !filterDriver || trip.driver === filterDriver;
    return matchesDate && matchesDriver;
  });
  const anchorDate = new Date(`${tripDate}T12:00:00`);
  const weekStart = new Date(anchorDate);
  const day = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekStartKey = weekStart.toISOString().slice(0, 10);
  const weekEndKey = weekEnd.toISOString().slice(0, 10);
  const weeklyTrips = allTrips.filter(
    (trip) => trip.date >= weekStartKey && trip.date <= weekEndKey,
  );
  const weeklyGross = weeklyTrips.reduce((sum, trip) => sum + trip.revenue, 0);
  const weeklyNet = weeklyTrips.reduce((sum, trip) => sum + trip.net, 0);
  const driverStats = Array.from(
    allTrips
      .reduce((map, trip) => {
        const name = trip.driver || "Sin asignar";
        const current = map.get(name) ?? { driver: name, km: 0, fuelCost: 0, gross: 0, net: 0 };
        current.km += trip.km;
        current.fuelCost += Math.round((trip.km / fuelEfficiency) * fuelRate);
        current.gross += trip.revenue;
        current.net += trip.net;
        map.set(name, current);
        return map;
      }, new Map<string, { driver: string; km: number; fuelCost: number; gross: number; net: number }>())
      .values(),
  ).sort((a, b) => b.net - a.net);
  const maxDriverKm = Math.max(...driverStats.map((item) => item.km), 1);
  const maxDriverNet = Math.max(...driverStats.map((item) => item.net), 1);
  const totals = allTrips.reduce(
    (acc, trip) => ({ revenue: acc.revenue + trip.revenue, net: acc.net + trip.net }),
    { revenue: 0, net: 0 },
  );
  const addTrip = () => {
    const assignedDriver = driver.trim() || "Sin asignar";
    const route = "Nueva ruta · hoy";
    const newTrip: Trip = {
      id: Date.now(),
      route,
      km: estimate.operatingKm,
      revenue: estimate.gross,
      net: estimate.net,
      status: "Pendiente",
      date: tripDate,
      driver: assignedDriver,
      rideType,
      paymentMethod: "cash",
    };
    setTrips((current) => [newTrip, ...current]);
    if (rideType === "shared") {
      const notification: DriverNotification = {
        id: Date.now(),
        driver: assignedDriver,
        route,
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications((current) => [notification, ...current].slice(0, 30));
      if (typeof window !== "undefined" && "Notification" in window) {
        const show = () =>
          new Notification(t.newSharedTrip, {
            body: `${assignedDriver} · ${route}`,
            tag: `shared-trip-${notification.id}`,
          });
        if (window.Notification.permission === "granted") show();
        else if (window.Notification.permission === "default") {
          void window.Notification.requestPermission().then((permission) => {
            if (permission === "granted") show();
          });
        }
      }
    }
  };
  const openTripDetail = (trip: Trip) => {
    window.history.pushState({ tripId: trip.id }, "", `#trip/${trip.id}`);
    setSelectedTrip(trip);
  };
  const closeTripDetail = () => {
    if (window.location.hash.startsWith("#trip/")) window.history.back();
    else setSelectedTrip(null);
  };
  const kpis: Array<[string, string, LucideIcon]> = [
    [t.revenue, `₡${totals.revenue.toLocaleString("es-CR")}`, Wallet],
    [t.fuel, "₡3,420", Fuel],
    [t.wear, "₡1,980", Gauge],
    [t.net, `₡${totals.net.toLocaleString("es-CR")}`, ArrowUpRight],
  ];
  if (selectedTrip) {
    const detailRows = [
      [
        language === "es" ? "Modalidad" : "Ride type",
        selectedTrip.rideType === "shared" ? t.shared : t.private,
      ],
      [language === "es" ? "Conductor" : "Driver", selectedTrip.driver],
      [language === "es" ? "Fecha" : "Date", selectedTrip.date],
      [language === "es" ? "Distancia" : "Distance", `${selectedTrip.km.toFixed(1)} ${t.km}`],
      [t.gross, `₡${selectedTrip.revenue.toLocaleString("es-CR")}`],
      [t.net, `₡${selectedTrip.net.toLocaleString("es-CR")}`],
    ];
    return (
      <main className="min-h-screen bg-background px-4 pb-12 text-foreground sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <header className="flex items-center gap-3 py-5">
            <button
              type="button"
              onClick={closeTripDetail}
              className="grid size-11 place-items-center rounded-full bg-surface text-foreground shadow-md ring-1 ring-border transition-transform active:scale-95"
              aria-label={language === "es" ? "Volver a la lista" : "Back to list"}
            >
              <ArrowLeft className="size-5" />
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-leaf-ink">
                {language === "es" ? "Detalle de reserva" : "Booking details"}
              </p>
              <h1 className="font-display text-2xl font-bold">
                {language === "es" ? "Información del viaje" : "Trip information"}
              </h1>
            </div>
          </header>
          <section className="overflow-hidden rounded-[30px] bg-surface shadow-xl shadow-primary/10 ring-1 ring-border">
            <div className="dark-green-panel p-6 text-white sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-leaf">
                    {selectedTrip.status}
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold leading-tight">
                    {selectedTrip.route}
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-400/20 px-3 py-2 text-xs font-bold text-emerald-100">
                  {selectedTrip.paymentMethod === "cash"
                    ? language === "es"
                      ? "Efectivo"
                      : "Cash"
                    : language === "es"
                      ? "Tarjeta"
                      : "Card"}
                </span>
              </div>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-7">
              {detailRows.map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-background p-4 ring-1 ring-border">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-bold">{value}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border px-5 py-5 sm:px-7">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {selectedTrip.paymentMethod === "cash"
                  ? language === "es"
                    ? "El cliente indicó pago en efectivo. Coordina el cobro al finalizar el servicio."
                    : "The customer selected cash payment. Coordinate collection when the service ends."
                  : language === "es"
                    ? "El cliente indicó pago con tarjeta. Verifica el estado del pago antes de iniciar."
                    : "The customer selected card payment. Verify payment status before starting."}
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-background px-4 pb-12 text-foreground sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4 py-5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <CarFront className="size-5" />
            </span>
            <div>
              <p className="font-display text-xl font-bold">TuraVía</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {t.roleLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              title={t.notifications}
              onClick={() =>
                setNotifications((current) => current.map((item) => ({ ...item, read: true })))
              }
              className="relative rounded-full bg-surface p-2.5 ring-1 ring-border"
            >
              <Bell className="size-4 text-leaf-ink" />
              {notifications.some((item) => !item.read) && (
                <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-leaf text-[9px] font-bold text-leaf-foreground">
                  {notifications.filter((item) => !item.read).length}
                </span>
              )}
            </button>
            <button
              className="rounded-full bg-surface px-3 py-2 text-xs font-bold ring-1 ring-border"
              onClick={() => setLanguage(language === "es" ? "en" : "es")}
            >
              {language === "es" ? "EN" : "ES"}
            </button>
            <span className="hidden rounded-full bg-leaf/15 px-3 py-2 text-xs font-semibold text-leaf-ink sm:inline-flex">
              <ShieldCheck className="mr-1 size-3.5" /> {t.access}
            </span>
          </div>
        </header>
        <section className="mb-5 rounded-[26px] bg-surface p-4 shadow-lg shadow-primary/10 ring-1 ring-border">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-leaf-ink" />
              <h2 className="text-sm font-bold">{t.notifications}</h2>
              <span className="rounded-full bg-leaf/15 px-2 py-1 text-[10px] font-bold text-leaf-ink">
                {notifications.length}
              </span>
            </div>
            {pushStatus === "enabled" ? (
              <span className="rounded-full bg-leaf/15 px-3 py-2 text-[10px] font-bold text-leaf-ink ring-1 ring-leaf/25">
                {t.pushEnabled}
              </span>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  const result = await enableDriverPush(driver.trim() || "Sin asignar");
                  setPushStatus(result.enabled ? "enabled" : "unavailable");
                }}
                className="rounded-full bg-leaf/15 px-3 py-2 text-[10px] font-bold text-leaf-ink ring-1 ring-leaf/25"
              >
                {pushStatus === "unavailable" ? t.pushUnavailable : t.enableNotifications}
              </button>
            )}
          </div>
          <div className="mt-3 space-y-2">
            {notifications.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t.noNotifications}</p>
            ) : (
              notifications.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl p-3 text-xs ring-1 ${item.read ? "bg-background ring-border" : "bg-leaf/15 ring-leaf/30"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{t.newSharedTrip}</p>
                    <span className="text-[10px] text-muted-foreground">{item.driver}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{item.route}</p>
                </div>
              ))
            )}
          </div>
        </section>
        <section className="dark-green-panel rounded-[30px] p-6 text-white shadow-xl ring-1 ring-white/15 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-leaf">{t.eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">{t.title}</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/75">{t.subtitle}</p>
        </section>
        <section className="mt-5 rounded-[30px] bg-jungle p-5 text-white shadow-xl shadow-primary/15 ring-1 ring-leaf/30 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-leaf">
                {t.dailyEarnings}
              </p>
              <p className="mt-2 font-display text-4xl font-bold sm:text-5xl">
                ₡{weeklyGross.toLocaleString("es-CR")}
              </p>
              <p className="mt-1 text-xs text-white/70">{t.dailyGross}</p>
            </div>
            <label className="text-xs font-semibold text-white/80">
              {t.date}
              <input
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                className="mt-2 block rounded-2xl bg-white/10 px-3 py-2 text-sm font-bold text-white ring-1 ring-white/20 outline-none focus:ring-2 focus:ring-leaf"
              />
            </label>
          </div>
          <div className="mt-4 border-t border-white/15 pt-3 text-sm font-semibold text-leaf">
            {t.dailyNet}: ₡{weeklyNet.toLocaleString("es-CR")}
          </div>
        </section>
        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">{t.today}</h2>
            <span className="text-xs text-muted-foreground">
              {weekStartKey} — {weekEndKey}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map(([label, value, Icon]) => (
              <article
                key={String(label)}
                className="rounded-3xl bg-surface p-4 shadow-lg shadow-primary/10 ring-1 ring-border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                  <Icon className="size-4 text-leaf-ink" />
                </div>
                <p className="mt-3 font-display text-2xl font-bold">{value}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  +12.4% vs. periodo anterior
                </p>
              </article>
            ))}
          </div>
        </section>
        <section className="mt-5 rounded-[30px] bg-surface p-5 shadow-lg shadow-primary/10 ring-1 ring-border sm:p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-leaf-ink">
                {t.statistics}
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold">{t.fuelPerformance}</h2>
            </div>
            <Fuel className="size-5 text-leaf-ink" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t.fuelPerformanceIntro}</p>
          <div className="mt-5 space-y-4">
            {driverStats.length === 0 ? (
              <p className="rounded-2xl bg-background p-4 text-center text-xs text-muted-foreground ring-1 ring-border">
                {language === "es" ? "Aún no hay datos de conductores." : "No driver data yet."}
              </p>
            ) : (
              driverStats.map((item) => (
                <div key={item.driver}>
                  <div className="flex items-center justify-between gap-3 text-xs font-bold">
                    <span>{item.driver}</span>
                    <span className="text-muted-foreground">
                      {item.km.toFixed(1)} {t.operatingKm} · ₡
                      {item.fuelCost.toLocaleString("es-CR")}
                    </span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-background ring-1 ring-border">
                    <div
                      className="h-full rounded-full bg-leaf"
                      style={{ width: `${(item.km / maxDriverKm) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-7 border-t border-border pt-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold">{t.earningsByDriver}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{t.earningsByDriverIntro}</p>
              </div>
              <ArrowUpRight className="size-5 text-leaf-ink" />
            </div>
            <div className="mt-5 space-y-4">
              {driverStats.map((item) => (
                <div key={`${item.driver}-earnings`}>
                  <div className="flex items-center justify-between gap-3 text-xs font-bold">
                    <span>{item.driver}</span>
                    <span className="text-leaf-ink">₡{item.net.toLocaleString("es-CR")}</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-background ring-1 ring-border">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(item.net / maxDriverNet) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="mt-5 rounded-[30px] bg-surface p-5 shadow-lg shadow-primary/10 ring-1 ring-border sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[#169bc5]/15 text-[#169bc5]">
              <Smartphone className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-leaf-ink">
                {language === "es" ? "Cobro digital" : "Digital collection"}
              </p>
              <h2 className="font-display text-xl font-bold">
                {language === "es" ? "Solicitar pago con Google Pay" : "Request Google Pay payment"}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {language === "es"
                  ? "Define el monto para una reserva con cliente autenticado. El cliente paga en Stripe Checkout y Google Pay aparece si está disponible."
                  : "Set an amount for an authenticated customer's booking. The customer pays in Stripe Checkout and Google Pay appears when available."}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="text-xs font-semibold sm:col-span-1">
              {language === "es" ? "Reserva / cliente" : "Booking / customer"}
              <select
                value={paymentBookingId}
                onChange={(event) => {
                  const booking = cloudBookings.find((item) => item.id === event.target.value);
                  setPaymentBookingId(event.target.value);
                  setPaymentAmount(booking?.fareCrc ?? 0);
                }}
                className="mt-2 w-full rounded-2xl bg-background px-3 py-3 text-xs font-bold ring-1 ring-border outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">
                  {language === "es" ? "Selecciona una reserva" : "Select a booking"}
                </option>
                {cloudBookings
                  .filter((booking) => booking.userId)
                  .map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.tourName ?? booking.destination ?? booking.id.slice(0, 8)} ·{" "}
                      {booking.userId?.slice(0, 8)}
                    </option>
                  ))}
              </select>
            </label>
            <label className="text-xs font-semibold">
              {language === "es" ? "Monto (₡)" : "Amount (CRC)"}
              <input
                type="number"
                min="100"
                value={paymentAmount}
                onChange={(event) => setPaymentAmount(Number(event.target.value) || 0)}
                className="mt-2 w-full rounded-2xl bg-background px-3 py-3 text-base font-bold ring-1 ring-border outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="text-xs font-semibold">
              {language === "es" ? "Nota" : "Note"}
              <input
                value={paymentNote}
                onChange={(event) => setPaymentNote(event.target.value)}
                placeholder={language === "es" ? "Ej. traslado completado" : "e.g. completed ride"}
                className="mt-2 w-full rounded-2xl bg-background px-3 py-3 text-xs font-bold ring-1 ring-border outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
          </div>
          <button
            type="button"
            disabled={
              paymentRequestStatus === "saving" ||
              !paymentBookingId ||
              paymentAmount < 100 ||
              !user?.uid
            }
            onClick={async () => {
              const booking = cloudBookings.find((item) => item.id === paymentBookingId);
              if (!booking?.userId || !user?.uid) return;
              setPaymentRequestStatus("saving");
              try {
                const result = await createPaymentRequest({
                  bookingId: booking.id,
                  customerId: booking.userId,
                  driverId: user.uid,
                  amountCrc: Math.round(paymentAmount),
                  note: paymentNote.trim() || undefined,
                });
                setPaymentRequestStatus(result.ok ? "saved" : "error");
                if (result.ok) setPaymentNote("");
              } catch {
                setPaymentRequestStatus("error");
              }
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#169bc5] py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Smartphone className="size-4" />
            {paymentRequestStatus === "saving"
              ? language === "es"
                ? "Enviando…"
                : "Sending…"
              : language === "es"
                ? "Solicitar pago Google Pay"
                : "Request Google Pay payment"}
          </button>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            {language === "es"
              ? "Tap to Pay del conductor no se activa en este panel web: requiere una app móvil con Stripe Terminal, NFC compatible y disponibilidad regional."
              : "Driver Tap to Pay is not activated in this web panel: it requires a mobile app with Stripe Terminal, compatible NFC, and regional availability."}
          </p>
          {paymentRequestStatus === "saved" && (
            <p className="mt-2 text-xs font-bold text-leaf-ink">
              {language === "es"
                ? "Solicitud enviada al cliente."
                : "Request sent to the customer."}
            </p>
          )}
          {paymentRequestStatus === "error" && (
            <p className="mt-2 text-xs font-bold text-destructive">
              {language === "es"
                ? "No se pudo crear la solicitud."
                : "Could not create the request."}
            </p>
          )}
        </section>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-[30px] bg-surface p-5 shadow-lg shadow-primary/10 ring-1 ring-border sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-leaf/15 text-leaf-ink">
                <RouteIcon className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold">{t.calculator}</h2>
                <p className="text-xs text-muted-foreground">{t.access}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold">
                {t.distance}
                <input
                  type="number"
                  min="1"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value) || 1)}
                  className="mt-2 w-full rounded-2xl bg-background px-4 py-3 text-base font-bold ring-1 ring-border outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
              <label className="text-xs font-semibold">
                {t.gross}
                <input
                  type="number"
                  min="0"
                  value={revenue}
                  onChange={(e) => setRevenue(Number(e.target.value) || 0)}
                  className="mt-2 w-full rounded-2xl bg-background px-4 py-3 text-base font-bold ring-1 ring-border outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold">
                {t.driver}
                <input
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                  placeholder={t.driver}
                  className="mt-2 w-full rounded-2xl bg-background px-4 py-3 text-base font-bold ring-1 ring-border outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
              <label className="text-xs font-semibold">
                {t.date}
                <input
                  type="date"
                  value={tripDate}
                  onChange={(e) => setTripDate(e.target.value)}
                  className="mt-2 w-full rounded-2xl bg-background px-4 py-3 text-base font-bold ring-1 ring-border outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold">{t.reservationType}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-background p-1 ring-1 ring-border">
                {(["private", "shared"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRideType(type)}
                    className={`rounded-xl py-2.5 text-sm font-bold ${rideType === type ? "bg-leaf text-leaf-foreground" : "bg-leaf/15 text-leaf-ink"}`}
                  >
                    {t[type]}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => setReturnEmpty(!returnEmpty)}
                className={`rounded-2xl p-3 text-left text-xs font-bold ring-1 ${returnEmpty ? "bg-leaf text-leaf-foreground ring-leaf" : "bg-background ring-border"}`}
              >
                {t.returnEmpty}
                <span className="mt-1 block text-[10px] opacity-75">
                  {returnEmpty ? t.empty : t.no}
                </span>
              </button>
              <button
                onClick={() => setRoughRoad(!roughRoad)}
                className={`rounded-2xl p-3 text-left text-xs font-bold ring-1 ${roughRoad ? "bg-leaf text-leaf-foreground ring-leaf" : "bg-background ring-border"}`}
              >
                {t.roughRoad}
                <span className="mt-1 block text-[10px] opacity-75">
                  {roughRoad ? "1.2×" : "1.5×"}
                </span>
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                [t.gross, estimate.gross],
                [t.fuelCost, -estimate.fuelCost],
                [t.wearCost, -estimate.wearCost],
                [t.netProfit, estimate.net],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="rounded-2xl bg-background p-3 ring-1 ring-border"
                >
                  <p className="text-[10px] font-semibold text-muted-foreground">{label}</p>
                  <p
                    className={`mt-1 font-display text-lg font-bold ${Number(value) < 0 ? "text-destructive" : ""}`}
                  >
                    ₡{Math.abs(Number(value)).toLocaleString("es-CR")}
                    {Number(value) < 0 ? " −" : ""}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={addTrip}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground active:scale-[0.98]"
            >
              <Plus className="size-4" /> {t.save}
            </button>
          </section>
          <section className="rounded-[30px] bg-surface p-5 shadow-lg shadow-primary/10 ring-1 ring-border sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">{t.trips}</h2>
              <div className="flex items-center gap-2">
                {(filterDate || filterDriver) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterDate("");
                      setFilterDriver("");
                    }}
                    className="rounded-full px-2 py-1 text-[10px] font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  >
                    {t.clearFilters}
                  </button>
                )}
                {trips.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setTrips([])}
                    className="rounded-full px-2 py-1 text-[10px] font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    {t.delete}
                  </button>
                )}
                <span className="rounded-full bg-leaf/15 px-3 py-1 text-[10px] font-bold text-leaf-ink">
                  {filteredTrips.length}/{trips.length}
                </span>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                {t.filterDate}
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-background px-3 py-2 text-xs font-semibold normal-case tracking-normal ring-1 ring-border outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                {t.filterDriver}
                <select
                  value={filterDriver}
                  onChange={(e) => setFilterDriver(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-background px-3 py-2 text-xs font-semibold normal-case tracking-normal ring-1 ring-border outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{t.allDrivers}</option>
                  {driverOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {filteredTrips.length === 0 ? (
              <div className="mt-4 rounded-2xl bg-background p-4 text-center text-xs text-muted-foreground ring-1 ring-border">
                {trips.length === 0
                  ? language === "es"
                    ? "No hay viajes registrados."
                    : "No trips recorded yet."
                  : language === "es"
                    ? "Ningún viaje coincide con los filtros."
                    : "No trips match these filters."}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {filteredTrips.map((trip) => (
                  <article
                    key={trip.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openTripDetail(trip)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openTripDetail(trip);
                      }
                    }}
                    className="cursor-pointer rounded-2xl bg-background p-3 ring-1 ring-border transition-transform hover:-translate-y-0.5 hover:ring-primary/50 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold">{trip.route}</p>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-bold ${trip.rideType === "shared" ? "bg-leaf/20 text-leaf-ink" : "bg-primary text-primary-foreground"}`}
                          >
                            {trip.rideType === "shared" ? t.shared : t.private}
                          </span>
                          <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-700">
                            {trip.paymentMethod === "cash"
                              ? language === "es"
                                ? "Efectivo"
                                : "Cash"
                              : language === "es"
                                ? "Tarjeta"
                                : "Card"}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {trip.km.toFixed(1)} {t.km} · {trip.status} · {trip.date} · {trip.driver}
                        </p>
                      </div>
                      <button
                        aria-label={t.delete}
                        onClick={(event) => {
                          event.stopPropagation();
                          setTrips((current) => current.filter((item) => item.id !== trip.id));
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-xs">
                      <span>
                        {t.gross}: <strong>₡{trip.revenue.toLocaleString("es-CR")}</strong>
                      </span>
                      <span className="font-bold text-leaf-ink">
                        {t.net}: ₡{trip.net.toLocaleString("es-CR")}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
        <footer className="mt-8 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{t.access}</span>
          <span>TuraVía · Conductor</span>
        </footer>
      </div>
    </main>
  );
}
