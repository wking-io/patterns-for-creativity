const C = {
  ink: "#08111F",
  ink2: "#0E1A2C",
  paper: "#F6EFE2",
  bone: "#FFF8EA",
  amber: "#F5B85C",
  cyan: "#54C7D4",
  coral: "#F16D5B",
  green: "#86C26A",
  mute: "#8B96A8",
  lineDark: "#233149",
  lineLight: "#D7CBB8",
};

const deck = [
  { kind: "cover", kicker: "PATTERNS FOR CREATIVITY", title: "AI can do your job... now what?", note: "A talk about the work that still belongs to humans.", viz: "cover" },
  { kicker: "PRODUCT LOOP", title: "Product work keeps returning to the same loop.", note: "At the center of product work, the same sequence appears again and again.", viz: "loop" },
  { kicker: "ROLE MAP", title: "The role labels hide the real pattern.", note: "Product, design, engineering, and support are not isolated lanes. They are names for where the loop usually shows up.", viz: "roles" },
  { kicker: "DEEPER LAYERS", title: "Every discipline runs the loop inside itself.", note: "Design has discovery, brainstorming, prototypes, and testing. Engineering has spikes, prototypes, production code, and observability.", viz: "nested" },
  { kicker: "THE DIFFERENCE", title: "One stage is not like the others.", note: "Research, manufacturing, and feedback all begin with a known target. Creativity begins before the target is clear.", viz: "oneDifferent" },
  { kicker: "AI FIT", title: "AI is strongest when the outcome is already defined.", note: "When the work has a clear outcome, it can be handed to a workflow, an agent, a factory.", viz: "factory" },
  { kicker: "HANDOFF", title: "Let AI take the factory work.", note: "Make the well-defined work cheaper. Save your judgment for what should exist in the first place.", viz: "handoff" },
  { kind: "section", kicker: "RESET", title: "Your new job is creativity.", note: "Not as decoration. As leverage.", viz: "sectionCreativity" },
  { kicker: "OWNERSHIP", title: "Creativity is not owned by design.", note: "It is not just visual expression. It is the work of discovery when the answer is not obvious.", viz: "notDesign" },
  { kicker: "DEFINITION", title: "Creativity starts when the answer is not obvious.", note: "It is exploring what is possible so you can figure out what is worth making.", viz: "unknownMap" },
  { kicker: "LEVERAGE", title: "Before anything is made, someone decides what is worth making.", note: "That decision is where humans in the loop really matter.", viz: "decisionGate" },
  { kicker: "THE SHAPE", title: "Creative work does not move in a straight line.", note: "You try something, hit a wall, keep a piece, abandon an idea, borrow unexpectedly, and return with more understanding.", viz: "messyPath" },
  { kicker: "METHOD", title: "There is method inside the chaos.", note: "The goal is not to manufacture creativity. The goal is to create conditions where the right idea becomes inevitable.", viz: "methodPath" },
  { kicker: "RHYTHM", title: "Creativity has a rhythm: expansion and contraction.", note: "Ask every question. Decide which answers matter. Repeat.", viz: "cycle" },
  { kind: "quote", kicker: "OUTPUT", title: "The output is understanding.", note: "The artifacts matter because they teach you how to recognize the right answer.", quote: "The output of creativity is not the artifacts you make along the way. The output is the understanding you gained while making them.", viz: "quote" },
  { kicker: "TWO LEVERS", title: "Two levers improve creativity: capacity and craft.", note: "Capacity raises the ceiling for ideas. Craft makes ideas real enough to learn from.", viz: "twoLevers" },
  { kicker: "CAPACITY", title: "Capacity is the ceiling on ideas.", note: "Broad experiences expand what you can connect. Deep expertise contracts those connections into judgment.", viz: "capacity" },
  { kicker: "CATALYSTS", title: "Ideas are reactions.", note: "There is always a catalyst: frustration, delight, surprise, fear, boredom, envy, curiosity.", viz: "catalyst" },
  { kind: "pattern", kicker: "PATTERN 01", title: "You cannot have ideas for things you never notice.", note: "The tiny pause after a reaction is where creativity begins.", viz: "notice" },
  { kicker: "COLLECT", title: "Collect the moments that made you pause.", note: "Build a library of raw material. A moment that does not click today may become useful a year later.", viz: "library" },
  { kind: "quote", kicker: "FORMULA", title: "Ideas need both experience and expertise.", note: "Experience supplies material. Expertise focuses it.", quote: "Ideas are the result of viewing your experiences through the lens of your expertise.", viz: "lens" },
  { kind: "pattern", kicker: "PATTERN 02", title: "Try new things.", note: "Experiences do not live in isolation. They interact and create connections you could not make before.", viz: "constellation" },
  { kicker: "COMPOUNDING", title: "Experiences compound into connections.", note: "A game engine, a music tool, a synth, and a landing page can all become material for the same future idea.", viz: "compound" },
  { kicker: "JUDGMENT", title: "Expertise turns many good ideas into better decisions.", note: "Understanding the domain helps you choose the solutions that actually matter.", viz: "funnel" },
  { kind: "pattern", kicker: "PATTERN 03", title: "Always be learning.", note: "Use AI to learn language, build known things, and expand the map of what you understand.", viz: "learn" },
  { kind: "pattern", kicker: "PATTERN 04", title: "Change your aperture.", note: "Zoom out: why is this needed, what happens before, and what should happen after?", viz: "aperture" },
  { kind: "pattern", kicker: "PATTERN 05", title: "Language is power.", note: "AI does not care if you are an idiot. Use it to learn the language of the streams you are trying to swim in.", viz: "language" },
  { kicker: "CRAFT", title: "Craft brings the fantasy into contact with reality.", note: "In your head, the idea is perfect. The hard parts are hidden. Making exposes the truth.", viz: "reality" },
  { kind: "pattern", kicker: "PATTERN 06", title: "Optimize for exploration.", note: "Stop asking the first idea to be good. Make starting less sacred.", viz: "exploration" },
  { kind: "pattern", kicker: "PATTERN 07", title: "Shorten the loop.", note: "Ask: what is the one thing I am trying to learn, and what is the smallest thing I can make to learn it?", viz: "shorten" },
  { kind: "closing", kicker: "CLOSE", title: "Let AI manufacture. You decide what is worth making.", note: "Creativity is not magic. It is a practice. It is not about being gifted. It is about being relentless.", viz: "closing" },
];

