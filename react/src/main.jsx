import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./router.jsx";
import { ContextProvider } from "./context/ContextProvider.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardContextProvider } from "./context/DashboardContextProvider";

export const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DashboardContextProvider>
        <ContextProvider>
          <RouterProvider router={router} />
        </ContextProvider>
      </DashboardContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
