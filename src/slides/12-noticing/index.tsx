import noticingUrl from "./noticing.svg";

type NoticingSlideProps = {
  className?: string;
};

export function NoticingSlide({ className = "" }: NoticingSlideProps) {
  return (
    <div
      aria-label="You can't have ideas for things you never notice"
      className={`noticing-slide ${className}`.trim()}
      role="img"
    >
      <img
        alt=""
        aria-hidden="true"
        className="noticing-slide__artwork"
        draggable={false}
        src={noticingUrl}
      />
    </div>
  );
}
