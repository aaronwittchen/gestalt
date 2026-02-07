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

## MDX Content
- Research how PostHog handles MDX for docs/blog
- Test markdown rendering inside app windows
