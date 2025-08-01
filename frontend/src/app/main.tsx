import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "@/shared/components/ui/sonner";
import router from "@/app/routes";
import "./i18n";
import "./index.css";
import "./themes.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster position="bottom-right" closeButton duration={2000} />
  </StrictMode>
);
