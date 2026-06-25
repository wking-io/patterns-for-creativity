import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import Reveal from "reveal.js";
import "reveal.js/reveal.css";
import { CloudContourArtwork, CloudContourPage } from "./CloudContourPage";
import { SimplexFoamPrototype } from "./SimplexFoamPrototype";
import { slideHeight, slideWidth } from "./slideMetrics";

type SlideKind = "cover" | "section" | "quote" | "pattern" | "standard" | "closing";

type Slide = {
  kicker: string;
  title: string;
  note?: string;
  kind?: SlideKind;
  quote?: string;
  visual: VisualName;
};

type VisualName =
  | "cover"
  | "loop"
  | "roles"
  | "nested"
  | "oneDifferent"
  | "factory"
  | "handoff"
  | "sectionCreativity"
  | "notDesign"
  | "unknown"
  | "decision"
  | "messy"
  | "method"
  | "cycle"
  | "quote"
  | "levers"
  | "capacity"
  | "catalyst"
  | "notice"
  | "library"
  | "lens"
  | "constellation"
  | "compound"
  | "funnel"
  | "learn"
  | "aperture"
  | "language"
  | "reality"
  | "exploration"
  | "shorten"
  | "closing";

const slides: Slide[] = [
  {
    kind: "cover",
    kicker: "Patterns for Creativity",
    title: "AI can do your job... now what?",
    note: "A talk about the work that still belongs to humans.",
    visual: "cover",
  },
  {
    kicker: "Product loop",
    title: "Product work keeps returning to the same loop.",
    note: "At the center of product work, the same sequence appears again and again.",
    visual: "loop",
  },
  {
    kicker: "Role map",
    title: "The role labels hide the real pattern.",
    note: "Product, design, engineering, and support are not isolated lanes. They are names for where the loop usually shows up.",
    visual: "roles",
  },
  {
    kicker: "Deeper layers",
    title: "Every discipline runs the loop inside itself.",
    note: "Design has discovery, brainstorming, prototypes, and testing. Engineering has spikes, prototypes, production code, and observability.",
    visual: "nested",
  },
  {
    kicker: "The difference",
    title: "One stage is not like the others.",
    note: "Research, manufacturing, and feedback begin with a known target. Creativity begins before the target is clear.",
    visual: "oneDifferent",
  },
  {
    kicker: "AI fit",
    title: "AI is strongest when the outcome is already defined.",
    note: "When the work has a clear outcome, it can be handed to a workflow, an agent, a factory.",
    visual: "factory",
  },
  {
    kicker: "Handoff",
    title: "Let AI take the factory work.",
    note: "Make the well-defined work cheaper. Save your judgment for what should exist in the first place.",
    visual: "handoff",
  },
  {
    kind: "section",
    kicker: "Reset",
    title: "Your new job is creativity.",
    note: "Not as decoration. As leverage.",
    visual: "sectionCreativity",
  },
  {
    kicker: "Ownership",
    title: "Creativity is not owned by design.",
    note: "It is not just visual expression. It is the work of discovery when the answer is not obvious.",
    visual: "notDesign",
  },
  {
    kicker: "Definition",
    title: "Creativity starts when the answer is not obvious.",
    note: "It is exploring what is possible so you can figure out what is worth making.",
    visual: "unknown",
  },
  {
    kicker: "Leverage",
    title: "Before anything is made, someone decides what is worth making.",
    note: "That decision is where humans in the loop really matter.",
    visual: "decision",
  },
  {
    kicker: "The shape",
    title: "Creative work does not move in a straight line.",
    note: "Try something. Hit a wall. Keep a piece. Borrow unexpectedly. Return with more understanding.",
    visual: "messy",
  },
  {
    kicker: "Method",
    title: "There is method inside the chaos.",
    note: "The goal is not to manufacture creativity. The goal is to create conditions where the right idea becomes inevitable.",
    visual: "method",
  },
  {
    kicker: "Rhythm",
    title: "Creativity has a rhythm: expansion and contraction.",
    note: "Ask every question. Decide which answers matter. Repeat.",
    visual: "cycle",
  },
  {
    kind: "quote",
    kicker: "Output",
    title: "The output is understanding.",
    quote:
      "The output of creativity is not the artifacts you make along the way. The output is the understanding you gained while making them.",
    note: "The artifacts matter because they teach you how to recognize the right answer.",
    visual: "quote",
  },
  {
    kicker: "Two levers",
    title: "Two levers improve creativity: capacity and craft.",
    note: "Capacity raises the ceiling for ideas. Craft makes ideas real enough to learn from.",
    visual: "levers",
  },
  {
    kicker: "Capacity",
    title: "Capacity is the ceiling on ideas.",
    note: "Broad experiences expand what you can connect. Deep expertise contracts those connections into judgment.",
    visual: "capacity",
  },
  {
    kicker: "Catalysts",
    title: "Ideas are reactions.",
    note: "There is always a catalyst: frustration, delight, surprise, fear, boredom, envy, curiosity.",
    visual: "catalyst",
  },
  {
    kind: "pattern",
    kicker: "Pattern 01",
    title: "You cannot have ideas for things you never notice.",
    note: "The tiny pause after a reaction is where creativity begins.",
    visual: "notice",
  },
  {
    kicker: "Collect",
    title: "Collect the moments that made you pause.",
    note: "Build a library of raw material. A moment that does not click today may become useful a year later.",
    visual: "library",
  },
  {
    kind: "quote",
    kicker: "Formula",
    title: "Ideas need both experience and expertise.",
    quote: "Ideas are the result of viewing your experiences through the lens of your expertise.",
    note: "Experience supplies material. Expertise focuses it.",
    visual: "lens",
  },
  {
    kind: "pattern",
    kicker: "Pattern 02",
    title: "Try new things.",
    note: "Experiences do not live in isolation. They interact and create connections you could not make before.",
    visual: "constellation",
  },
  {
    kicker: "Compounding",
    title: "Experiences compound into connections.",
    note: "A game engine, a music tool, a synth, and a landing page can all become material for the same future idea.",
    visual: "compound",
  },
  {
    kicker: "Judgment",
    title: "Expertise turns many good ideas into better decisions.",
    note: "Understanding the domain helps you choose the solutions that actually matter.",
    visual: "funnel",
  },
  {
    kind: "pattern",
    kicker: "Pattern 03",
    title: "Always be learning.",
    note: "Use AI to learn language, build known things, and expand the map of what you understand.",
    visual: "learn",
  },
  {
    kind: "pattern",
    kicker: "Pattern 04",
    title: "Change your aperture.",
    note: "Zoom out: why is this needed, what happens before, and what should happen after?",
    visual: "aperture",
  },
  {
    kind: "pattern",
    kicker: "Pattern 05",
    title: "Language is power.",
    note: "AI does not care if you are an idiot. Use it to learn the language of the streams you are trying to swim in.",
    visual: "language",
  },
  {
    kicker: "Craft",
    title: "Craft brings the fantasy into contact with reality.",
    note: "In your head, the idea is perfect. The hard parts are hidden. Making exposes the truth.",
    visual: "reality",
  },
  {
    kind: "pattern",
    kicker: "Pattern 06",
    title: "Optimize for exploration.",
    note: "Stop asking the first idea to be good. Make starting less sacred.",
    visual: "exploration",
  },
  {
    kind: "pattern",
    kicker: "Pattern 07",
    title: "Shorten the loop.",
    note: "Ask: what is the one thing I am trying to learn, and what is the smallest thing I can make to learn it?",
    visual: "shorten",
  },
  {
    kind: "closing",
    kicker: "Close",
    title: "Let AI manufacture. You decide what is worth making.",
    note: "Creativity is not magic. It is a practice. It is not about being gifted. It is about being relentless.",
    visual: "closing",
  },
];

