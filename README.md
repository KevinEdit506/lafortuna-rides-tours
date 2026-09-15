# Via La Fortuna

Via La Fortuna is a bilingual rides and tours experience for travelers visiting La Fortuna and the Arenal region of Costa Rica. The app combines clear transfer estimates, scheduled private or shared rides, and curated local experiences in a calm, trustworthy interface.

## Live site

Visit the deployed app at [kevinedit506.github.io/lafortuna-rides-tours](https://kevinedit506.github.io/lafortuna-rides-tours/).

## Highlights

- Bilingual Spanish and English interface.
- Private and shared transfer options.
- Automatic fare preview inspired by familiar ride-hailing flows, with a 10% promotional discount.
- Fixed private-trip pricing regardless of passenger count.
- Shared-trip pricing calculated separately for each passenger route.
- Transparent fare breakdown for service, operating costs, and coverage.
- Live USD-to-CRC conversion using the BCCR reference rate through a public data endpoint.
- Scheduled or immediate ride planning.
- A lightweight trip agenda for scheduled rides.
- Shared rides with an individual destination for each passenger.
- Card or cash payment preference included in the WhatsApp booking request.
- Curated La Fortuna experiences, including the Místico Hanging Bridges and Peñas Blancas River.
- Tour discovery categories for Arenal, beaches, national parks, and rivers across Costa Rica.
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

## Deployment

Changes pushed to `main` are validated and deployed through [GitHub Actions](.github/workflows/pages.yml). GitHub Pages serves the prerendered output at the live site URL above.

## Brand assets

The public metadata uses a branded Via La Fortuna favicon and a scenic Arenal-region social preview image. The image was selected to communicate the product promise at a glance: reliable local mobility surrounded by the landscape travelers come to experience.
