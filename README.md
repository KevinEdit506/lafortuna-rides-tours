# Via La Fortuna

Via La Fortuna is a bilingual rides and tours experience for travelers visiting La Fortuna and the Arenal region of Costa Rica. The app combines clear transfer estimates, scheduled private or shared rides, and curated local experiences in a calm, trustworthy interface.

## Live site

Visit the deployed app at [kevinedit506.github.io/lafortuna-rides-tours](https://kevinedit506.github.io/lafortuna-rides-tours/).

## Highlights

- Bilingual Spanish and English interface.
- Private and shared transfer options.
- Automatic fare preview inspired by familiar ride-hailing flows, recalculated when the route changes.
- Fixed private-trip pricing regardless of passenger count.
- Shared-trip pricing calculated separately for each passenger route.
- Transparent fare breakdown for service, operating costs, and coverage.
- Distance-based upfront fare formula using base fare, time, distance, dynamic multiplier, and tolls/fees.
- Payment selection is locked after a booking request is confirmed and sent to WhatsApp.
- Live USD-to-CRC conversion using the BCCR reference rate through a public data endpoint.
- Scheduled or immediate ride planning.
- A lightweight trip agenda for scheduled rides.
- Shared rides with an individual destination for each passenger.
- Card or cash payment preference included in the WhatsApp booking request.
- Curated La Fortuna experiences, including the Místico Hanging Bridges and Peñas Blancas River.
- Tour discovery categories for Arenal, beaches, national parks, and rivers across Costa Rica.
- Google Maps address suggestions and driving-route distance/time when a restricted Maps API key is configured.
- Local Costa Rica place suggestions remain available as a browser fallback when the Maps key is unavailable.
- Shared fares include the independently calculated distance and duration for each passenger route.
- Responsive layout designed for mobile travelers and larger screens.

## Local development

This project uses React, TanStack Start, Vite, Tailwind CSS, and TypeScript. To run it locally:

```sh
git clone https://github.com/KevinEdit506/lafortuna-rides-tours.git
cd lafortuna-rides-tours
npm install
npm run dev
```

For a production-style validation, run:

```sh
npm run ci
```

The command runs linting, TypeScript checks, and the static production build.

The fare panel displays both USD and Costa Rican colones when the current BCCR reference rate is available. The rate is fetched in the browser from [Frankfurter's BCCR provider](https://frankfurter.dev/providers/bccr/), which publishes current and historical rates from the [Banco Central de Costa Rica](https://sdd.bccr.fi.cr/es/IndicadoresEconomicos/Inicio/Contenedor/6).

## Google Maps routing

Set `VITE_GOOGLE_MAPS_API_KEY` in the GitHub Actions repository secrets and expose it during the Pages build to enable Google Places Autocomplete and Google Maps driving routes. The key should be restricted to the deployed GitHub Pages origin and limited to the Maps JavaScript API and Places API. Without the key, the interface keeps a safe local route preview and a short-distance fallback estimate rather than failing.

The fare model uses `Final Price = (Base Fare + Time × Per-Minute Rate + Distance × Per-Kilometer Rate) × Dynamic Multiplier + Tolls/Fees`. The current default multiplier is `1.0x` while demand data is unavailable; it is displayed in the fare breakdown rather than being presented as a hidden adjustment. Private fares are calculated once per trip; shared fares calculate each passenger route independently. Changing either endpoint updates the route preview, distance, duration, and fare. Once a booking request is confirmed, the selected payment method cannot be changed in that confirmed request.

## Deployment

Changes pushed to `main` are validated and deployed through [GitHub Actions](.github/workflows/pages.yml). GitHub Pages serves the prerendered output at the live site URL above.

## Brand assets

The public metadata uses a branded Via La Fortuna favicon and a scenic Arenal-region social preview image. The image was selected to communicate the product promise at a glance: reliable local mobility surrounded by the landscape travelers come to experience.
