# Kiln Coffee: OpenPanel demo

A standalone demo store that sends cookieless events to a **self-hosted OpenPanel** and shows a live funnel read back from it.

- Tracks `product_view`, `add_to_cart`, `begin_checkout` and `purchase` (plus automatic page views).
- Respects Do Not Track and Global Privacy Control.
- The read key stays on the server (`/api/analytics`); the browser only sees counts.

## Run

1. Start OpenPanel locally (API on `http://127.0.0.1:3333`).
2. Copy `.env.example` to `.env.local` and fill in the project's write client ID and a read client.
3. `npm install` then `npm run dev`. Open http://127.0.0.1:5180.

Demo only: no payments are taken.
