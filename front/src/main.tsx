import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { routes } from "./routes";
import { initializePushNotifications } from "./services/pushNotifications";
import "./index.css";

// プッシュ通知の初期化（ネイティブアプリのみ）
initializePushNotifications();

const router = createBrowserRouter(routes);

const root = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
