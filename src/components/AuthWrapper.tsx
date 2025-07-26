import { useEffect, useRef, type HTMLAttributes } from "react";
import AuthComponent from "./AuthComponent";
import { AnimatePresence } from "framer-motion";
import { useAppSelector } from "../store/store";
import { selectAuth, selectAuthFor } from "../store/slice";
import useTryAuth from "../hooks/useTryAuth";

export interface AuthWrapperProps extends HTMLAttributes<HTMLDivElement> {
  type: "user" | "admin";
  debounce: number;
  scale?: number;
}

export default function AuthWrapper({
  type,
  debounce,
  scale = 1,
  children,
  className = "",
  style,
  ...props
}: AuthWrapperProps) {
  const auth = useAppSelector(selectAuth);
  const granted = useAppSelector((state) => selectAuthFor(state, type));

  const tryAuth = useTryAuth(type, debounce);

  const lastAuth = useRef(undefined as undefined | null | "user" | "admin");
  useEffect(() => {
    if (lastAuth.current === auth) return;
    lastAuth.current = auth;
    tryAuth(!auth);
    if (!auth) return;
    const interval = setInterval(tryAuth, 10 * 1e3);
    return () => clearInterval(interval);
  }, [type, auth, tryAuth]);

  return (
    <div
      className={`w-full h-full max-w-full max-h-full overflow-hidden ${className}`}
      style={{ ...style, transform: `scale(${scale})` }}
      {...props}
    >
      <AnimatePresence>
        {!granted && (
          <AuthComponent key="auth-component" type={type} debounce={debounce} />
        )}
        {children}
      </AnimatePresence>
    </div>
  );
}
