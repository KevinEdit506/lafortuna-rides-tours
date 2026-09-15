# Via La Fortuna

Via La Fortuna is a bilingual rides and tours experience for travelers visiting La Fortuna and the Arenal region of Costa Rica. The app combines clear transfer estimates, scheduled private or shared rides, and curated local experiences in a calm, trustworthy interface.

## Live site

Visit the deployed app at [kevinedit506.github.io/lafortuna-rides-tours](https://kevinedit506.github.io/lafortuna-rides-tours/).

## Highlights

- Bilingual Spanish and English interface.
- Private and shared transfer options.
- Transparent fare breakdown for service, operating costs, and coverage.
- Scheduled or immediate ride planning.
- Curated La Fortuna experiences, including the Místico Hanging Bridges and Peñas Blancas River.
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

## Deployment

Changes pushed to `main` are validated and deployed through [GitHub Actions](.github/workflows/pages.yml). GitHub Pages serves the prerendered output at the live site URL above.

## Brand assets

The public metadata uses a branded Via La Fortuna favicon and a scenic Arenal-region social preview image. The image was selected to communicate the product promise at a glance: reliable local mobility surrounded by the landscape travelers come to experience.
