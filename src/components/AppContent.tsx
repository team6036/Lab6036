import { AnimatePresence } from "framer-motion";
import AppRefresher from "./AppRefresher";
import HomePage from "./home/HomePage";
import { useAppSelector } from "../store/store";
import { selectAuth } from "../store/slice";
import AdminPage from "./admin/AdminPage";
import AnalyticsPage from "./analytics/AnalyticsPage";
import SignPage from "./sign/SignPage";

export interface AppContentProps {
  page: "home" | "analytics" | "admin" | "signin" | "signout";
}

export default function AppContent({ page }: AppContentProps) {
  const auth = useAppSelector(selectAuth);

  return (
    <>
      <AppRefresher
        debounce={page === "signin" || page === "signout" ? 120 : 60}
      />
      <div className="relative w-full max-w-full h-full max-h-full overflow-hidden bg-zinc-900">
        <AnimatePresence>
          {page === "home" && <HomePage key="page-home" />}
          {page === "analytics" && <AnalyticsPage key="page-analytics" />}
          {page === "admin" && <AdminPage key="page-admin" />}
          {page === "signin" && <SignPage key="page-signin" type="in" />}
          {page === "signout" && <SignPage key="page-signout" type="out" />}
        </AnimatePresence>
        <div className="absolute bottom-4 left-4 text-zinc-600 italic">
          {
            {
              null: "",
              user: "User",
              admin: "Admin",
            }[auth ?? "null"]
          }
        </div>
      </div>
    </>
  );
}
