---
version: "alpha"
name: "CARGA · Shipping Manifest CGA-226-04417"
description: "Carga Shipping Dashboard Section is designed for demonstrating application workflows and interface hierarchy. Key features include clear information density, modular panels, and interface rhythm. It is suitable for product showcases, admin panels, and analytics experiences."
colors:
  primary: "#F0E5C5"
  secondary: "#332B1C"
  tertiary: "#E2F4CB"
  neutral: "#121212"
  background: "#F0E5C5"
  surface: "#F0E5C5"
  text-primary: "#332B1C"
  text-secondary: "#332B1C"
  border: "#332B1C"
  accent: "#F0E5C5"
typography:
  display-lg:
    fontFamily: "Barlow Condensed"
    fontSize: "48px"
    fontWeight: 500
    lineHeight: "48px"
    letterSpacing: "-0.025em"
  body-md:
    fontFamily: "IBM Plex Mono"
    fontSize: "12px"
    fontWeight: 300
    lineHeight: "16px"
spacing:
  base: "4px"
  sm: "1px"
  md: "2px"
  lg: "4px"
  xl: "6px"
  gap: "2px"
  card-padding: "9.5px"
  section-padding: "25.31px"
components:
  card:
    rounded: "0px"
    padding: "9.5px"
---

## Overview

- **Composition cues:**
  - Layout: Grid
  - Content Width: Full Bleed
  - Framing: Open
  - Grid: Strong

## Colors

The color system uses light mode with #F0E5C5 as the main accent and #121212 as the neutral foundation.

- **Primary (#F0E5C5):** Main accent and emphasis color.
- **Secondary (#332B1C):** Supporting accent for secondary emphasis.
- **Tertiary (#E2F4CB):** Reserved accent for supporting contrast moments.
- **Neutral (#121212):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #F0E5C5; Surface: #F0E5C5; Text Primary: #332B1C; Text Secondary: #332B1C; Border: #332B1C; Accent: #F0E5C5

## Typography

Typography pairs Barlow Condensed for display hierarchy with IBM Plex Mono for supporting content and interface copy.

- **Display (`display-lg`):** Barlow Condensed, 48px, weight 500, line-height 48px, letter-spacing -0.025em.
- **Body (`body-md`):** IBM Plex Mono, 12px, weight 300, line-height 16px.

## Layout

Layout follows a grid composition with reusable spacing tokens. Preserve the grid, full bleed structural frame before changing ornament or component styling. Use 4px as the base rhythm and let larger gaps step up from that cadence instead of introducing unrelated spacing values.

Treat the page as a grid / full bleed composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Grid
- **Content width:** Full Bleed
- **Base unit:** 4px
- **Scale:** 1px, 2px, 4px, 6px, 8px, 10px, 10.85px, 21.7px
- **Section padding:** 25.31px
- **Card padding:** 9.5px
- **Gaps:** 2px, 4px, 8px, 12.66px

## Elevation & Depth

Depth is communicated through elevated, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as elevated first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Elevated
- **Borders:** 1px #332B1C; 1.5px #332B1C
- **Shadows:** rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(52, 40, 20, 0.55) 0px 1px 2px 0px inset; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(52, 40, 20, 0.25) 0px 2px 3px 0px, rgba(52, 40, 20, 0.38) 0px 18px 44px 0px

### Techniques
- **Gradient border shell:** Use a thin gradient border shell around the main card. Wrap the surface in an outer shell with 0px padding and a 0px radius. Drive the shell with linear-gradient(168deg, rgb(240, 229, 200) 0%, rgb(233, 220, 186) 46%, rgb(226, 210, 172) 100%) so the edge reads like premium depth instead of a flat stroke. Keep the actual stroke understated so the gradient shell remains the hero edge treatment. Inset the real content surface inside the wrapper with a slightly smaller radius so the gradient only appears as a hairline frame.

## Shapes

Shapes rely on a tight radius system anchored by 9999px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 9999px

## Components

Reuse the existing card surface recipe for content blocks.

### Cards and Surfaces
- **Card surface:** background rgba(240, 229, 197, 0.55), border 1.5px solid rgb(51, 43, 28), radius 0px, padding 9.5px, shadow none.

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette as the main accent for emphasis and action states.
- Do keep spacing aligned to the detected 4px rhythm.
- Do reuse the Elevated surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 9999px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected minimal motion intensity without a deliberate reason.

## Motion

Motion stays restrained and interface-led across text, layout, and scroll transitions. Easing favors ease. Scroll choreography uses GSAP ScrollTrigger for section reveals and pacing.

**Motion Level:** minimal

**Easings:** ease

**Scroll Patterns:** gsap-scrolltrigger
