import { Outlet } from "react-router";

const NewGameLayout = () => {
  return(
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <Outlet />
      </div>
    </div>
  )
}

export default NewGameLayout;