export async function addDraftSlide(presentation, ctx, number) {
  const spec = deck[number - 1];
  const slide = presentation.slides.add();
  drawBackground(slide, ctx, spec);
  if (spec.kind === "cover") drawCover(slide, ctx, spec);
  else if (spec.kind === "section") drawSection(slide, ctx, spec);
  else if (spec.kind === "quote") drawQuote(slide, ctx, spec);
  else if (spec.kind === "closing") drawClosing(slide, ctx, spec);
  else drawStandard(slide, ctx, spec);
  return slide;
}

function dark(spec) {
  return spec.kind === "cover" || spec.kind === "section" || spec.kind === "quote" || spec.kind === "closing" || ["factory", "handoff", "oneDifferent", "messyPath"].includes(spec.viz);
}

function drawBackground(slide, ctx, spec) {
  const isDark = dark(spec);
  ctx.addShape(slide, { x: 0, y: 0, w: ctx.W, h: ctx.H, fill: isDark ? C.ink : C.paper });
  if (isDark) {
    ctx.addShape(slide, { x: 0, y: 0, w: ctx.W, h: 720, fill: "linear(135deg, #08111F 0%, #0E1A2C 58%, #102C38 100%)" });
  }
}

function drawHeader(slide, ctx, spec) {
  const isDark = dark(spec);
  text(ctx, slide, spec.kicker, 64, 48, 260, 22, 11, isDark ? C.amber : C.coral, true);
  text(ctx, slide, spec.title, 64, 82, 650, 150, 42, isDark ? C.bone : C.ink, true, "Aptos Display");
  if (spec.note) text(ctx, slide, spec.note, 66, 602, 740, 54, 19, isDark ? "#CAD3DF" : "#425069");
  footer(slide, ctx, spec);
}

