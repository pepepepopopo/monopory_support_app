import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import GameJoinRedirect from "./GameJoinRedirect";

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithToken = (token: string | null) => {
  const search = token ? `?token=${token}` : "";
  return render(
    <MemoryRouter initialEntries={[`/game/join${search}`]}>
      <Routes>
        <Route path="/game/join" element={<GameJoinRedirect />} />
      </Routes>
    </MemoryRouter>
  );
};

const setUA = (ua: string) => {
  Object.defineProperty(navigator, "userAgent", {
    value: ua,
    configurable: true,
  });
};

// User-Agent strings
const UA_IPHONE_LINE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";
const UA_IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const UA_ANDROID_CHROME =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
const UA_PC_CHROME =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

describe("GameJoinRedirect", () => {
  let originalLocation: Location;
  let locationHref: string;

  beforeEach(() => {
    mockNavigate.mockClear();
    originalLocation = window.location;
    locationHref = "";
    Object.defineProperty(window, "location", {
      value: { replace: (url: string) => { locationHref = url; } },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      configurable: true,
      writable: true,
    });
  });

  describe("token がない場合", () => {
    it("トップページへリダイレクトする", () => {
      setUA(UA_PC_CHROME);
      renderWithToken(null);
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  describe("iPhone（LINE等の外部アプリ内ブラウザ）", () => {
    it("App Store へリダイレクトする", () => {
      setUA(UA_IPHONE_LINE);
      renderWithToken("ABC12345");
      expect(locationHref).toContain("apps.apple.com");
    });
  });

  describe("iPhone Safari（モバイルブラウザ）", () => {
    it("Web アプリの参加画面へリダイレクトする", () => {
      setUA(UA_IPHONE_SAFARI);
      renderWithToken("ABC12345");
      expect(mockNavigate).toHaveBeenCalledWith("/games/ABC12345/join", { replace: true });
    });
  });

  describe("Android Chrome", () => {
    it("App Store へリダイレクトする", () => {
      setUA(UA_ANDROID_CHROME);
      renderWithToken("ABC12345");
      expect(locationHref).toContain("apps.apple.com");
    });
  });

  describe("PC Chrome", () => {
    it("Web アプリの参加画面へリダイレクトする", () => {
      setUA(UA_PC_CHROME);
      renderWithToken("ABC12345");
      expect(mockNavigate).toHaveBeenCalledWith("/games/ABC12345/join", { replace: true });
    });
  });

  describe("token をそのまま URL に埋め込む", () => {
    it("指定した token が遷移先 URL に含まれる", () => {
      setUA(UA_PC_CHROME);
      renderWithToken("XYZ99999");
      expect(mockNavigate).toHaveBeenCalledWith("/games/XYZ99999/join", { replace: true });
    });
  });
});
