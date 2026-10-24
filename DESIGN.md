---
version: 1.0.0
name: MODU-Lifestyle-Hardware-Design-System
description: Adapted from Apple Design Analysis in voltagent/awesome-design-md. A physical-hardware-first modular design system that frames DTC lifestyle gear like a museum gallery. Clean white canvases, parchment backdrops, and near-black studio tiles framed by SF Pro / Inter typography with negative display letter-spacing, pill geometry (9999px), and a signature MODU Volt action color (#d4fc39) with deep ink contrast (#151a14). UI chrome recedes into frosted glass so the modular bottle and physical finishes speak for themselves.

colors:
  primary: "#d4fc39"
  primary-focus: "#bfee1a"
  primary-on-dark: "#d4fc39"
  ink: "#1d1d1f"
  body: "#1d1d1f"
  body-on-dark: "#ffffff"
  body-muted: "#a1a1a6"
  ink-muted-80: "#333333"
  ink-muted-48: "#7a7a7a"
  divider-soft: "#f0f0f0"
  hairline: "#e5e5e7"
  canvas: "#ffffff"
  canvas-parchment: "#f5f5f7"
  surface-pearl: "#fafafc"
  surface-tile-1: "#1d1d1f"
  surface-tile-2: "#272729"
  surface-tile-3: "#151618"
  surface-black: "#0a0b0a"
  surface-chip-translucent: "rgba(255, 255, 255, 0.85)"
  on-primary: "#151a14"
  on-dark: "#ffffff"

typography:
  hero-display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.07
    letterSpacing: -0.02em
  display-lg:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.10
    letterSpacing: -0.02em
  display-md:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    fontSize: 34px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.018em
  lead:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: -0.01em
  lead-airy:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    fontSize: 21px
    fontWeight: 300
    lineHeight: 1.5
    letterSpacing: 0
  tagline:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    fontSize: 19px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  body-strong:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.47
    letterSpacing: -0.015em
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.47
    letterSpacing: -0.015em
  dense-link:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 2.2
    letterSpacing: -0.01em
  caption:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: -0.01em
  caption-strong:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.01em
  button-large:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: -0.01em
  button-utility:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.01em
  fine-print:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: -0.005em
  micro-legal:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: 0
  nav-link:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: -0.01em

rounded:
  none: 0px
  xs: 5px
  sm: 8px
  md: 12px
  lg: 18px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 80px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-utility}"
    rounded: "{rounded.pill}"
    padding: "11px 22px"
    activeScale: 0.95
  button-secondary-pill:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-utility}"
    rounded: "{rounded.pill}"
    border: "1px solid {colors.hairline}"
    padding: "11px 22px"
  button-dark-utility:
    backgroundColor: "{colors.surface-tile-1}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-utility}"
    rounded: "{rounded.pill}"
    padding: "9px 18px"
  button-pearl-capsule:
    backgroundColor: "{colors.surface-pearl}"
    textColor: "{colors.ink-muted-80}"
    typography: "{typography.caption}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-icon-circular:
    backgroundColor: "{colors.surface-chip-translucent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: "40px"
  sub-nav-frosted:
    backgroundColor: "rgba(255, 255, 255, 0.88)"
    backdropBlur: "blur(20px)"
    borderBottom: "1px solid rgba(0, 0, 0, 0.08)"
    height: "64px"
  product-tile-light:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    padding: "80px 24px"
  product-tile-parchment:
    backgroundColor: "{colors.canvas-parchment}"
    textColor: "{colors.ink}"
    padding: "80px 24px"
  product-tile-dark:
    backgroundColor: "{colors.surface-tile-1}"
    textColor: "{colors.on-dark}"
    padding: "80px 24px"
  store-utility-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    border: "1px solid {colors.hairline}"
    padding: "24px"
  configurator-option-chip:
    backgroundColor: "{colors.surface-pearl}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
    border: "1px solid {colors.hairline}"
  configurator-option-chip-selected:
    backgroundColor: "{colors.surface-tile-1}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.pill}"
    border: "1px solid {colors.surface-tile-1}"
  search-input:
    backgroundColor: "{colors.canvas-parchment}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "42px"
    padding: "0 18px"
  floating-sticky-bar:
    backgroundColor: "rgba(255, 255, 255, 0.92)"
    backdropBlur: "blur(20px)"
    borderTop: "1px solid rgba(0, 0, 0, 0.08)"
    height: "72px"
  footer:
    backgroundColor: "{colors.surface-tile-1}"
    textColor: "{colors.body-muted}"
    borderTop: "1px solid rgba(255, 255, 255, 0.08)"
    padding: "64px 24px"
