import qrPrototypeUrl from "../27-less-sacred/qr-prototype.svg";
import mattTeachUrl from "./matt-teach.webp";
import { MasterMediumResourceSlide } from "./ResourceSlide";

type MasterMediumPrototypeSlideProps = {
  className?: string;
};

export function MasterMediumPrototypeSlide({
  className = "",
}: MasterMediumPrototypeSlideProps) {
  return (
    <MasterMediumResourceSlide
      className={className}
      imageAlt="Matt teaching from his studio"
      imageUrl={mattTeachUrl}
      label="/prototype"
      qrAlt="QR code for /prototype"
      qrUrl={qrPrototypeUrl}
    />
  );
}
