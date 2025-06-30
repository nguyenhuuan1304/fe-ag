import "./index.css";
import React from "react";
import AppRouter from "./App.tsx";
import { AuthProvider } from "./context/AuthContext";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "./components/ui/sonner.tsx";

const rootElement = document.getElementById("root")!;
rootElement.style.width = "100%";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
