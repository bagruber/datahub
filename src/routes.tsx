import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Dataset } from "./pages/Dataset";
import { About } from "./pages/About";

export const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: "/", element: <Home /> },
        { path: "/d/:id", element: <Dataset /> },
        { path: "/about", element: <About /> },
        { path: "*", element: <Navigate to="/" replace /> },
      ],
    },
  ],
  // Aus BASE_URL statt fest verdrahtet: die App läuft unter zwei Pfaden —
  // /datahub/ auf GitHub Pages, /data/ auf moosburg.eu. Passt der basename
  // nicht zur URL, greift keine Route und die Seite bleibt weiß.
  // BASE_URL endet auf "/", basename erwartet es ohne.
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") },
);