function drawStandard(slide, ctx, spec) {
  drawHeader(slide, ctx, spec);
  const box = { x: 780, y: 84, w: 424, h: 500 };
  visuals[spec.viz]?.(slide, ctx, box, spec);
}

function drawCover(slide, ctx, spec) {
  text(ctx, slide, spec.kicker, 72, 70, 440, 22, 12, C.amber, true);
  text(ctx, slide, "AI can do your job", 72, 150, 850, 80, 66, C.bone, true, "Aptos Display");
  text(ctx, slide, "...now what?", 72, 232, 700, 84, 70, C.amber, true, "Aptos Display");
  text(ctx, slide, spec.note, 76, 345, 550, 64, 23, "#D7E2EA");
  loopMini(slide, ctx, 78, 510, 760, true);
  ctx.addShape(slide, { x: 968, y: 0, w: 312, h: 720, fill: C.paper });
  text(ctx, slide, "Creativity is the work before the outcome is obvious.", 1008, 96, 200, 370, 34, C.ink, true, "Aptos Display");
  text(ctx, slide, "First draft slide deck", 1012, 612, 190, 20, 13, "#536172", true);
}

function drawSection(slide, ctx, spec) {
  text(ctx, slide, spec.kicker, 88, 86, 180, 20, 11, C.amber, true);
  text(ctx, slide, spec.title, 86, 170, 930, 180, 72, C.bone, true, "Aptos Display");
  text(ctx, slide, spec.note, 92, 382, 440, 40, 24, "#D5DFE8");
  ctx.addShape(slide, { x: 870, y: 130, w: 260, h: 260, geometry: "ellipse", fill: "#F5B85C33", line: ctx.line(C.amber, 2) });
  text(ctx, slide, "?", 948, 160, 110, 130, 112, C.amber, true, "Aptos Display", "center", "middle");
  text(ctx, slide, "unknown\noutcome", 916, 302, 170, 70, 27, C.bone, true, "Aptos Display", "center", "middle");
}

function drawQuote(slide, ctx, spec) {
  text(ctx, slide, spec.kicker, 88, 80, 200, 20, 11, C.amber, true);
  text(ctx, slide, spec.quote, 88, 150, 990, 250, 47, C.bone, true, "Aptos Display");
  text(ctx, slide, spec.note, 94, 474, 660, 62, 22, "#D0D9E4");
  ctx.addShape(slide, { x: 88, y: 424, w: 980, h: 2, fill: C.amber });
  footer(slide, ctx, spec);
}

function drawClosing(slide, ctx, spec) {
  text(ctx, slide, spec.kicker, 76, 70, 180, 20, 11, C.amber, true);
  text(ctx, slide, "Let AI\nmanufacture.", 76, 134, 455, 180, 62, C.cyan, true, "Aptos Display");
  text(ctx, slide, "You decide\nwhat is worth\nmaking.", 600, 134, 520, 230, 62, C.bone, true, "Aptos Display");
  ctx.addShape(slide, { x: 76, y: 438, w: 1040, h: 1.5, fill: "#FFFFFF44" });
  text(ctx, slide, spec.note, 80, 476, 820, 72, 25, "#DDE6EA");
}

function footer(slide, ctx, spec) {
  const isDark = dark(spec);
  text(ctx, slide, String(deck.indexOf(spec) + 1).padStart(2, "0"), 64, 675, 34, 16, 10, isDark ? "#91A0B3" : "#687487", true);
  text(ctx, slide, "Patterns for Creativity", 108, 675, 170, 16, 10, isDark ? "#738196" : "#7A715F");
}

