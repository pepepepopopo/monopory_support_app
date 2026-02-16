import { Outlet, ScrollRestoration } from "react-router";
import { useEffect } from 'react'
import '../styles/App.css'

function HomeLayout() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "lemonade");
  },[])
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