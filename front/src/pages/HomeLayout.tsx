import { Outlet, ScrollRestoration, useLocation } from "react-router";
import { useEffect } from 'react'
import '../styles/App.css'

declare const gtag: (...args: unknown[]) => void;

function HomeLayout() {
  const location = useLocation()

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "lemonade");
  },[])

  useEffect(() => {
    gtag('event', 'page_view', { page_path: location.pathname })
  }, [location.pathname])
  return (
    <div className="size-full">
      <ScrollRestoration />
      <div className="min-h-screen bg-base-100 p-6">
        <div className="max-w-md mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default HomeLayout;