export function App() {
  if (window.location.pathname === "/prototype/simplex-foam") {
    return <SimplexFoamPrototype />;
  }

  if (window.location.pathname === "/cloud-contours") {
    return <CloudContourPage />;
  }

  return <SlideDeck />;
}

function SlideDeck() {
  const deckRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="reveal" ref={deckRef}>
      <div className="slides">
        {slides.map((slide, index) => (
          <section
            className={`talk-slide talk-slide--${slide.kind ?? "standard"} ${
              isDarkSlide(slide) ? "talk-slide--dark" : "talk-slide--paper"
            }`}
            key={`${slide.kicker}-${index}`}
          >
            <div className="slide-frame">
              <SlideContent slide={slide} index={index} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function SlideContent({ slide, index }: { slide: Slide; index: number }) {
  if (slide.kind === "cover") {
    return <CloudContourArtwork className="cloud-contour-stage--slide" />;
  }

  if (slide.kind === "section") {
    return (
      <div className="slide-section">
        <p className="kicker">{slide.kicker}</p>
        <h1>{slide.title}</h1>
        <p>{slide.note}</p>
        <Visual name={slide.visual} />
      </div>
    );
  }

  if (slide.kind === "quote") {
    return (
      <div className="slide-quote">
        <p className="kicker">{slide.kicker}</p>
        <h1>{slide.quote}</h1>
        <p>{slide.note}</p>
        <Footer index={index} />
      </div>
    );
  }

  if (slide.kind === "closing") {
    return (
      <div className="slide-closing">
        <p className="kicker">{slide.kicker}</p>
        <h1>
          <span>Let AI manufacture.</span>
          <strong>You decide what is worth making.</strong>
        </h1>
        <p>{slide.note}</p>
      </div>
    );
  }

  return (
    <div className="slide-standard">
      <div className="slide-copy">
        <p className="kicker">{slide.kicker}</p>
        <h1>{slide.title}</h1>
        <p className="slide-note">{slide.note}</p>
        <Footer index={index} />
      </div>
      <div className="slide-visual">
        <Visual name={slide.visual} />
      </div>
    </div>
  );
}

function Footer({ index }: { index: number }) {
  return (
    <footer>
      <span>{String(index + 1).padStart(2, "0")}</span>
      <span>Patterns for Creativity</span>
    </footer>
  );
}

function isDarkSlide(slide: Slide) {
  return ["cover", "section", "quote", "closing"].includes(slide.kind ?? "") || ["oneDifferent", "factory", "handoff", "messy"].includes(slide.visual);
}

function Visual({ name }: { name: VisualName }) {
  switch (name) {
    case "loop":
      return <LoopVisual />;
    case "roles":
      return <RoleMap />;
    case "nested":
      return <NestedLoop />;
    case "oneDifferent":
      return <OneDifferent />;
    case "factory":
      return <Factory />;
    case "handoff":
      return <Handoff />;
    case "sectionCreativity":
      return <QuestionOrb />;
    case "notDesign":
      return <NotDesign />;
    case "unknown":
      return <UnknownMap />;
    case "decision":
      return <DecisionGate />;
    case "messy":
      return <MessyPath />;
    case "method":
      return <MethodChaos />;
    case "cycle":
      return <Cycle />;
    case "levers":
      return <Levers />;
    case "capacity":
      return <Capacity />;
    case "catalyst":
      return <Catalyst />;
    case "notice":
      return <Notice />;
    case "library":
      return <Library />;
    case "lens":
      return <Lens />;
    case "constellation":
      return <Constellation />;
    case "compound":
      return <Compound />;
    case "funnel":
      return <Funnel />;
    case "learn":
      return <Learn />;
    case "aperture":
      return <Aperture />;
    case "language":
      return <Language />;
    case "reality":
      return <Reality />;
    case "exploration":
      return <Exploration />;
    case "shorten":
      return <Shorten />;
    default:
      return null;
  }
}

function Pill({ children, tone = "white" }: { children: ReactNode; tone?: "cyan" | "amber" | "green" | "coral" | "white" | "dark" }) {
  return <span className={`pill pill--${tone}`}>{children}</span>;
}

function Arrow() {
  return <span className="arrow">-&gt;</span>;
}

function LoopMini() {
  return (
    <div className="loop-mini">
      <Pill tone="cyan">Research</Pill>
      <Pill tone="amber">Creativity</Pill>
      <Pill tone="green">Manufacturing</Pill>
      <Pill tone="coral">Feedback</Pill>
    </div>
  );
}

function LoopVisual() {
  return (
    <div className="visual-center">
      <LoopMini />
      <p className="visual-callout">A product is never just built once. It keeps cycling.</p>
    </div>
  );
}

function RoleMap() {
  const rows = [
    ["Research", "Product"],
    ["Creativity", "Design"],
    ["Manufacturing", "Engineering"],
    ["Feedback", "Support"],
  ];
  return (
    <div className="role-map">
      {rows.map(([left, right]) => (
        <div className="map-row" key={left}>
          <Pill tone={left === "Creativity" ? "amber" : "white"}>{left}</Pill>
          <Arrow />
          <Pill tone="white">{right}</Pill>
        </div>
      ))}
    </div>
  );
}

function NestedLoop() {
  return (
    <div className="matrix">
      <strong>Design</strong>
      <strong>Engineering</strong>
      {["Discovery", "Spikes", "Brainstorming", "Prototypes", "Prototypes", "Production code", "User testing", "Observability"].map((label) => (
        <Pill key={label} tone={label === "Brainstorming" || label === "Prototypes" ? "amber" : "white"}>
          {label}
        </Pill>
      ))}
    </div>
  );
}

function OneDifferent() {
  return (
    <div className="stack-list">
      {[
        ["Research", "known topic"],
        ["Manufacturing", "known spec"],
        ["Feedback", "known system"],
        ["Creativity", "unknown outcome"],
      ].map(([label, detail]) => (
        <div className={label === "Creativity" ? "is-hot" : ""} key={label}>
          <Pill tone={label === "Creativity" ? "amber" : "dark"}>{label}</Pill>
          <span>{detail}</span>
        </div>
      ))}
    </div>
  );
}

function Factory() {
  return (
    <div className="factory">
      <Pill tone="dark">well-defined outcome</Pill>
      <Arrow />
      <Pill tone="cyan">AI workflow</Pill>
      <Arrow />
      <Pill tone="dark">factory output</Pill>
      <p>AI is not waiting for mystery. It is waiting for a target.</p>
    </div>
  );
}

function Handoff() {
  return (
    <div className="handoff">
      <div className="factory-row">
        <Pill tone="dark">Research</Pill>
        <Pill tone="dark">Manufacturing</Pill>
        <Pill tone="dark">Feedback</Pill>
      </div>
      <span className="small-label">make factories</span>
      <Pill tone="amber">Creativity</Pill>
    </div>
  );
}

function QuestionOrb() {
  return (
    <div className="question-orb">
      <span>?</span>
      <strong>unknown outcome</strong>
    </div>
  );
}

function NotDesign() {
  return (
    <div className="two-up">
      <Pill tone="white">not just visual polish</Pill>
      <Pill tone="amber">discovery under uncertainty</Pill>
      <p>Design has craft. It does not have a monopoly.</p>
    </div>
  );
}

function UnknownMap() {
  return (
    <div className="unknown-map">
      <Pill tone="white">known answer</Pill>
      <Arrow />
      <Pill tone="coral">unknown territory</Pill>
      <span className="question-dot">?</span>
      <p>creativity lives here</p>
    </div>
  );
}

function DecisionGate() {
  return (
    <div className="decision-gate">
      <Pill tone="white">possible ideas</Pill>
      <Arrow />
      <Pill tone="amber">worth making?</Pill>
      <Arrow />
      <Pill tone="cyan">factory work</Pill>
      <p>The gate is the leverage.</p>
    </div>
  );
}

function MessyPath() {
  const points = [
    [8, 78],
    [22, 24],
    [39, 58],
    [55, 18],
    [70, 80],
    [90, 36],
  ];
  return (
    <div className="messy-path">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <polyline points={points.map(([x, y]) => `${x},${y}`).join(" ")} />
        {points.map(([x, y], index) => (
          <circle className={index === points.length - 1 ? "final" : ""} cx={x} cy={y} key={`${x}-${y}`} r="3.6" />
        ))}
      </svg>
      <p>try / hit wall / keep a piece / return later</p>
    </div>
  );
}

function MethodChaos() {
  return (
    <div className="method-stack">
      {["Patterns", "Tools", "Practices", "Environment", "Inevitable"].map((label, index) => (
        <Pill tone={index === 4 ? "amber" : "white"} key={label}>
          {label}
        </Pill>
      ))}
    </div>
  );
}

function Cycle() {
  return (
    <div className="cycle">
      <div className="cycle-ring" />
      <Pill tone="amber">Expand: ask every question</Pill>
      <Pill tone="cyan">Contract: decide what matters</Pill>
      <strong>again and again</strong>
    </div>
  );
}

function Levers() {
  return (
    <div className="two-up lever">
      <Pill tone="amber">Capacity: come up with ideas</Pill>
      <Pill tone="green">Craft: make ideas real</Pill>
      <p>ceiling</p>
      <p>contact with reality</p>
    </div>
  );
}

function Capacity() {
  return (
    <div className="axis">
      <span className="axis-y">deep expertise</span>
      <span className="axis-x">broad experiences</span>
      <span className="idea-dot">ideas</span>
    </div>
  );
}

function Catalyst() {
  return (
    <div className="catalyst">
      {["reaction", "why?", "idea", "output"].map((label, index) => (
        <span key={label}>
          <Pill tone={index === 0 ? "coral" : index === 2 ? "amber" : "white"}>{label}</Pill>
          {index < 3 ? <Arrow /> : null}
        </span>
      ))}
      <p>frustration / delight / surprise / curiosity</p>
    </div>
  );
}

function Notice() {
  return (
    <div className="notice">
      <span>pause</span>
      <p>Why do I like this? Why do I hate this? How would I do it better?</p>
    </div>
  );
}

function Library() {
  return (
    <div className="library">
      {Array.from({ length: 9 }, (_, index) => (
        <span key={index} />
      ))}
      <p>drop in: swipe file / mymind / collage</p>
    </div>
  );
}

function Lens() {
  return (
    <div className="formula">
      <Pill tone="amber">experiences</Pill>
      <strong>+</strong>
      <Pill tone="cyan">expertise</Pill>
      <strong>=</strong>
      <Pill tone="green">ideas</Pill>
    </div>
  );
}

function Constellation() {
  return (
    <div className="constellation">
      {["game", "music", "synth", "page", "tool"].map((label, index) => (
        <span className={`node node-${index}`} key={label}>
          {label}
        </span>
      ))}
    </div>
  );
}

function Compound() {
  return (
    <div className="compound">
      <div>
        {["game engine", "Soundfall", "Synth", "landing page"].map((label) => (
          <Pill tone="white" key={label}>
            {label}
          </Pill>
        ))}
      </div>
      <Arrow />
      <Pill tone="amber">future idea</Pill>
    </div>
  );
}

function Funnel() {
  return (
    <div className="funnel">
      <Pill tone="white">1,000s of ideas</Pill>
      <Pill tone="amber">good ideas</Pill>
      <Pill tone="green">right solution</Pill>
      <p>understanding narrows the field</p>
    </div>
  );
}

function Learn() {
  return (
    <div className="learn-loop">
      <Pill tone="cyan">ask AI</Pill>
      <Pill tone="amber">build to learn</Pill>
      <Pill tone="green">name the pattern</Pill>
      <p>repeat until the domain gets less blurry</p>
    </div>
  );
}

function Aperture() {
  return (
    <div className="aperture">
      <span />
      <span />
      <span />
      <strong>why?</strong>
      <em>before</em>
      <b>after</b>
    </div>
  );
}

function Language() {
  return (
    <div className="language">
      {["words", "concepts", "models", "taste", "judgment"].map((label, index) => (
        <Pill tone={index === 4 ? "amber" : "white"} key={label}>
          {label}
        </Pill>
      ))}
      <p>AI can teach the vocabulary faster than pride will.</p>
    </div>
  );
}

function Reality() {
  return (
    <div className="reality">
      <Pill tone="white">idea in your head</Pill>
      <Arrow />
      <Pill tone="amber">made real</Pill>
      <p>edges become visible</p>
    </div>
  );
}

function Exploration() {
  return (
    <div className="exploration">
      {["paper", "constraints", "crazy eights", "with others"].map((label, index) => (
        <Pill tone={index === 2 ? "amber" : "white"} key={label}>
          {label}
        </Pill>
      ))}
      <p>make starting less sacred</p>
    </div>
  );
}

function Shorten() {
  return (
    <div className="shorten">
      <Pill tone="coral">question</Pill>
      <Pill tone="amber">smallest artifact</Pill>
      <Pill tone="green">signal</Pill>
      <p>moodboard / prototype / tool / slice</p>
      <strong>clarity &gt; perfection</strong>
    </div>
  );
}
