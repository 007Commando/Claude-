/**
 * Session-storage key the Apex Pop qualifier writes {name, email} to before
 * sending someone to /auth, so the signup form opens already filled and the
 * password is the only thing left to type. Session storage rather than the
 * URL keeps the address out of analytics, referrers and shared links.
 */
export const SIGNUP_PREFILL_KEY = "apex_signup_prefill";
