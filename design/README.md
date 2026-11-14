# Signal Garden design

Signal Garden is a personal field notebook: a visitor can collect a daily thought, read a short note, or try a small instrument. The homepage puts those activities ahead of decorative space.

## Direction

The selected concept is an observatory field notebook: spruce ink on warm paper, readable literary type, a dark daily-signal panel, an editorial notebook with a margin observation, and a small illustrated workbench. The antenna sprig connects the garden name to the site's receiver metaphor.

An unillustrated single-column reading journal was also considered. It would simplify reading, but underplay the working light, compass, weather and rhyme experiments. The selected composition gives reading and tinkering distinct places without making every fragment an identical card.

Two personal sites informed relationships rather than a borrowed visual system: [Robin Sloan](https://www.robinsloan.com/) uses a compact personal signature, readable prose and an explicit work directory; [Craig Mod](https://craigmod.com/) anchors authored work in substantial content and imagery. Signal Garden uses its own palette, writing and instruments.

## Editable foundations

Open `foundations.html` through any static server. Base type size and modular ratio are editable in the page. Production tokens live in `tokens.css` and are shared with the homepage.

The default base is 18px and the ratio is 1.25. Body and h6 use the base; h5–h1 use steps 1–5. Supporting prose uses base ÷ ratio. Monospaced metadata is a deliberately smaller independent annotation role. The homepage's experiment h3 elements deliberately use the h4 visual role, preserving their semantic position under the experiment h2. Compact manifesto and contact h2 elements use the h3 role. Phone layouts shift large roles down one step rather than inventing isolated sizes.

Newsreader carries the literary reading/display roles. Source Sans 3 provides clear body copy and controls; DM Mono identifies dates, counts and instrument feedback. Fonts have system fallbacks and load with `display=swap`.

Semantic colors, spacing, reading measure, corners and motion timing are editable in `tokens.css`. The shared control provides hover, focus, disabled and dark-surface states. Production-specific composition and instrument treatments live in `../styles.css`.

## Concept transfer

`concepts/signal-garden-concept.png` retains the generated composition and `concepts/prompt.txt` its prompt. Generated wording and dates are illustrative only; the implementation retains the actual notebook entries, dates and manifesto.

Defining relationships to preserve:

- Compact masthead and arrival; daily frequency is the first substantial panel.
- Dark forest daily panel with cream reading type, clear copy/retune actions and a receiver landscape.
- Broad editorial notes column with a narrower walking observation/Museum margin.
- Four illustrated experiments, distinct from the prose notebook, with real working controls.
- A quiet manifesto, direct contact action and a compact footer.

The production page is allowed more room than the concept where existing writing and feedback need it. Concept fidelity is assessed through these composition, proportion and identity relationships, not by substituting its invented content.

## Behavior

The original eight entries, eight daily prompts, category filters, keyboard navigation, finder cycle, disclosures, atmosphere sound, four experiments and Museum links remain. Category and same-day daily choices are stored when browser storage is available. Invalid or denied storage falls back to the normal working interface. A new local calendar day selects that day's default prompt; audio always starts off.

Disclosures retain native `details` semantics and their no-script fallback. Enhanced transitions animate actual content height, support interruption in either direction, and settle immediately when reduced motion is requested. Focus remains on the summary. Hover and instrument changes use short purposeful transitions.

## Run

From the repository root:

```sh
python3 -m http.server 8081 --bind 127.0.0.1
```

Open `/` for the homepage and `/design/foundations.html` for the foundations. Museum is intentionally outside this redesign.
