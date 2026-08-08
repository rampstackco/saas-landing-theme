/**
 * saas-landing-theme / Tailwind v4 namespace verification
 *
 * Compiles the real tokens/theme.css and checks that every entry in its
 * @theme block produces a utility that sets the property it is supposed to
 * set, carrying the var() reference it was given. The table in the header of
 * theme.css is the output of this script.
 *
 * Two things this does that a grep cannot:
 *
 *   It reads DECLARATIONS out of the compiled PostCSS AST. A class name in
 *   the output proves a name exists, not which property sits under it, and
 *   two of the findings recorded in theme.css are cases where the name is
 *   right and the property is wrong.
 *
 *   It checks the value as well as the property. `@theme inline` is what
 *   makes the generated rule carry var(--sl-thing) rather than a copy of the
 *   value. Plain @theme compiles, generates every utility, and quietly breaks
 *   the single-source claim this repository is built on.
 *
 * The theme itself has no dependencies and no build. This script does:
 *
 *   npm install --no-save tailwindcss@4 @tailwindcss/postcss@4 postcss
 *   node verify/namespaces.mjs
 *
 * Exit code is 0 when every entry passes and 1 when any does not.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

const here = dirname(fileURLToPath(import.meta.url));
const themePath = join(here, "..", "tokens", "theme.css");
const themeSrc = readFileSync(themePath, "utf8");

/**
 * How each namespace turns a theme entry into a candidate utility, and which
 * property that utility has to set. The property is the point: a namespace
 * that generates the wrong property is the failure mode this file exists for.
 */
const NAMESPACES = [
  { ns: "color", utility: (n) => `bg-${n}`, property: "background-color" },
  { ns: "shadow", utility: (n) => `shadow-${n}`, property: "--tw-shadow" },
  { ns: "radius", utility: (n) => `rounded-${n}`, property: "border-radius" },
  { ns: "border-width", utility: (n) => `border-${n}`, property: "border-width" },
  { ns: "font-weight", utility: (n) => `font-${n}`, property: "font-weight" },
  { ns: "font", utility: (n) => `font-${n}`, property: "font-family" },
  { ns: "text", utility: (n) => `text-${n}`, property: "font-size" },
  { ns: "leading", utility: (n) => `leading-${n}`, property: "line-height" },
  { ns: "tracking", utility: (n) => `tracking-${n}`, property: "letter-spacing" },
  { ns: "spacing", utility: (n) => `p-${n}`, property: "padding" },
  { ns: "container", utility: (n) => `max-w-${n}`, property: "max-width" },
  { ns: "grid-template-columns", utility: (n) => `grid-cols-${n}`, property: "grid-template-columns" },
  { ns: "background-image", utility: (n) => `bg-${n}`, property: "background-image" },
  { ns: "transition-duration", utility: (n) => `duration-${n}`, property: "transition-duration" },
  { ns: "ease", utility: (n) => `ease-${n}`, property: "transition-timing-function" },
];

// Longest namespace first, so --font-weight-* is not read as --font-*.
const ORDERED = [...NAMESPACES].sort((a, b) => b.ns.length - a.ns.length);

const themeBlock = themeSrc.slice(themeSrc.indexOf("@theme inline"));
const entries = [];
for (const line of themeBlock.split("\n")) {
  const m = line.match(/^\s*(--[a-z0-9-]+):\s*var\((--[a-z0-9-]+)\)\s*;/);
  if (!m) continue;
  const [, key, ref] = m;
  const hit = ORDERED.find((n) => key.startsWith(`--${n.ns}-`));
  if (!hit) {
    console.log(`UNCLAIMED  ${key} matches no namespace this script knows about`);
    continue;
  }
  entries.push({ key, ref, name: key.slice(`--${hit.ns}-`.length), ...hit });
}

const candidates = ["p-4", ...entries.map((e) => e.utility(e.name))];

const input = `@import "tailwindcss";
@source inline("${candidates.join(" ")}");
@import "${themePath.replace(/\\/g, "/")}";
`;

const result = await postcss([tailwind()]).process(input, { from: themePath });

const found = new Map();
result.root.walkRules((rule) => {
  const decls = [];
  rule.walkDecls((d) => decls.push({ prop: d.prop, value: d.value }));
  if (!decls.length) return;
  for (const raw of rule.selectors) {
    const bare = raw.replace(/\\/g, "").replace(/^\./, "");
    found.set(bare, (found.get(bare) || []).concat(decls));
  }
});

const pkg = (await import("tailwindcss/package.json", { with: { type: "json" } })).default;
console.log(`tailwindcss ${pkg.version}`);

// Sanity: the build itself worked.
const sanity = found.get("p-4");
if (!sanity) {
  console.log("FAIL  stock p-4 produced nothing. The build is broken, not the theme.");
  process.exit(1);
}
console.log(`sanity  p-4 => ${sanity.map((d) => `${d.prop}: ${d.value}`).join(" ; ")}`);
console.log("");

const tally = new Map();
const failures = [];

for (const e of entries) {
  const utility = e.utility(e.name);
  const decls = found.get(utility) || [];
  const match = decls.find((d) => d.prop === e.property);
  const carriesVar = match ? match.value.includes(`var(${e.ref})`) : false;
  const ok = Boolean(match) && carriesVar;

  const row = tally.get(e.ns) || { pass: 0, total: 0 };
  row.total++;
  if (ok) row.pass++;
  tally.set(e.ns, row);

  if (!ok) {
    failures.push({
      utility,
      key: e.key,
      want: `${e.property} carrying var(${e.ref})`,
      got: decls.length ? decls.map((d) => `${d.prop}: ${d.value}`).join(" ; ") : "no rule emitted",
    });
  }
}

const width = Math.max(...[...tally.keys()].map((k) => k.length));
for (const [ns, row] of tally) {
  const verdict = row.pass === row.total ? "GENERATES" : "INCOMPLETE";
  console.log(`--${ns}-*`.padEnd(width + 4) + `  ${verdict}  ${row.pass}/${row.total}`);
}

console.log("");
if (failures.length) {
  for (const f of failures) {
    console.log(`FAIL  ${f.utility}  (${f.key})`);
    console.log(`      want: ${f.want}`);
    console.log(`      got:  ${f.got}`);
  }
  console.log(`\n${failures.length} of ${entries.length} entries failed.`);
  process.exit(1);
}

console.log(`All ${entries.length} entries generate the property they claim, carrying their var().`);
