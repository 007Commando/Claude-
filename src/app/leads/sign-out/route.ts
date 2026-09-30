import { signOut } from "../../../auth";

// GET so the top bar can use a plain link; signOut() with redirectTo clears
// the session cookie and redirects, it does not need a request body.
export async function GET() {
  await signOut({ redirectTo: "/leads/sign-in" });
}
