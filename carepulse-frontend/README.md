# CarePulse — Frontend

React (Vite) frontend for the CarePulse FastAPI backend. No mock data or
second backend — every connected page calls the real API in `main.py`.

## Setup

```bash
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL if your backend isn't on :8000
npm run dev
```

Run this alongside the FastAPI backend (`uvicorn main:app --reload`).

## Structure

```
src/
  api/                 # one module per backend concern — the only files
                        # that know about fetch/URLs/payload shapes
    client.js          # shared fetch wrapper + error handling
    diseaseApi.js       -> POST /predict-disease            (connected)
    recommendationsApi.js -> POST /recommendations          (connected)
    wellbeingApi.js     -> POST /predict-wellbeing          (connected)
    hospitalsApi.js     -> POST /hospitals (planned)        (NOT connected)
  components/          # Header, BottomNav, Card, Badge, Tabs, Icons, StatusBanner
  pages/               # one page per feature, matches the bottom nav
  styles/              # tokens.css (DESIGN.md palette/type/spacing) + global.css
```

## Design system

Visual styling follows `DESIGN.md` (Plus Jakarta Sans + Inter, emerald/slate
palette, rounded-lg cards, pill badges). All values live as CSS variables in
`src/styles/tokens.css` — change the look in one place.

Every interactive element on screen is wired to something real: the bottom
nav and header popovers, the symptom quick-add/category chips, the
recommendations tabs, the hospital distance filters and "use my location"
button, and the directions/call links (built from the real lat/lon/phone
each hospital result returns). Nothing renders a static mock.

## Endpoint status

| Endpoint               | Status        | Page               |
|-------------------------|---------------|--------------------|
| `GET /`                | connected     | (health check only) |
| `POST /predict-disease` | connected     | Symptom checker    |
| `POST /recommendations` | connected     | Recommendations    |
| `POST /predict-wellbeing` | connected   | Digital wellbeing  |
| `/hospitals`            | not implemented on backend yet | Nearby hospitals — UI built, shows a "not connected" state until the route exists |

When the hospitals route is added, the only change needed is inside
`src/api/hospitalsApi.js` — no page code should need to change.
