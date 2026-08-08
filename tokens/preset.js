/**
 * saas-landing-theme / Tailwind v3 adapter
 *
 * Maps the tokens onto a Tailwind v3 preset so you get utilities like
 * bg-sl-brand, shadow-sl-sm, rounded-sl-lg, text-sl-h2, max-w-sl.
 *
 * There is not one literal value in this file. Every entry is a var()
 * reference to a custom property declared in tokens.css, which stays the
 * single source of truth. Change a value there and both Tailwind versions
 * follow.
 *
 * Because the values are var() references, tokens.css has to be loaded for
 * anything here to resolve. Import it at the top of your stylesheet:
 *
 *   @import "./path/to/tokens/tokens.css";
 *   @tailwind base;
 *   @tailwind components;
 *   @tailwind utilities;
 *
 * Then in tailwind.config.js:
 *
 *   module.exports = {
 *     presets: [require("./path/to/tokens/preset.js")],
 *     content: ["./src/**\/*.{html,js,jsx,ts,tsx}"],
 *   };
 *
 * One known limit of the var() approach: Tailwind's slash opacity modifiers
 * (bg-sl-brand/50) cannot compute against a variable, so they do not work on
 * these colours. If you need a translucent brand, declare the alpha variant as
 * its own token in tokens.css.
 *
 * WHAT IS AND IS NOT VERIFIED HERE. The v4 adapter next to this file was
 * compiled and read back, entry by entry, by the scripts in verify/. This one
 * was not: no Tailwind 3 build was available in the environment it was written
 * in. It rests on the documented v3 theme keys instead, which is a weaker
 * claim and is worth knowing before you rely on it.
 *
 * The four keys v4 has no documented namespace for (border widths, grid
 * templates, background images, transition durations) are all first-class
 * theme keys in v3, so nothing here needs the escape hatches theme.css
 * documents.
 *
 * On Tailwind v4, use theme.css instead. This file is v3 only.
 */

const v = (name) => `var(--${name})`;

module.exports = {
  theme: {
    extend: {
      colors: {
        "sl-ground": v("sl-ground"),
        "sl-surface": v("sl-surface"),
        "sl-surface-muted": v("sl-surface-muted"),
        "sl-surface-invert": v("sl-surface-invert"),

        "sl-ink": v("sl-ink"),
        "sl-ink-muted": v("sl-ink-muted"),
        "sl-ink-subtle": v("sl-ink-subtle"),
        "sl-ink-invert": v("sl-ink-invert"),
        "sl-ink-invert-muted": v("sl-ink-invert-muted"),

        "sl-brand": v("sl-brand"),
        "sl-brand-strong": v("sl-brand-strong"),
        "sl-brand-soft": v("sl-brand-soft"),
        "sl-brand-ink": v("sl-brand-ink"),

        "sl-success": v("sl-success"),
        "sl-success-soft": v("sl-success-soft"),
        "sl-warning": v("sl-warning"),
        "sl-warning-soft": v("sl-warning-soft"),
        "sl-danger": v("sl-danger"),
        "sl-danger-soft": v("sl-danger-soft"),
        "sl-danger-ink": v("sl-danger-ink"),

        // Two line colours, because a divider and the edge of an input are
        // different decisions. See the LINES group in tokens.css.
        "sl-line": v("sl-border"),
        "sl-line-control": v("sl-border-control"),
      },

      boxShadow: {
        "sl-xs": v("sl-shadow-xs"),
        "sl-sm": v("sl-shadow-sm"),
        "sl-md": v("sl-shadow-md"),
        "sl-lg": v("sl-shadow-lg"),
      },

      borderRadius: {
        "sl-sm": v("sl-radius-sm"),
        sl: v("sl-radius"),
        "sl-lg": v("sl-radius-lg"),
        "sl-xl": v("sl-radius-xl"),
        "sl-pill": v("sl-radius-pill"),
      },

      borderWidth: {
        sl: v("sl-border-width"),
        "sl-strong": v("sl-border-width-strong"),
      },

      fontFamily: {
        "sl-sans": v("sl-font-sans"),
        "sl-mono": v("sl-font-mono"),
      },

      fontWeight: {
        "sl-body": v("sl-weight-body"),
        "sl-medium": v("sl-weight-medium"),
        "sl-semibold": v("sl-weight-semibold"),
        "sl-bold": v("sl-weight-bold"),
      },

      fontSize: {
        "sl-display": v("sl-text-display"),
        "sl-h1": v("sl-text-h1"),
        "sl-h2": v("sl-text-h2"),
        "sl-h3": v("sl-text-h3"),
        "sl-lead": v("sl-text-lead"),
        "sl-body": v("sl-text-body"),
        "sl-sm": v("sl-text-sm"),
        "sl-xs": v("sl-text-xs"),
      },

      lineHeight: {
        "sl-tight": v("sl-leading-tight"),
        "sl-snug": v("sl-leading-snug"),
        "sl-body": v("sl-leading-body"),
      },

      letterSpacing: {
        "sl-tight": v("sl-tracking-tight"),
        "sl-wide": v("sl-tracking-wide"),
      },

      spacing: {
        "sl-1": v("sl-space-1"),
        "sl-2": v("sl-space-2"),
        "sl-3": v("sl-space-3"),
        "sl-4": v("sl-space-4"),
        "sl-6": v("sl-space-6"),
        "sl-8": v("sl-space-8"),
        "sl-12": v("sl-space-12"),
        "sl-16": v("sl-space-16"),
        "sl-24": v("sl-space-24"),
        "sl-32": v("sl-space-32"),

        // Section rhythm, so a page rebuilt in Tailwind writes py-sl-section
        // rather than reinventing the number.
        "sl-section": v("sl-section-y"),
        "sl-section-wide": v("sl-section-y-wide"),
        "sl-hero": v("sl-hero-y"),
        "sl-hero-wide": v("sl-hero-y-wide"),

        "sl-logo": v("sl-logo-height"),
        "sl-plan-raise": v("sl-plan-raise"),
        "sl-frame-bar": v("sl-frame-bar"),
        "sl-avatar": v("sl-avatar"),
      },

      maxWidth: {
        sl: v("sl-container"),
        "sl-narrow": v("sl-container-narrow"),
        "sl-measure": v("sl-measure"),
      },

      gridTemplateColumns: {
        "sl-triptych": v("sl-grid-triptych"),
        "sl-pair": v("sl-grid-pair"),
      },

      backgroundImage: {
        "sl-hero": v("sl-gradient-ground"),
        "sl-invert": v("sl-gradient-invert"),
      },

      transitionDuration: {
        sl: v("sl-duration"),
        "sl-slow": v("sl-duration-slow"),
      },

      transitionTimingFunction: {
        sl: v("sl-ease"),
      },
    },
  },
};