---

# MODU Design System Specification
*Derived from Apple Hardware Design Architecture (`voltagent/awesome-design-md`)*

## 1. Overview & Aesthetic Thesis

MODU is a premium DTC modular hydration system. Every touchpoint follows the **hardware gallery aesthetic**:
- **Product-first canvas**: Generous whitespace, crisp photorealistic renders, zero cheesy CSS gradients or fake glows.
- **Surface Rhythm**: Alternating pure white (`#ffffff`), parchment warmth (`#f5f5f7`), and velvety near-black tiles (`#1d1d1f` / `#151618`) acting as section dividers without hard visual borders.
- **Single Action Voltage**: MODU Electric Volt (`#d4fc39` with deep `#151a14` typography) carries all primary calls-to-action.
- **Pill & Gallery Geometry**: Uncompromising `9999px` capsule radii for all primary buttons, configurator chips, search inputs, and navigation pills, paired with `18px` (`rounded.lg`) precision radii on store utility cards.
- **Interactive Micro-motion**: Universal `transform: scale(0.95)` press feedback, combined with Morphicons spring-physics vector transformations.

---

## 2. Color System

### 2.1 Action & Accents
- **Volt Primary** (`#d4fc39`): Primary interactive trigger, buy buttons, active indicator pills.
- **Ink Contrast on Primary** (`#151a14`): Ensures WCAG AAA text legibility on the vibrant Volt background.
- **Primary Focus / Hover** (`#bfee1a`): Subtle luminance shift under hover.

### 2.2 Surface Stack
- **Canvas Pure** (`#ffffff`): Main reading surface, card background, configurator canvas.
- **Parchment Warmth** (`#f5f5f7`): Neutral off-white for secondary bands, utility panels, and search containers.
- **Surface Pearl** (`#fafafc`): Near-white fill for option chips and inactive segmented controls.
- **Studio Dark 1** (`#1d1d1f`): Near-black gallery surface, hero tiles, and unified footer chrome.
- **Studio Dark 2** (`#272729`): Deep card backplate for dark mode and specs panels.
- **Studio Void** (`#0a0b0a`): True black for deep contrast zones.

### 2.3 Lines & Hairlines
- **Hairline** (`#e5e5e7` / `rgba(0,0,0,0.08)`): Subtle 1px boundary for store utility cards and input frames.
- **Soft Divider** (`#f0f0f0`): Micro-delimiters between inline metadata.

---

## 3. Typographic System

### 3.1 Principles
1. **Negative Display Tracking**: All headlines at or above 24px apply `-0.01em` to `-0.02em` letter spacing for the unmistakable tight, architectural posture.
2. **Standard 17px Body**: Paragraph copy runs at 17px with `1.47` line height and `-0.015em` letter spacing to foster a calm, editorial reading pace.
3. **Restrained Weight Ladder**: Strictly 300 (airy lead), 400 (regular body), 600 (headlines & semibold UI), and 700 (bold titles). Weight 500 is reserved only for nav links.
4. **Relaxed Footer Leading**: Footer and catalog link stacks use line heights between `2.0` and `2.4` for effortless vertical scanning.

---

## 4. Components & Interactive Grammar

### 4.1 Navigation (`sub-nav-frosted`)
- Position: Sticky top (`position: sticky; top: 0; z-index: 1000;`).
- Height: 64px desktop.
- Surface: Frosted glass with `backdrop-filter: blur(20px) saturate(180%)`.
- Structure:
  - Left: Brand wordmark (`MODU`) with pill lifestyle badge (`MODULAR GEAR`).
  - Center: Nav pills with pill hover states (`#f5f5f7`).
  - Right: Morphicons action cluster (Search toggle, Account, Cart badge) + Primary Pill CTA (`Custom Ngay`).

