import HomeLayout from './pages/HomeLayout.tsx';
import Home from './pages/Home.tsx'
import NewGameLayout from './pages/games/NewGameLayout.tsx';
import NewGame from './pages/games/NewGame.tsx';
import StartSettingGame from './pages/games/StartSettingGame.tsx';

export const routes = [
  {
    path: "/",
    Component: HomeLayout,
    children: [
      { index: true, Component: Home },
      { path: "games", Component: NewGameLayout,
        children: [
          { index: true, Component: NewGame },
          { path: ":gameId/startSetting", Component: StartSettingGame }
        ]
      },
    ],
  },
];

export default routes;