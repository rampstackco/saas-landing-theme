/**
 * saas-landing-theme / contrast verification
 *
 * Every contrast ratio written into tokens.css is computed here from the
 * values in that file, so the comments cannot drift away from the palette
 * they describe. Change a hex in tokens.css and rerun; a pairing that stops
 * clearing its floor fails the run.
 *
 *   node verify/contrast.mjs
 *
 * No dependencies. Exit code is 0 when every pairing clears its floor.
 *
 * Two floors are used, from WCAG 2.1:
 *
 *   4.5:1  text, at the sizes this theme uses for text
 *   3.0:1  non-text, for the lines that tell a reader where a control is
 *
 * The gradient endpoints are checked as separate grounds. A wash from
 * brand-soft to ground puts text over both ends of the range at different
 * points down the page, and checking only the token named "ground" would miss
 * the half of the hero that is not sitting on it.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "..", "tokens", "tokens.css"), "utf8");

const tokens = new Map();
for (const m of src.matchAll(/^\s*(--sl-[a-z0-9-]+):\s*(#[0-9a-f]{6})\s*;/gim)) {
  tokens.set(m[1], m[2].toLowerCase());
}

const channel = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const TEXT = 4.5;
const UI = 3.0;

/** [foreground token, background token, floor, where it appears] */
const PAIRS = [
  ["--sl-ink", "--sl-ground", TEXT, "body copy on the page"],
  ["--sl-ink", "--sl-surface", TEXT, "card and plan copy"],
  ["--sl-ink", "--sl-surface-muted", TEXT, "table headers, frame bar"],
  ["--sl-ink", "--sl-brand-soft", TEXT, "hero copy at the top of the wash"],

  ["--sl-ink-muted", "--sl-ground", TEXT, "section leads"],
  ["--sl-ink-muted", "--sl-surface", TEXT, "card body, plan features"],
  ["--sl-ink-muted", "--sl-surface-muted", TEXT, "the neutral badge"],
  ["--sl-ink-muted", "--sl-brand-soft", TEXT, "hero lead at the top of the wash"],

  ["--sl-ink-subtle", "--sl-ground", TEXT, "captions, footer"],
  ["--sl-ink-subtle", "--sl-surface", TEXT, "table caption, quote attribution"],
  ["--sl-ink-subtle", "--sl-surface-muted", TEXT, "the product frame's title bar"],
  ["--sl-ink-subtle", "--sl-brand-soft", TEXT, "the hero note under the buttons"],

  ["--sl-brand", "--sl-ground", TEXT, "eyebrows, ghost buttons"],
  ["--sl-brand", "--sl-surface", TEXT, "links on a card"],
  ["--sl-brand", "--sl-brand-soft", TEXT, "the feature icon"],
  ["--sl-brand-strong", "--sl-brand-soft", TEXT, "the brand badge"],
  ["--sl-brand-ink", "--sl-brand", TEXT, "the primary button"],
  ["--sl-brand-ink", "--sl-brand-strong", TEXT, "the primary button, hovered"],
  ["--sl-brand-strong", "--sl-ink-invert", TEXT, "the inverted button on the dark band"],
  ["--sl-brand-strong", "--sl-brand-soft", TEXT, "the inverted button, hovered"],

  ["--sl-success", "--sl-surface", TEXT, "the tick in a plan feature list"],
  ["--sl-success", "--sl-success-soft", TEXT, "the success badge"],
  ["--sl-warning", "--sl-surface", TEXT, "warning text"],
  ["--sl-warning", "--sl-warning-soft", TEXT, "the warning badge"],
  ["--sl-danger", "--sl-surface", TEXT, "field errors"],
  ["--sl-danger", "--sl-danger-soft", TEXT, "the danger badge"],
  ["--sl-danger-ink", "--sl-danger", TEXT, "the destructive button"],

  ["--sl-ink-invert", "--sl-surface-invert", TEXT, "the dark band, gradient start"],
  ["--sl-ink-invert", "--sl-brand-strong", TEXT, "the dark band, gradient end"],
  ["--sl-ink-invert-muted", "--sl-surface-invert", TEXT, "the dark band lead, gradient start"],
  ["--sl-ink-invert-muted", "--sl-brand-strong", TEXT, "the dark band lead, gradient end"],

  ["--sl-border-control", "--sl-surface", UI, "input and secondary button edges"],
  ["--sl-border-control", "--sl-ground", UI, "the same edges on the page ground"],
  ["--sl-border-control", "--sl-surface-muted", UI, "the same edges in a well"],
  ["--sl-brand", "--sl-ground", UI, "the focus ring on the page"],
  ["--sl-brand", "--sl-surface", UI, "the focus ring on a card"],
  ["--sl-brand", "--sl-brand-soft", UI, "the recommended plan's border"],
];

let failures = 0;
const width = Math.max(...PAIRS.map(([f, b]) => f.length + b.length)) + 4;

for (const [fg, bg, floor, where] of PAIRS) {
  const a = tokens.get(fg);
  const b = tokens.get(bg);
  if (!a || !b) {
    console.log(`MISSING  ${fg} or ${bg} is not a hex token in tokens.css`);
    failures++;
    continue;
  }
  const r = ratio(a, b);
  const ok = r >= floor;
  if (!ok) failures++;
  const label = `${fg} on ${bg}`.padEnd(width);
  console.log(
    `${ok ? "pass" : "FAIL"}  ${label}  ${r.toFixed(2)}:1  (floor ${floor.toFixed(1)})  ${where}`
  );
}

console.log("");
if (failures) {
  console.log(`${failures} of ${PAIRS.length} pairings are below their floor.`);
  process.exit(1);
}
console.log(`All ${PAIRS.length} pairings clear their floor.`);
