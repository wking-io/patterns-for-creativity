import { useEffect, useRef, useState } from "react";
import Reveal from "reveal.js";
import "reveal.js/reveal.css";
import { TitleSlide } from "./slides/00-title";
import { slideHeight, slideWidth } from "./slideMetrics";
import { ThinkSlide } from "./slides/01-think";
import { OutputSlide } from "./slides/02-output";
import { SlideFrame } from "./slides/SlideFrame";
import type { SlideKind } from "./slides/SlideFrame";

type Slide = {
  kind: SlideKind;
  content: React.ComponentType<{ className?: string }>;
};

const slides: Slide[] = [
  {
    kind: "cover",
    content: TitleSlide,
  },
  {
    kind: "contained-dark",
    content: ThinkSlide,
  },
  {
    kind: "contained-light",
    content: OutputSlide,
  },
];

export function App() {
  return <SlideDeck />;
}

function SlideDeck() {
  const deckRef = useRef<HTMLDivElement>(null);
  const [isGridVisible, setIsGridVisible] = useState(false);

  useEffect(() => {
    if (!deckRef.current) return undefined;

    const deckElement = deckRef.current;
    const deck = new Reveal(deckRef.current, {
      controls: false,
      hash: true,
      history: true,
      margin: 0,
      progress: true,
      slideNumber: false,
      touch: true,
      transition: "fade",
      width: slideWidth,
      height: slideHeight,
    });

    void deck.initialize();

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) {
        return;
      }

      if (deltaX < 0) {
        deck.next();
      } else {
        deck.prev();
      }
    };

    deckElement.addEventListener("touchstart", handleTouchStart, { passive: true });
    deckElement.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      deckElement.removeEventListener("touchstart", handleTouchStart);
      deckElement.removeEventListener("touchend", handleTouchEnd);
      deck.destroy();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditableTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable);

      if (isEditableTarget || !event.shiftKey || event.key.toLowerCase() !== "g") {
        return;
      }

      event.preventDefault();
      setIsGridVisible((isVisible) => !isVisible);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="reveal" ref={deckRef}>
      <div className="slides">
        {slides.map(({ kind, content: Content }, index) => (
          <SlideFrame kind={kind} isGridVisible={isGridVisible} key={`${kind}-${index}`}>
            <Content className="slide-content" />
          </SlideFrame>
        ))}
      </div>
    </div>
  );
}
