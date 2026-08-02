"use client";

import { useRouter } from "next/navigation";
import { useSession } from "../hooks/useSession";
import { getAuthUserEmail, hasActiveSubscription } from "../lib/subscriptionGate";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function ViewAppButton({ children, onClick, ...rest }: Props) {
  const router = useRouter();
  const { session } = useSession();

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    const apex = (window as unknown as { ApexAuth?: { redirectToApp: (p?: string) => void } }).ApexAuth;
    if (session && apex) {
      // A Firebase session alone isn't proof of a paid subscription — see
      // subscriptionGate.ts for why this check exists.
      const email = getAuthUserEmail(session);
      const subscribed = email ? await hasActiveSubscription(email) : true;
      if (subscribed) {
        apex.redirectToApp("/dashboard");
      } else {
        router.push("/auth?mode=login");
      }
    } else {
      router.push("/auth?mode=signup&plan=starter&period=monthly");
    }
  };

  return (
    <button {...rest} onClick={handleClick}>
      {children}
    </button>
  );
}

