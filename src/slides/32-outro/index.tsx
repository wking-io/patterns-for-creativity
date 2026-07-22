import noOneAskedUsUrl from "./noau.webp";
import profilePhotoUrl from "./pfp.png";
import riffAndRefineUrl from "./rr.webp";
import snowflakeUrl from "./snow.svg";
import thankYouBackgroundUrl from "./ty-bg.svg";
import thankYouForegroundUrl from "./ty-fg.svg";
import thankYouStrokeUrl from "./ty-stroke.svg";

export type OutroMediaVariant =
  | "no-one-asked-us"
  | "profile"
  | "riff-and-refine"
  | "snowflake"
  | "thank-you";

type OutroSingleMediaVariant = Exclude<
  OutroMediaVariant,
  "profile" | "thank-you"
>;

type OutroMediaSlideProps = {
  className?: string;
  variant: OutroMediaVariant;
};

const outroMedia: Record<OutroSingleMediaVariant, { alt: string; src: string }> = {
  "no-one-asked-us": {
    alt: "No One Asked Us episode artwork",
    src: noOneAskedUsUrl,
  },
  "riff-and-refine": {
    alt: "Riff and Refine show artwork",
    src: riffAndRefineUrl,
  },
  snowflake: {
    alt: "Snowflake",
    src: snowflakeUrl,
  },
};

export function OutroMediaSlide({
  className = "",
  variant,
}: OutroMediaSlideProps) {
  if (variant === "profile") {
    return (
      <div className={`outro-media-slide outro-profile ${className}`.trim()}>
        <img
          alt="Will King speaking onstage"
          className="outro-profile__photo"
          draggable={false}
          src={profilePhotoUrl}
        />
        <div className="outro-profile__details">
          <p className="outro-profile__website">WKING.DEV</p>
          <p className="outro-profile__handle">@willking</p>
        </div>
      </div>
    );
  }

  if (variant === "thank-you") {
    return (
      <div className={`outro-media-slide outro-thank-you ${className}`.trim()}>
        <img
          alt=""
          aria-hidden="true"
          className="outro-thank-you__layer outro-thank-you__background"
          draggable={false}
          src={thankYouBackgroundUrl}
        />
        <img
          alt=""
          aria-hidden="true"
          className="outro-thank-you__layer outro-thank-you__stroke"
          draggable={false}
          src={thankYouStrokeUrl}
        />
        <img
          alt="Thank you"
          className="outro-thank-you__layer outro-thank-you__foreground"
          draggable={false}
          src={thankYouForegroundUrl}
        />
      </div>
    );
  }

  const media = outroMedia[variant];

  return (
    <div className={`outro-media-slide ${className}`.trim()}>
      <img
        alt={media.alt}
        className={[
          "outro-media-slide__image",
          variant === "snowflake"
            ? "outro-media-slide__image--snowflake"
            : "",
        ].join(" ")}
        draggable={false}
        src={media.src}
      />
    </div>
  );
}
