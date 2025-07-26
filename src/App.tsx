import AppContent from "./components/AppContent";
import AuthWrapper from "./components/AuthWrapper";
import { BrowserRouter, Route, Routes } from "react-router";

export default function App() {
  return (
    <div className="w-full h-full text-zinc-300 text-xs">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <AuthWrapper type="user" debounce={60}>
                <AppContent page="home" key="app-content" />
              </AuthWrapper>
            }
          />
          <Route
            path="/analytics"
            element={
              <AuthWrapper type="user" debounce={60}>
                <AppContent page="analytics" key="app-content" />
              </AuthWrapper>
            }
          />
          <Route
            path="/admin"
            element={
              <AuthWrapper type="admin" debounce={60}>
                <AppContent page="admin" key="app-content" />
              </AuthWrapper>
            }
          />
          <Route
            path="/signin"
            element={
              <AuthWrapper type="admin" debounce={120}>
                <AppContent page="signin" key="app-content" />
              </AuthWrapper>
            }
          />
          <Route
            path="/signout"
            element={
              <AuthWrapper type="admin" debounce={120}>
                <AppContent page="signout" key="app-content" />
              </AuthWrapper>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
