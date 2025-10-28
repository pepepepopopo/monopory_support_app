import HomeLayout from './pages/HomeLayout.tsx';
import Home from './pages/Home.tsx'
import NewGame from './pages/games/NewGame.tsx';

export const routes = [
  {
    path: "/",
    Component: HomeLayout,
    children: [
      { index: true, Component: Home },
      { path: "games", Component: NewGame },
    ],
  },
];

export default routes;