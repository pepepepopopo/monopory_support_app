import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: object[];
  }
}

interface AdBannerProps {
  adSlot: string;
  adFormat?: string;
}

const AdBanner = ({ adSlot, adFormat = "auto" }: AdBannerProps) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ignore duplicate push errors
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-1666621379256365"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
    />
  );
};

export default AdBanner;
