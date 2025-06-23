# Web (Frontend)

This is the Next.js 15 frontend for Status for Systems, using Chakra UI and Tailwind CSS for a modern, responsive dashboard.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Set the API URL in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Lint the codebase

## Main Dependencies

- next: 15.3.3
- react: ^19.0.0
- @chakra-ui/react, @chakra-ui/icons, @chakra-ui/next-js
- @emotion/react, @emotion/styled
- tailwindcss: ^4
- framer-motion
- react-icons
- typescript

## Customization

- Main dashboard: `src/app/page.tsx`
- Admin pages: `src/app/admin/`
- Chakra UI components: throughout the app, especially in `src/components/`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Chakra UI Docs](https://chakra-ui.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

For backend/API setup, see [../server/README.md](../server/README.md).
