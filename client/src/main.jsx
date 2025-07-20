import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { appStore } from "./app/store";
import { Toaster } from "@/components/ui/sonner";
import { useLoadUserQuery } from "./features/api/authApi";
import LoadingScreen from "./components/LoadingScreen";
import logoDark from "./assets/logo_light.png"; // Your logo path


const Custom = ({ children }) => {
  const { isLoading } = useLoadUserQuery();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Show loading screen for at least 1.5 seconds
      const timer = setTimeout(() => setShowLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return <>{showLoading ? <LoadingScreen logoSrc={logoDark} /> : children}</>;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={appStore}>
      <Custom>
      <App />
      <Toaster />
      </Custom>
    </Provider>
  </StrictMode>
);
