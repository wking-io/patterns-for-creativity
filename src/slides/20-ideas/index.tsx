import { StatementAxisSlide } from "../StatementAxisSlide";
import banksyUrl from "./banksy.webp";
import dropboxUrl from "./dropbox.webp";
import lineLeftUrl from "./line-left.svg";
import lineRightUrl from "./line-right.svg";
import officeUrl from "./office.webp";
import vennUrl from "./venn.svg";

export type IdeasMediaVariant = "dropbox" | "banksy" | "office";

type IdeasMediaSlideProps = {
  className?: string;
  variant: IdeasMediaVariant;
};

const ideasMedia = {
  dropbox: {
    alt: "A grid of Dropbox logo explorations",
    src: dropboxUrl,
  },
  banksy: {
    alt: "Banksy's artwork shredding itself at auction",
    src: banksyUrl,
  },
  office: {
    alt: "A ribbon-cutting scene from The Office",
    src: officeUrl,
  },
} satisfies Record<IdeasMediaVariant, { alt: string; src: string }>;

export function IdeasMediaSlide({
  className = "",
  variant,
}: IdeasMediaSlideProps) {
  const media = ideasMedia[variant];

  return (
    <div
      className={`ideas-media-slide ideas-media-slide--${variant} ${className}`.trim()}
    >
      <img
        alt={media.alt}
        className="ideas-media-slide__asset"
        draggable={false}
        src={media.src}
      />
    </div>
  );
}

type IdeasSlideProps = {
  className?: string;
  isAnimated?: boolean;
};

const headline = "What you notice colliding with what you know";

export function IdeasSlide({
  className = "",
  isAnimated = true,
}: IdeasSlideProps) {
  return (
    <StatementAxisSlide
      className={[
        "ideas-slide",
        isAnimated ? "ideas-slide--animated" : "ideas-slide--static",
        className,
      ].join(" ").trim()}
      headline={headline}
      headlineShadow
      icon={<AnimatedVenn />}
      leftLabel="Experience"
      leftLineUrl={lineLeftUrl}
      rightLabel="Expertise"
      rightLineUrl={lineRightUrl}
    />
  );
}

function AnimatedVenn() {
  return (
    <div className="ideas-venn">
      <svg
        aria-hidden="true"
        className="ideas-venn__construction"
        fill="none"
        viewBox="0 0 128 80"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="ideas-venn__circle ideas-venn__circle--solid"
          cx="40"
          cy="40"
          fill="currentColor"
          r="40"
        />
        <circle
          className="ideas-venn__circle ideas-venn__circle--outline"
          cx="88"
          cy="40"
          r="38.4"
          stroke="currentColor"
          strokeWidth="3.2"
        />
      </svg>

      <img
        alt=""
        aria-hidden="true"
        className="ideas-venn__final"
        draggable={false}
        src={vennUrl}
      />
    </div>
  );
}
