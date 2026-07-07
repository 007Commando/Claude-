"use client";

import { useRouter } from "next/navigation";
import { useSession } from "../hooks/useSession";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function ViewAppButton({ children, onClick, ...rest }: Props) {
  const router = useRouter();
  const { session } = useSession();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    const apex = (window as unknown as { ApexAuth?: { redirectToApp: (p?: string) => void } }).ApexAuth;
    if (session && apex) {
      apex.redirectToApp("/dashboard");
    } else {
      router.push("/auth?mode=signup&product=plus&plan=monthly");
    }
  };

  return (
    <button {...rest} onClick={handleClick}>
      {children}
    </button>
  );
}

