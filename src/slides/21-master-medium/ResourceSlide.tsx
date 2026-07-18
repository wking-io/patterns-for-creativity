type MasterMediumResourceSlideProps = {
  className?: string;
  imageAlt: string;
  imageUrl: string;
  label: string;
  qrAlt: string;
  qrUrl: string;
};

export function MasterMediumResourceSlide({
  className = "",
  imageAlt,
  imageUrl,
  label,
  qrAlt,
  qrUrl,
}: MasterMediumResourceSlideProps) {
  return (
    <div className={`master-medium-resource-slide ${className}`.trim()}>
      <img
        alt={imageAlt}
        className="master-medium-resource-slide__image"
        draggable={false}
        src={imageUrl}
      />

      <p
        aria-hidden="true"
        className="master-medium-resource-slide__label master-medium-resource-slide__label--shadow"
      >
        {label}
      </p>
      <p className="master-medium-resource-slide__label">{label}</p>

      <img
        alt={qrAlt}
        className="master-medium-resource-slide__qr"
        draggable={false}
        src={qrUrl}
      />
    </div>
  );
}