### 4.2 Buttons & Actions
- **`button-primary` (`.btn-pill-lime` / `.btn-primary`)**:
  - Background: `#d4fc39`
  - Text: `#151a14` (Font weight 600)
  - Border-radius: `9999px` (Full capsule)
  - Padding: `12px 24px`
  - Active: `transform: scale(0.95)` with smooth cubic bezier transition.
- **`button-secondary-pill` (`.btn-pill-ghost`)**:
  - Background: `rgba(255, 255, 255, 0.9)`
  - Border: `1px solid #e5e5e7`
  - Text: `#1d1d1f`
  - Border-radius: `9999px`
- **`button-dark-utility`**:
  - Background: `#1d1d1f`
  - Text: `#ffffff`
  - Border-radius: `9999px`

### 4.3 Configurator & Option Chips (`configurator-option-chip`)
- Used for bottle color variants, modular cap choices, charm attachments, and capacity selectors.
- Default state: Rounded pill (`9999px`), light pearl background (`#fafafc`), 1px hairline border (`#e5e5e7`).
- Active state: Inverted to `#1d1d1f` background with white text, or highlighted with subtle `#d4fc39` accent ring.

### 4.4 Store Utility Cards (`store-utility-card`)
- Used across product grids, feature spotlights, and blog article teasers.
- Radius: `18px` (`rounded.lg`).
- Surface: Crisp white with 1px hairline border (`#e5e5e7`).
- Hover: Subtle `translateY(-3px)` lift with soft ambient shadow (`0 12px 32px rgba(0,0,0,0.06)`).

### 4.5 Search Input (`search-input`)
- Capsule pill shape (`rounded.pill`).
- Background: `#f5f5f7`.
- Embedded Morphicons search icon with spring state transitions.

### 4.6 Unified Footer (`.modu-footer`)
- Surface: Architectural Dark `#1d1d1f` with parchment contrast.
- 4-column balanced hierarchy: Brand manifesto, Explore, Support, Newsletter.
- Morphicons social chips with pill-shaped active targets.

---

## 5. Elevation & Photography Rules

1. **Zero Fake Gradients**: Never apply CSS background gradients or neon dropshadows behind UI elements.
2. **Single Product Shadow**: Hardware bottles resting on planes use a single soft, directional contact shadow:
   `filter: drop-shadow(0 15px 35px rgba(0,0,0,0.18))` or `box-shadow: 0 15px 35px rgba(0,0,0,0.14)`.
3. **Frosted Elevation**: All floating overlays (header, bottom action bar, toast notifications) rely exclusively on backdrop-blur (`blur(20px)`).

---

## 6. Do's and Don'ts

### Do
- Always use the signature pill radius (`9999px`) on interactive CTAs and chips.
- Keep headlines tight with negative letter-spacing (`-0.015em` to `-0.02em`).
- Preserve 17px body copy for readable DTC storytelling.
- Use Morphicons for all functional iconography with spring physics.
- Keep the single unified `.modu-footer` and `.modu-header` consistent across `index.html`, `about.html`, `blog/index.html`, and articles.

### Don't
- Do not mix mismatched corner radii (never use arbitrary 4px, 14px, or 30px radii — stick strictly to 8px, 12px, 18px, and 9999px).
- Do not use arbitrary saturated blues, purples, or greens. Accent is strictly locked to MODU Volt (`#d4fc39`).
- Do not crowd product imagery; give each bottle angle at least 48px of breathing room.
- Do not use generic emoji icons or heavyweight external icon fonts when lightweight Morphicons SVGs are available.

---

## 7. Responsive Breakpoint Standards
- Mobile: `≤ 640px` (single column cards, 28-32px display titles, sticky bottom action bar).
- Tablet: `641px - 1024px` (2-column grids, collapsed mobile header tray).
- Desktop: `1025px - 1440px` (Full 3-column store grids, 56px hero display titles, edge-to-edge frosted header).
- Max Width Container: `1280px` standard container with 24px responsive horizontal gutters.
