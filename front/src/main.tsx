import { StrictMode } from 'react'
import ReactDOM from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { routes } from "./routes";
import './index.css'

const router = createBrowserRouter(routes);
console.log(router.routes);

const root = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />,
  </StrictMode>,
)
