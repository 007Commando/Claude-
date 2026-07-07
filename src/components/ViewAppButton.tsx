import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function ViewAppButton({ children, onClick, ...rest }: Props) {
  const navigate = useNavigate();
  const { session } = useSession();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    const apex = (window as unknown as { ApexAuth?: { redirectToApp: (p?: string) => void } }).ApexAuth;
    if (session && apex) {
      apex.redirectToApp("/");
    } else {
      navigate("/auth?mode=signup");
    }
  };

  return (
    <button {...rest} onClick={handleClick}>
      {children}
    </button>
  );
}

