import HomeLayout from './pages/HomeLayout.tsx';
import Home from './pages/Home.tsx'
import NewGameLayout from './pages/games/NewGameLayout.tsx';
import NewGame from './pages/games/NewGame.tsx';
import StartSettingGame from './pages/games/StartSettingGame.tsx';
import GameJoin from './pages/games/GameJoin.tsx';

export const routes = [
  {
    path: "/",
    Component: HomeLayout,
    children: [
      { index: true, Component: Home },
      { path: "games", Component: NewGameLayout,
        children: [
          { index: true, Component: NewGame },
          { path: ":joinToken/startSetting", Component: StartSettingGame },
          { path: ":joinToken/join", Component: GameJoin}
        ]
      },
    ],
  },
];

export default routes;