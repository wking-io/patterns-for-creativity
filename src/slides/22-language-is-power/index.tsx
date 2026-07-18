import animationVocabularyUrl from "./lang-tweet-1.webp";
import domainExpertiseUrl from "./lang-tweet-2.webp";
import indexHowUrl from "./index-how.webp";

export type LanguageTweetVariant = "animation-vocabulary" | "domain-expertise";

type LanguageTweetSlideProps = {
  className?: string;
  variant: LanguageTweetVariant;
};

const tweets = {
  "animation-vocabulary": {
    alt: "Emil Kowalski on the vocabulary needed to describe good AI animations",
    src: animationVocabularyUrl,
  },
  "domain-expertise": {
    alt: "Emil Kowalski on domain expertise improving what people can get from AI",
    src: domainExpertiseUrl,
  },
} satisfies Record<LanguageTweetVariant, { alt: string; src: string }>;

export function LanguageIndexSlide({ className = "" }: { className?: string }) {
  return (
    <div className={`language-index-slide ${className}`.trim()}>
      <img
        alt="Index How vocabulary and typography reference page"
        className="language-index-slide__image"
        draggable={false}
        src={indexHowUrl}
      />
    </div>
  );
}

export function LanguageTweetSlide({
  className = "",
  variant,
}: LanguageTweetSlideProps) {
  const tweet = tweets[variant];

  return (
    <div
      className={`language-tweet-slide language-tweet-slide--${variant} ${className}`.trim()}
    >
      <img
        alt={tweet.alt}
        className="language-tweet-slide__image"
        draggable={false}
        src={tweet.src}
      />
    </div>
  );
}