function text(ctx, slide, value, x, y, w, h, size, color, bold = false, face = "Aptos", align = "left", valign = "top") {
  return ctx.addText(slide, {
    text: value,
    x, y, w, h,
    fontSize: size,
    color,
    bold,
    typeface: face,
    align,
    valign,
    insets: { left: 2, right: 2, top: 2, bottom: 2 },
  });
}

function pill(ctx, slide, label, x, y, w, color, darkText = true) {
  ctx.addShape(slide, { x, y, w, h: 42, fill: color, line: ctx.line("#00000000", 0) });
  text(ctx, slide, label, x + 12, y + 9, w - 24, 20, 16, darkText ? C.ink : C.bone, true, "Aptos", "center", "middle");
}

function box(ctx, slide, label, x, y, w, h, fill, color, line = "#00000000", size = 20) {
  ctx.addShape(slide, { x, y, w, h, fill, line: ctx.line(line, line === "#00000000" ? 0 : 1.5) });
  text(ctx, slide, label, x + 16, y + 16, w - 32, h - 28, size, color, true, "Aptos Display", "center", "middle");
}

function hline(ctx, slide, x, y, w, color = C.mute, h = 2) {
  ctx.addShape(slide, { x, y, w, h, fill: color });
}

function vline(ctx, slide, x, y, h, color = C.mute, w = 2) {
  ctx.addShape(slide, { x, y, w, h, fill: color });
}

function loopMini(slide, ctx, x, y, w, isDark) {
  const labels = ["Research", "Creativity", "Manufacturing", "Feedback"];
  const colors = [C.cyan, C.amber, C.green, C.coral];
  const gap = 18;
  const itemW = (w - gap * 3) / 4;
  labels.forEach((label, i) => {
    pill(ctx, slide, label, x + i * (itemW + gap), y, itemW, colors[i]);
    if (i < labels.length - 1) text(ctx, slide, "->", x + itemW + i * (itemW + gap) + 2, y + 7, 24, 20, 18, isDark ? C.bone : C.ink, true);
  });
}

