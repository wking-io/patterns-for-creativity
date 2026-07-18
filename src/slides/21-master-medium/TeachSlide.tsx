import mattTeachUrl from "./matt-teach.webp";
import qrTeachUrl from "./qr-teach.svg";
import { MasterMediumResourceSlide } from "./ResourceSlide";

type MasterMediumTeachSlideProps = {
  className?: string;
};

export function MasterMediumTeachSlide({
  className = "",
}: MasterMediumTeachSlideProps) {
  return (
    <MasterMediumResourceSlide
      className={className}
      imageAlt="Matt teaching from his studio"
      imageUrl={mattTeachUrl}
      label="/teach"
      qrAlt="QR code for /teach"
      qrUrl={qrTeachUrl}
    />
  );
}
