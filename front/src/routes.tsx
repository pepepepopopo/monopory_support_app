import HomeLayout from './pages/HomeLayout.tsx';
import Home from './pages/Home.tsx'
import NewGameLayout from './pages/games/setting/NewGameLayout.tsx';
import NewGame from './pages/games/setting/NewGame.tsx';
import StartSettingGame from './pages/games/setting/StartSettingGame.tsx';
import GameJoin from './pages/games/setting/GameJoin.tsx';
import PlayScreen from './pages/games/started/ PlayScreen.tsx';
import ResultScreen from './pages/games/started/ResultScreen.tsx';
import PrivacyPolicy from './pages/PrivacyPolicy.tsx';
import Terms from './pages/Terms.tsx';
import About from './pages/About.tsx';
import NotFound from './pages/NotFound.tsx';
import Contact from './pages/Contact.tsx';

export const routes = [
  {
    path: "/",
    Component: HomeLayout,
    children: [
      { index: true, Component: Home },
      { path: "privacy", Component: PrivacyPolicy },
      { path: "terms", Component: Terms },
      { path: "about", Component: About },
      { path: "contact", Component: Contact },
      {
        path: "games",
        Component: NewGameLayout,
        children: [
          { index: true, Component: NewGame },
          {
            path: ":joinToken",
            children: [
              { path: "join", Component: GameJoin },
              { path: "startSetting", Component: StartSettingGame },
              { path: "play", Component: PlayScreen },
              { path: "result", Component: ResultScreen },
            ]
          }
        ]
      },
      { path: "*", Component: NotFound },
    ],
  },
];

export default routes;