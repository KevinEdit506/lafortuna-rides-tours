import { ExternalLink, LocateFixed, LoaderCircle, Minus, Plus, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type MiniRouteMapProps = {
  origin: string;
  destination: string;
  language: "es" | "en";
};

function mapsAddress(address: string) {
  const trimmed = address.trim();
  if (trimmed.toLocaleLowerCase("es") === "centro de la fortuna") {
    return "La Fortuna, San Carlos, Costa Rica";
  }
  if (/costa rica/i.test(trimmed) || /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed}, Costa Rica`;
}

export function MiniRouteMap({ origin, destination, language }: MiniRouteMapProps) {
  const [visibleRoute, setVisibleRoute] = useState({ origin, destination, language });
  const [zoom, setZoom] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const lastZoom = useRef(12);
  const isSpanish = language === "es";
  const complete = Boolean(origin.trim() && destination.trim());
  const updating =
    visibleRoute.origin !== origin ||
    visibleRoute.destination !== destination ||
    visibleRoute.language !== language;

  useEffect(() => {
    if (
      visibleRoute.origin === origin &&
      visibleRoute.destination === destination &&
      visibleRoute.language === language
    ) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setLoaded(false);
      setLoadError(false);
      setZoom(null);
      lastZoom.current = 12;
      setVisibleRoute({ origin, destination, language });
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [origin, destination, language, visibleRoute]);

  const parameters = new URLSearchParams({
    saddr: mapsAddress(visibleRoute.origin),
    daddr: mapsAddress(visibleRoute.destination),
    output: "embed",
    hl: visibleRoute.language,
    dirflg: "d",
  });
  if (zoom !== null) parameters.set("z", String(zoom));
  const mapSource = `https://maps.google.com/maps?${parameters.toString()}`;
  const fullMapSource = `https://www.google.com/maps/dir/?${new URLSearchParams({
    api: "1",
    origin: mapsAddress(origin),
    destination: mapsAddress(destination),
    travelmode: "driving",
    hl: language,
  }).toString()}`;

  useEffect(() => {
    if (loaded || !complete) return;
    const timeout = window.setTimeout(() => setLoadError(true), 18_000);
    return () => window.clearTimeout(timeout);
  }, [loaded, complete, mapSource, retry]);

  const changeZoom = (delta: number) => {
    const nextZoom = Math.max(5, Math.min(19, (zoom ?? lastZoom.current) + delta));
    if (nextZoom === zoom) return;
    setLoaded(false);
    setLoadError(false);
    lastZoom.current = nextZoom;
    setZoom(nextZoom);
  };

  const centerRoute = () => {
    setLoaded(false);
    setLoadError(false);
    setZoom(null);
    lastZoom.current = 12;
    setRetry((current) => current + 1);
  };

  return (
    <div className="mini-route-map">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-panel-muted-foreground">
          {isSpanish ? "Ruta del viaje" : "Trip route"}
        </p>
        <a
          href={fullMapSource}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={
            isSpanish ? "Abrir ruta completa en Google Maps" : "Open full route in Google Maps"
          }
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-[11px] font-semibold text-white ring-1 ring-white/15"
        >
          {isSpanish ? "Ampliar" : "Expand"}
          <ExternalLink className="size-3.5" />
        </a>
      </div>
      <div className="relative h-[300px] overflow-hidden rounded-[22px] bg-surface ring-1 ring-white/15 sm:h-[320px]">
        {complete ? (
          <iframe
            key={`${mapSource}-${retry}`}
            src={mapSource}
            title={
              isSpanish
                ? `Google Maps: ruta de ${origin} a ${destination}`
                : `Google Maps: route from ${origin} to ${destination}`
            }
            className="block size-full border-0"
            width="100%"
            height="300"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => {
              setLoaded(true);
              setLoadError(false);
            }}
            onError={() => setLoadError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-foreground">
            {isSpanish
              ? "Indica el origen y el destino para ver tu ruta en el mapa."
              : "Enter your pickup and destination to see your route on the map."}
          </div>
        )}
        {complete && !loaded && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface px-6 text-center text-sm text-foreground"
            role="status"
          >
            {loadError ? (
              <>
                <p>
                  {isSpanish
                    ? "El mapa está tardando en cargar. Comprueba tu conexión o abre la ruta completa."
                    : "The map is taking longer to load. Check your connection or open the full route."}
                </p>
                <button
                  type="button"
                  onClick={centerRoute}
                  className="flex items-center gap-2 rounded-full bg-jungle px-4 py-3 font-semibold text-primary-foreground"
                >
                  <RefreshCw className="size-4" />
                  {isSpanish ? "Reintentar" : "Retry"}
                </button>
              </>
            ) : (
              <>
                <LoaderCircle className="size-6 motion-safe:animate-spin" />
                <p>{isSpanish ? "Cargando Google Maps…" : "Loading Google Maps…"}</p>
              </>
            )}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={centerRoute}
          disabled={!complete || updating}
          className="flex min-h-11 items-center gap-2 rounded-full bg-surface px-3 py-2 text-xs font-semibold text-foreground disabled:opacity-60"
          aria-label={isSpanish ? "Centrar toda la ruta" : "Center the full route"}
        >
          <LocateFixed className="size-4" />
          {isSpanish ? "Centrar" : "Center"}
        </button>
        <div
          className="flex gap-2"
          role="group"
          aria-label={isSpanish ? "Zoom del mapa" : "Map zoom"}
        >
          <button
            type="button"
            onClick={() => changeZoom(-1)}
            disabled={!complete || !loaded || updating || zoom === 5}
            aria-label={isSpanish ? "Alejar mapa" : "Zoom out"}
            className="grid size-11 place-items-center rounded-full bg-surface text-foreground disabled:opacity-60"
          >
            <Minus className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => changeZoom(1)}
            disabled={!complete || !loaded || updating || zoom === 19}
            aria-label={isSpanish ? "Acercar mapa" : "Zoom in"}
            className="grid size-11 place-items-center rounded-full bg-surface text-foreground disabled:opacity-60"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
      <p
        className="mt-2 text-[11px] leading-relaxed text-panel-muted-foreground"
        aria-live="polite"
      >
        {updating
          ? isSpanish
            ? "Actualizando el mapa con tu nueva ruta…"
            : "Updating the map with your new route…"
          : isSpanish
            ? "Mapa interactivo: desliza para explorar las calles y toca los controles para acercarte."
            : "Interactive map: drag to explore the streets and tap the controls to zoom."}
      </p>
    </div>
  );
}
