# Customizing: move along an axis

Most themes document customization as a list of variables you may set. That tells you what is editable and nothing about what to edit. This file documents it the other way round: pick the axis you want to move along, and change the two or three tokens that carry the move.

The axes are the four from the [creative direction framework](https://rampstack.co/framework/creative-direction), and they are the same four annotated throughout [`tokens/tokens.css`](tokens/tokens.css). Where this theme currently sits:

| Axis | Position |
| --- | --- |
| Tone register | [Conversational](https://rampstack.co/framework/tone/conversational) |
| Aesthetic philosophy | [Polished Standard](https://rampstack.co/framework/aesthetic/polished-standard) |
| Audience relationship | [Peer](https://rampstack.co/framework/relationship/peer) |
| Sensory ambition | [Considered](https://rampstack.co/framework/sensory/considered) |

Every move below is an edit to `tokens/tokens.css` only. Nothing else in the repo changes, because nothing else in the repo holds a value.

One rule keeps these moves clean: change tokens on the axis you are moving, and leave the others alone. Reaching for the radius while you are doing a tone move is how a theme ends up at no position at all.

Rerun `node verify/contrast.mjs` after any colour change. Every ratio quoted below came out of it.

---

## Move 1, worked: Tone register, Conversational toward Playful

This is the move from corporate toward warm. The theme as it ships reads as a competent company that has done this before. This move keeps every structural decision and changes who is talking: the same page, written by someone who is pleased to see you.

It is the move to make when the buyer is a practitioner choosing a tool they will live in, rather than a committee approving a purchase. Design tools, developer products with a personality, anything sold bottom up.

Three tokens carry it.

### 1. The accent, from a blue to a warm

```diff
- --sl-brand: #3350cf;          /* white text 6.58:1, on ground 6.20:1 */
- --sl-brand-strong: #2740ad;   /* white text 8.67:1 */
- --sl-brand-soft: #eaeefc;     /* brand-strong on it 7.48:1 */
+ --sl-brand: #a83e14;          /* white text 6.24:1, on ground 5.88:1 */
+ --sl-brand-strong: #7e2c09;   /* white text 9.33:1 */
+ --sl-brand-soft: #fdeee4;     /* brand-strong on it 8.23:1 */
```

Three values, one decision. The category blue is the single most conventional thing on the page, and swapping it for a burnt orange is the loudest tone move available that does not touch the structure. Everything downstream follows: the eyebrow, the feature icon, the focus ring, the recommended plan's border, and the gradient wash at the top of the hero, because all of them are `var(--sl-brand)` rather than a copy of it.

Contrast holds. White text on the button goes from 6.58:1 to 6.24:1, and the brand against the ground from 6.20:1 to 5.88:1. Both clear AA with room, which is the constraint that ruled out the brighter oranges: `#c2410c` is the more obvious choice and lands at 5.18:1, close enough to the floor that a future tweak breaks it.

### 2. The reading rhythm

```diff
- --sl-leading-body: 1.65;
+ --sl-leading-body: 1.75;
```

The token nobody expects to be a tone control. Copy set at 1.65 reads as documentation; the same copy at 1.75 reads as someone talking. It costs vertical space on every paragraph, which is the actual reason most SaaS pages sit tight, and it is worth the space on a page whose job is to be read rather than scanned.

### 3. The corner

```diff
- --sl-radius: 10px;
- --sl-radius-lg: 14px;
- --sl-radius-xl: 20px;
+ --sl-radius: 14px;
+ --sl-radius-lg: 18px;
+ --sl-radius-xl: 24px;
```

This one crosses onto the audience relationship axis, which is why it is third and why it is optional. A softer corner does read warmer, and it also moves the brand a step from Peer toward Companion. Make the change if that is where you want to be, and skip it if the reader is a peer you are being friendly with rather than someone you are reassuring.

Keep `--sl-radius-sm` where it is. Badges at 6px against buttons at 14px is the ratio that stops the small parts looking inflated.

### What happens to the feel

The page keeps every mechanic that makes it this register. Sections still land on the same rhythm, shadows are still small, the pricing table is still the pricing table. What changes is that the page stops sounding like a vendor and starts sounding like a maker.

### What three tokens cannot do

They cannot move the copy. "Priced per person, not per commitment" is a Conversational sentence with a straight face on it, and the warmer accent does not make it warmer. The tone axis runs through language before it runs through colour, and a token file has no opinion about a headline. Budget a copy pass alongside this move.

They also cannot save a page whose spacing is wrong. Warmth on top of a broken rhythm reads as a cheerful mess, which is worse than the corporate version it replaced.

---

## Move 2, sketched: Aesthetic philosophy, Polished Standard toward Editorial Restrained

The destination is where a page stops using cards to say "this is a section". Type does the work, whitespace is composed rather than left over, and the colour count drops to two.

The tokens that carry it:

- `--sl-border`, retired to `transparent`, and the card shadows dropped to `none`. The card stops being a container and becomes a column of text with space around it. Work out for yourself what happens to `.sl-plan`, where the border is doing real work marking the recommended plan; there is a right answer and finding it will teach you more about the register than reading about it.
- `--sl-surface`, set to the same value as `--sl-ground`. Editorial Restrained does not stack planes.
- `--sl-measure`, from `68ch` down to something nearer `62ch`, and the section headline block's centred alignment abandoned in favour of a left column. That second part is a `sections.css` edit rather than a token edit, which is the sign that this move is a bigger one than it looks.

The trap is stopping halfway. A page with no card borders and the same centred, three-across arrangement reads as Polished Standard with the styling deleted rather than as a position.

---

## Move 3, sketched: Sensory ambition, Considered toward Functional

The destination is the product surface rather than the marketing surface: the console the same customer looks at all day after they buy.

The tokens that carry it:

- `--sl-gradient-ground`, replaced with a flat `var(--sl-ground)`. The wash is the single most decorative thing in the theme and it is the first thing to go.
- The shadow scale, flattened. `--sl-shadow-md` and `--sl-shadow-lg` down to `--sl-shadow-xs`, so elevation stops being a hierarchy and becomes a hairline separation.
- `--sl-section-y` and `--sl-section-y-wide`, from 64px and 96px down to something nearer 32px and 48px. Generous section rhythm is a marketing-page decision. On a working surface it is scrolling.

The one to leave alone is `--sl-border-control`. Functional is the position where a form field is the entire interface, and it is the last place to start economizing on the line that says where the field begins.

---

## Adding a token

If a move needs a value the theme does not have, add it to `tokens/tokens.css` in the group whose axis it serves, with a comment saying what it is for. Then reference it from `theme.css` and `preset.js` so both Tailwind versions see it, and add the pairing to `verify/contrast.mjs` if it is a colour. Those two adapter files hold no values, only references, and keeping it that way is what makes the next move a three-line diff.
