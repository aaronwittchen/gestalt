# Gestalt TODO

## Terminal / Script Runner Feature
- Add a terminal-style window to the desktop that can "run" scripts
- Inspired by [install-nothing](https://github.com/buyukakyuz/install-nothing) fake installation simulator
- Options to explore:
  - Template-based: generic install stages that swap in script/package names
  - Predefined per-script: each script has handwritten fake output
  - Keyword parsing: detect commands in scripts and generate matching output
- Could be done purely in JS/Vue, no Rust/WASM needed
- Should open inside an AppWindow styled as a terminal

## Language Feature
- Decide what "language feature" means for Gestalt:
  - Syntax highlighting for code blocks (Shiki is already installed)
  - New content collection / doc category
  - Internationalization (i18n)
  - Something else?

## Info Widget ("?" button)
- Panel opens from taskbar "?" button, shows "built with" tech stack
- Current issue: hover and click don't work on the tech stack rows
  - Tried Tailwind utility hover classes — didn't apply
  - Tried scoped CSS hover — didn't apply
  - Tried `<a target="_blank">` — links didn't open
  - Tried `<button>` with `window.open()` — still didn't work
- Likely cause: something in the parent chain (Desktop.astro nav, global styles, or event listeners) is intercepting/blocking pointer events on the fixed-position panel
- Next steps to debug:
  - Inspect in browser devtools — check if hover styles exist but are overridden, or if pointer-events are blocked
  - Check if the panel is actually behind another element (z-index stacking context issue)
  - Try rendering the panel via `<Teleport to="body">` to escape the nav/taskbar DOM hierarchy

## MDX Content
- Research how PostHog handles MDX for docs/blog
- Test markdown rendering inside app windows
