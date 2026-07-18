import { MasterMediumResourceSlide } from "./ResourceSlide";
import qrSideshowUrl from "./qr-sideshow.svg";
import sideshowUrl from "./sideshow.webp";

type MasterMediumSideshowSlideProps = {
  className?: string;
};

export function MasterMediumSideshowSlide({
  className = "",
}: MasterMediumSideshowSlideProps) {
  return (
    <MasterMediumResourceSlide
      className={`master-medium-resource-slide--sideshow ${className}`.trim()}
      imageAlt="Sideshow agent generating two dashboard directions"
      imageUrl={sideshowUrl}
      label="sideshow.sh"
      qrAlt="QR code for sideshow.sh"
      qrUrl={qrSideshowUrl}
    />
  );
}