const visuals = {
  loop(slide, ctx, b) {
    loopMini(slide, ctx, b.x - 40, 230, 500, false);
    text(ctx, slide, "A product is never just built once. It keeps cycling.", b.x + 22, 330, 330, 64, 24, C.ink, true, "Aptos Display", "center");
  },
  roles(slide, ctx, b) {
    const rows = [["Research", "Product"], ["Creativity", "Design"], ["Manufacturing", "Engineering"], ["Feedback", "Support"]];
    rows.forEach((r, i) => {
      const y = 118 + i * 102;
      box(ctx, slide, r[0], b.x - 34, y, 185, 64, i === 1 ? C.amber : "#FFFFFF99", C.ink, "#D6C8B4", 19);
      text(ctx, slide, "->", b.x + 168, y + 21, 28, 20, 20, C.coral, true);
      box(ctx, slide, r[1], b.x + 210, y, 185, 64, "#FFFFFFCC", C.ink, "#D6C8B4", 19);
    });
  },
  nested(slide, ctx, b) {
    const cols = ["Design", "Engineering"];
    const rows = [["Discovery", "Spikes"], ["Brainstorming", "Prototypes"], ["Prototypes", "Production code"], ["User testing", "Observability"]];
    cols.forEach((c, i) => text(ctx, slide, c, b.x + i * 208, 104, 170, 24, 20, C.ink, true, "Aptos Display", "center"));
    rows.forEach((r, row) => r.forEach((val, col) => box(ctx, slide, val, b.x + col * 208, 150 + row * 82, 174, 54, row === 1 ? "#F5B85C" : "#FFFFFFB8", C.ink, "#D6C8B4", 16)));
  },
  oneDifferent(slide, ctx, b) {
    const items = [["Research", "known topic"], ["Manufacturing", "known spec"], ["Feedback", "known system"], ["Creativity", "unknown outcome"]];
    items.forEach((item, i) => {
      const y = 112 + i * 96;
      const hot = i === 3;
      box(ctx, slide, item[0], b.x - 20, y, 200, 58, hot ? C.amber : "#FFFFFF1F", hot ? C.ink : C.bone, hot ? C.amber : "#FFFFFF30", 19);
      text(ctx, slide, item[1], b.x + 206, y + 18, 190, 20, 18, hot ? C.amber : "#C8D4E0", true);
    });
  },
  factory(slide, ctx, b) {
    box(ctx, slide, "well-defined\noutcome", b.x - 72, 138, 150, 94, "#FFFFFF20", C.bone, "#FFFFFF38", 19);
    text(ctx, slide, "->", b.x + 90, 168, 34, 28, 24, C.cyan, true);
    box(ctx, slide, "AI\nworkflow", b.x + 132, 120, 132, 130, C.cyan, C.ink, C.cyan, 24);
    text(ctx, slide, "->", b.x + 276, 168, 34, 28, 24, C.cyan, true);
    box(ctx, slide, "factory\noutput", b.x + 318, 138, 142, 94, "#FFFFFF20", C.bone, "#FFFFFF38", 19);
    hline(ctx, slide, b.x - 70, 330, 528, "#FFFFFF35", 2);
    text(ctx, slide, "AI is not waiting for mystery.\nIt is waiting for a target.", b.x - 18, 370, 410, 70, 27, C.bone, true, "Aptos Display", "center");
  },
  handoff(slide, ctx, b) {
    box(ctx, slide, "Research", b.x - 10, 132, 136, 70, "#54C7D433", C.bone, "#54C7D4", 18);
    box(ctx, slide, "Manufacturing", b.x + 150, 132, 158, 70, "#54C7D433", C.bone, "#54C7D4", 18);
    box(ctx, slide, "Feedback", b.x + 330, 132, 136, 70, "#54C7D433", C.bone, "#54C7D4", 18);
    box(ctx, slide, "Creativity", b.x + 106, 312, 250, 118, C.amber, C.ink, C.amber, 32);
    text(ctx, slide, "make factories", b.x + 142, 222, 180, 20, 18, C.cyan, true, "Aptos", "center");
    vline(ctx, slide, b.x + 230, 238, 66, C.cyan, 2);
  },
  notDesign(slide, ctx, b) {
    box(ctx, slide, "not just\nvisual polish", b.x - 10, 150, 190, 130, "#FFFFFFB8", C.ink, "#D6C8B4", 24);
    box(ctx, slide, "discovery\nunder uncertainty", b.x + 218, 150, 210, 130, C.amber, C.ink, C.amber, 24);
    text(ctx, slide, "Design has craft.\nIt does not have a monopoly.", b.x + 14, 330, 360, 66, 24, C.ink, true, "Aptos Display", "center");
  },
  unknownMap(slide, ctx, b) {
    box(ctx, slide, "known\nanswer", b.x - 20, 130, 150, 94, "#FFFFFFBB", C.ink, "#D6C8B4", 21);
    box(ctx, slide, "unknown\nterritory", b.x + 222, 104, 190, 150, C.coral, C.bone, C.coral, 25);
    hline(ctx, slide, b.x + 132, 176, 88, C.mute, 2);
    text(ctx, slide, "creativity lives here", b.x + 210, 285, 210, 26, 18, C.coral, true, "Aptos", "center");
    ctx.addShape(slide, { x: b.x + 274, y: 348, w: 86, h: 86, geometry: "ellipse", fill: C.amber });
    text(ctx, slide, "?", b.x + 301, 354, 36, 44, 42, C.ink, true, "Aptos Display", "center", "middle");
  },
  decisionGate(slide, ctx, b) {
    box(ctx, slide, "possible\nideas", b.x - 48, 134, 148, 100, "#FFFFFFB8", C.ink, "#D6C8B4", 20);
    box(ctx, slide, "worth\nmaking?", b.x + 132, 118, 176, 132, C.amber, C.ink, C.amber, 26);
    box(ctx, slide, "factory\nwork", b.x + 338, 134, 136, 100, "#54C7D455", C.ink, C.cyan, 20);
    hline(ctx, slide, b.x + 102, 184, 28, C.mute, 2);
    hline(ctx, slide, b.x + 310, 184, 26, C.mute, 2);
    text(ctx, slide, "The gate is the leverage.", b.x + 58, 314, 310, 34, 28, C.ink, true, "Aptos Display", "center");
  },
  messyPath(slide, ctx, b) {
    const pts = [[b.x - 20, 390], [b.x + 80, 190], [b.x + 170, 300], [b.x + 260, 150], [b.x + 330, 370], [b.x + 442, 210]];
    pts.forEach((p, i) => {
      if (i > 0) {
        const prev = pts[i - 1];
        hline(ctx, slide, Math.min(prev[0], p[0]) + 20, (prev[1] + p[1]) / 2, Math.abs(p[0] - prev[0]) + 30, "#FFFFFF33", 3);
      }
      ctx.addShape(slide, { x: p[0], y: p[1], w: 34, h: 34, geometry: "ellipse", fill: i === pts.length - 1 ? C.amber : C.coral });
    });
    text(ctx, slide, "try\nhit wall\nkeep a piece\nreturn later", b.x + 78, 442, 320, 68, 22, C.bone, true, "Aptos Display", "center");
  },
  methodPath(slide, ctx, b) {
    const labels = ["Patterns", "Tools", "Practices", "Environment", "Inevitable"];
    labels.forEach((l, i) => box(ctx, slide, l, b.x - 26 + (i % 2) * 230, 112 + i * 72, 184, 48, i === 4 ? C.amber : "#FFFFFFBB", C.ink, "#D6C8B4", 17));
  },
  cycle(slide, ctx, b) {
    ctx.addShape(slide, { x: b.x + 32, y: 132, w: 330, h: 330, geometry: "ellipse", fill: "#FFFFFF00", line: ctx.line(C.lineDark, 3) });
    box(ctx, slide, "EXPAND\nask every question", b.x - 16, 214, 170, 96, C.amber, C.ink, C.amber, 21);
    box(ctx, slide, "CONTRACT\ndecide what matters", b.x + 244, 284, 190, 96, C.cyan, C.ink, C.cyan, 21);
    text(ctx, slide, "again\nand again", b.x + 150, 238, 120, 76, 30, C.ink, true, "Aptos Display", "center", "middle");
  },
  twoLevers(slide, ctx, b) {
    box(ctx, slide, "Capacity\ncome up with ideas", b.x - 24, 124, 210, 170, C.amber, C.ink, C.amber, 25);
    box(ctx, slide, "Craft\nmake ideas real", b.x + 220, 124, 210, 170, C.green, C.ink, C.green, 25);
    text(ctx, slide, "ceiling", b.x + 36, 326, 90, 22, 18, C.coral, true, "Aptos", "center");
    text(ctx, slide, "contact with reality", b.x + 238, 326, 190, 22, 18, C.coral, true, "Aptos", "center");
  },
  capacity(slide, ctx, b) {
    vline(ctx, slide, b.x + 70, 138, 300, C.lineDark, 3);
    hline(ctx, slide, b.x + 70, 438, 320, C.lineDark, 3);
    text(ctx, slide, "deep\nexpertise", b.x - 20, 120, 85, 70, 18, C.ink, true, "Aptos", "center");
    text(ctx, slide, "broad experiences", b.x + 174, 448, 190, 24, 18, C.ink, true, "Aptos", "center");
    ctx.addShape(slide, { x: b.x + 246, y: 214, w: 88, h: 88, geometry: "ellipse", fill: C.amber });
    text(ctx, slide, "ideas", b.x + 260, 246, 60, 20, 18, C.ink, true, "Aptos", "center");
  },
  catalyst(slide, ctx, b) {
    const labels = ["reaction", "why?", "idea", "output"];
    labels.forEach((l, i) => {
      box(ctx, slide, l, b.x - 10 + i * 118, 190 + (i % 2) * 50, 98, 64, i === 0 ? C.coral : i === 2 ? C.amber : "#FFFFFFBB", C.ink, "#D6C8B4", 18);
      if (i < 3) text(ctx, slide, "->", b.x + 92 + i * 118, 212 + (i % 2) * 50, 24, 18, 18, C.ink, true);
    });
    text(ctx, slide, "frustration / delight / surprise / curiosity", b.x - 20, 340, 430, 36, 20, "#536172", true, "Aptos Display", "center");
  },
  notice(slide, ctx, b) {
    ctx.addShape(slide, { x: b.x + 118, y: 138, w: 190, h: 190, geometry: "ellipse", fill: C.amber });
    text(ctx, slide, "pause", b.x + 154, 198, 118, 40, 38, C.ink, true, "Aptos Display", "center", "middle");
    text(ctx, slide, "Why do I like this?\nWhy do I hate this?\nHow would I do it better?", b.x + 8, 370, 410, 86, 22, C.ink, true, "Aptos Display", "center");
  },
  library(slide, ctx, b) {
    for (let i = 0; i < 9; i++) {
      const x = b.x - 20 + (i % 3) * 138;
      const y = 118 + Math.floor(i / 3) * 104;
      ctx.addShape(slide, { x, y, w: 112, h: 78, fill: i % 3 === 0 ? C.amber : i % 3 === 1 ? C.cyan : C.coral, line: ctx.line("#00000000", 0) });
    }
    text(ctx, slide, "drop in:\nswipe file / mymind / collage", b.x + 26, 452, 330, 58, 21, C.ink, true, "Aptos Display", "center");
  },
  lens(slide, ctx, b) {
    box(ctx, slide, "experiences", b.x - 34, 172, 170, 86, C.amber, C.ink, C.amber, 22);
    text(ctx, slide, "+", b.x + 156, 193, 32, 28, 30, C.bone, true);
    box(ctx, slide, "expertise", b.x + 202, 172, 160, 86, C.cyan, C.ink, C.cyan, 22);
    text(ctx, slide, "=", b.x + 382, 193, 32, 28, 30, C.bone, true);
    box(ctx, slide, "ideas", b.x + 430, 172, 116, 86, C.green, C.ink, C.green, 22);
  },
  constellation(slide, ctx, b) {
    const pts = [[0, 0, C.amber, "game"], [160, 40, C.cyan, "music"], [82, 170, C.coral, "synth"], [248, 218, C.green, "page"], [330, 104, C.amber, "tool"]];
    pts.forEach((p) => ctx.addShape(slide, { x: b.x + p[0], y: 130 + p[1], w: 72, h: 72, geometry: "ellipse", fill: p[2] }));
    pts.forEach((p) => text(ctx, slide, p[3], b.x + p[0] + 8, 130 + p[1] + 24, 56, 18, 14, C.ink, true, "Aptos", "center"));
    hline(ctx, slide, b.x + 68, 168, 115, "#8B96A855", 2);
    hline(ctx, slide, b.x + 130, 328, 160, "#8B96A855", 2);
    hline(ctx, slide, b.x + 232, 210, 138, "#8B96A855", 2);
  },
  compound(slide, ctx, b) {
    ["game engine", "Soundfall", "Synth", "landing page"].forEach((l, i) => box(ctx, slide, l, b.x - 16, 120 + i * 84, 250, 52, "#FFFFFFB8", C.ink, "#D6C8B4", 17));
    box(ctx, slide, "future\nidea", b.x + 292, 218, 142, 112, C.amber, C.ink, C.amber, 25);
    hline(ctx, slide, b.x + 236, 146, 54, C.mute, 2);
    hline(ctx, slide, b.x + 236, 230, 54, C.mute, 2);
    hline(ctx, slide, b.x + 236, 314, 54, C.mute, 2);
    hline(ctx, slide, b.x + 236, 398, 54, C.mute, 2);
  },
  funnel(slide, ctx, b) {
    box(ctx, slide, "1,000s\nof ideas", b.x + 18, 118, 360, 80, "#FFFFFFBB", C.ink, "#D6C8B4", 26);
    box(ctx, slide, "good\nideas", b.x + 68, 250, 260, 72, C.amber, C.ink, C.amber, 24);
    box(ctx, slide, "right\nsolution", b.x + 118, 374, 160, 72, C.green, C.ink, C.green, 23);
    text(ctx, slide, "understanding narrows the field", b.x + 10, 478, 380, 26, 20, "#536172", true, "Aptos Display", "center");
  },
  learn(slide, ctx, b) {
    box(ctx, slide, "ask AI", b.x - 10, 150, 130, 70, C.cyan, C.ink, C.cyan, 21);
    box(ctx, slide, "build to\nlearn", b.x + 150, 150, 150, 70, C.amber, C.ink, C.amber, 21);
    box(ctx, slide, "name the\npattern", b.x + 330, 150, 150, 70, C.green, C.ink, C.green, 21);
    text(ctx, slide, "repeat until the domain gets less blurry", b.x + 24, 306, 390, 54, 28, C.ink, true, "Aptos Display", "center");
  },
  aperture(slide, ctx, b) {
    [330, 250, 170].forEach((s, i) => ctx.addShape(slide, { x: b.x + 208 - s / 2, y: 142 + i * 34, w: s, h: s, geometry: "ellipse", fill: "#00000000", line: ctx.line([C.lineLight, C.amber, C.coral][i], 2) }));
    text(ctx, slide, "why?", b.x + 170, 182, 84, 24, 24, C.ink, true, "Aptos Display", "center");
    text(ctx, slide, "before", b.x + 110, 278, 80, 20, 18, C.ink, true, "Aptos", "center");
    text(ctx, slide, "after", b.x + 234, 278, 80, 20, 18, C.ink, true, "Aptos", "center");
  },
  language(slide, ctx, b) {
    ["words", "concepts", "models", "taste", "judgment"].forEach((l, i) => box(ctx, slide, l, b.x + i * 72, 410 - i * 62, 112, 44, i === 4 ? C.amber : "#FFFFFFBB", C.ink, "#D6C8B4", 17));
    text(ctx, slide, "AI can teach the vocabulary faster than pride will.", b.x + 10, 474, 390, 42, 22, C.ink, true, "Aptos Display", "center");
  },
  reality(slide, ctx, b) {
    box(ctx, slide, "idea in\nyour head", b.x - 24, 150, 170, 120, "#FFFFFFBB", C.ink, "#D6C8B4", 24);
    text(ctx, slide, "->", b.x + 170, 194, 38, 28, 28, C.coral, true);
    box(ctx, slide, "made\nreal", b.x + 232, 150, 170, 120, C.amber, C.ink, C.amber, 28);
    text(ctx, slide, "edges become visible", b.x + 38, 336, 304, 34, 27, C.ink, true, "Aptos Display", "center");
  },
  exploration(slide, ctx, b) {
    ["paper", "constraints", "crazy eights", "with others"].forEach((l, i) => box(ctx, slide, l, b.x - 16 + (i % 2) * 220, 132 + Math.floor(i / 2) * 126, 178, 84, i === 2 ? C.amber : "#FFFFFFBB", C.ink, "#D6C8B4", 19));
    text(ctx, slide, "make starting less sacred", b.x + 38, 420, 330, 34, 27, C.ink, true, "Aptos Display", "center");
  },
  shorten(slide, ctx, b) {
    box(ctx, slide, "question", b.x - 10, 146, 130, 64, C.coral, C.bone, C.coral, 20);
    box(ctx, slide, "smallest\nartifact", b.x + 152, 124, 150, 108, C.amber, C.ink, C.amber, 21);
    box(ctx, slide, "signal", b.x + 334, 146, 122, 64, C.green, C.ink, C.green, 20);
    text(ctx, slide, "moodboard / prototype / tool / slice", b.x + 10, 326, 390, 34, 22, C.ink, true, "Aptos Display", "center");
    text(ctx, slide, "clarity > perfection", b.x + 58, 410, 300, 34, 28, C.coral, true, "Aptos Display", "center");
  },
};
