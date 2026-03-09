import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

const APP_STORE_URL = import.meta.env.VITE_APP_STORE_URL as string;

const isMobileApp = () => {
  const ua = navigator.userAgent;
  // Exclude Safari (mobile browser) — Universal Links don't fire in Safari,
  // so Safari users should use the Web app, not be redirected to App Store.
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  return (isIOS && !isSafari) || isAndroid;
};

const GameJoinRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    if (isMobileApp()) {
      window.location.replace(APP_STORE_URL);
    } else {
      navigate(`/games/${token}/join`, { replace: true });
    }
  }, [token, navigate]);

  return null;
};

export default GameJoinRedirect;
