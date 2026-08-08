/**
 * saas-landing-theme / Tailwind v4 namespace probe
 *
 * The companion to namespaces.mjs. That file proves what this theme's adapter
 * does generate. This one probes what it cannot, which is the harder half:
 * every "X does not work" sentence in theme.css is produced here rather than
 * inferred from the documentation.
 *
 * What it establishes:
 *
 *   Causation. The control run deletes five namespace lines and nothing else.
 *   Eight utilities disappear with them, so those lines are what produce
 *   those rules.
 *
 *   Silence. --border-style-*, --gradient-* and --duration-* are declared
 *   here with sentinel values and emit nothing at all. A namespace Tailwind
 *   does not process fails without an error, which is the failure the whole
 *   verification exists to catch.
 *
 *   The two hint traps. border-(--var) and bg-(--var) compile, and set
 *   border-color and background-color rather than a width and an image.
 *
 *   The --columns-* trap. It generates, and what it generates is CSS
 *   multi-column layout rather than a grid.
 *
 * Every candidate carries a suffix unique to its namespace as well as a
 * unique sentinel value. That is not tidiness. With one shared suffix,
 * --color-* answers for border-sl-probe and the border-width line looks
 * proven while doing nothing: a confounded probe reads exactly like a clean
 * one. Stock p-4 is present in every run, including the control, so an absent
 * utility means an absent utility rather than a broken build.
 *
 *   npm install --no-save tailwindcss@4 @tailwindcss/postcss@4 postcss
 *   node verify/probe.mjs           full run
 *   node verify/probe.mjs control   the same run, five lines deleted
 */
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

const CONTROL = process.argv[2] === "control";

const THEME_LINES = [
  ["color", "--color-sl-kolor: #010203;"],
  ["shadow", "--shadow-sl-shad: 0 11px 0 0 #040506;"],
  ["radius", "--radius-sl-rad: 13px;"],
  ["border-width", "--border-width-sl-bw: 7px;"],
  ["font", "--font-sl-face: ProbeFace, serif;"],
  ["font-weight", "--font-weight-sl-wt: 533;"],
  ["text", "--text-sl-size: 3.33rem;"],
  ["leading", "--leading-sl-lead: 1.77;"],
  ["tracking", "--tracking-sl-track: 0.099em;"],
  ["spacing", "--spacing-sl-space: 29px;"],
  ["container", "--container-sl-cont: 1199px;"],
  ["ease", "--ease-sl-ease: cubic-bezier(0.11, 0, 0.22, 1);"],
  ["grid-template-columns", "--grid-template-columns-sl-cols: repeat(3, minmax(0, 1fr));"],
  ["background-image", "--background-image-sl-bgi: linear-gradient(180deg, #070809 0%, #0a0b0c 100%);"],
  ["transition-duration", "--transition-duration-sl-td: 181ms;"],
  // Candidates expected to produce nothing, or to produce the wrong thing.
  ["columns", "--columns-sl-mcol: 9;"],
  ["border-style", "--border-style-sl-bs: dashed;"],
  ["gradient", "--gradient-sl-grad: linear-gradient(180deg, #0d0e0f 0%, #101112 100%);"],
  ["duration", "--duration-sl-dur: 173ms;"],
  ["rotate", "--rotate-sl-rot: 3.7deg;"],
];

const CONTROL_DELETE = new Set([
  "border-width",
  "grid-template-columns",
  "container",
  "background-image",
  "transition-duration",
]);

const CANDIDATES = [
  "p-4",
  "bg-sl-kolor", "text-sl-kolor", "border-sl-kolor",
  "shadow-sl-shad",
  "rounded-sl-rad",
  "border-sl-bw", "border-t-sl-bw", "border-x-sl-bw", "border-b-sl-bw",
  "font-sl-face",
  "font-sl-wt",
  "text-sl-size",
  "leading-sl-lead",
  "tracking-sl-track",
  "p-sl-space", "gap-sl-space", "h-sl-space", "w-sl-space",
  "max-w-sl-cont",
  "ease-sl-ease",
  "grid-cols-sl-cols",
  "bg-sl-bgi",
  "duration-sl-td",
  "columns-sl-mcol",
  "border-sl-bs",
  "bg-sl-grad", "bg-linear-sl-grad",
  "duration-sl-dur",
  "rotate-sl-rot",
  // The documented CSS-variable shorthands, hinted and unhinted.
  "border-(length:--sl-border-width)",
  "border-t-(length:--sl-border-width)",
  "border-x-(length:--sl-border-width)",
  "border-[length:var(--sl-border-width)]",
  "border-(--sl-border-width)",
  "border-t-(--sl-border-width)",
  "border-[var(--sl-border-width)]",
  "bg-(image:--sl-grad)",
  "bg-[image:var(--sl-grad)]",
  "bg-(--sl-grad)",
  "bg-[var(--sl-grad)]",
  "duration-(--sl-duration)",
  "grid-cols-(--sl-grid)",
  "max-w-(--sl-container)",
];

const theme = THEME_LINES.filter(([k]) => !(CONTROL && CONTROL_DELETE.has(k)))
  .map(([, line]) => "  " + line)
  .join("\n");

const input = `@import "tailwindcss";
@source inline("${CANDIDATES.join(" ")}");
:root {
  --sl-border-width: 1px;
  --sl-grad: linear-gradient(180deg, #131415 0%, #161718 100%);
  --sl-duration: 160ms;
  --sl-grid: repeat(3, minmax(0, 1fr));
  --sl-container: 1152px;
}
@theme inline {
${theme}
}
`;

const result = await postcss([tailwind()]).process(input, { from: "probe.css" });

const found = new Map();
result.root.walkRules((rule) => {
  const decls = [];
  rule.walkDecls((d) => decls.push(`${d.prop}: ${d.value}`));
  if (!decls.length) return;
  for (const raw of rule.selectors) {
    const bare = raw.replace(/\\/g, "").replace(/^\./, "");
    found.set(bare, (found.get(bare) || []).concat(decls));
  }
});

const pkg = (await import("tailwindcss/package.json", { with: { type: "json" } })).default;
console.log(
  CONTROL
    ? "=== CONTROL RUN: border-width, grid-template-columns, container, background-image, transition-duration deleted ==="
    : "=== FULL RUN ==="
);
console.log(`tailwindcss ${pkg.version}`);
console.log("");

let absent = 0;
for (const c of CANDIDATES) {
  const decls = found.get(c);
  if (!decls) {
    absent++;
    console.log(`ABSENT   ${c}`);
  } else {
    console.log(`EMITS    ${c}  =>  ${decls.join(" ; ")}`);
  }
}

console.log("");
console.log(`${CANDIDATES.length - absent}/${CANDIDATES.length} candidates emit a declaration.`);
