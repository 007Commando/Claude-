# track.apexapplications.io

Front door for Apex's own email click tracking (Vercel project `apex-track`).
`/c/<token>` is proxied to the backend, `GET /api/redirects/email/click/:token`,
which checks the signed token, records the click (Firestore `emailClicks`) and
redirects to the real link. Everything else goes to the homepage.
Links are written by `apex-apps/backend/src/utils/mailing/clickLinks.ts`
(switch: CLICK_TRACKING). DNS: CNAME `track` -> cname.vercel-dns.com.
Deploy from this folder: `npx vercel --prod --yes --scope info-78044384s-projects`.
