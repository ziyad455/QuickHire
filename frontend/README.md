# QuickHire Frontend

This package contains the QuickHire web client built with React, TypeScript, Vite, Tailwind CSS, Framer Motion, and Firebase.

For full project documentation, setup, architecture, and backend details, see the root README:

- [`../README.md`](../README.md)

## Local Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Frontend Environment

Create `frontend/.env` with:

```env
VITE_API_URL=http://127.0.0.1:5555
```

## Notes

- Firebase is initialized in `src/lib/firebase.ts`.
- Protected pages require a signed-in Firebase user.
- Job matches are saved to Firestore under the authenticated user's record.
