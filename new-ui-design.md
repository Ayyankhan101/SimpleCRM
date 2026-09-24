---
version: "alpha"
name: "GLASSFIN Aquatics · Live among the kelp"
description: "Glassfin Aquatics Feature Section is designed for highlighting product capabilities and value points. Key features include reusable structure, responsive behavior, and production-ready presentation. It is suitable for component libraries and responsive product interfaces."
colors:
  primary: "#E0714A"
  secondary: "#123029"
  tertiary: "#2F9078"
  neutral: "#FFF6F1"
  background: "#E0714A"
  surface: "#E0714A"
  text-primary: "#123029"
  text-secondary: "#E0714A"
  border: "#123029"
  accent: "#E0714A"
typography:
  display-lg:
    fontFamily: "Space Grotesk"
    fontSize: "45.6px"
    fontWeight: 600
    lineHeight: "41.04px"
    letterSpacing: "-0.025em"
  body-md:
    fontFamily: "IBM Plex Mono"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "18px"
    letterSpacing: "0.02em"
  label-md:
    fontFamily: "Space Grotesk"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0.12px"
rounded:
  full: "9999px"
spacing:
  base: "4px"
  sm: "1px"
  md: "4px"
  lg: "6px"
  xl: "9.6px"
  gap: "6px"
  card-padding: "11.6px"
  section-padding: "27.2px"
components:
  button-primary:
    textColor: "{colors.neutral}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "11.52px"
  card:
    rounded: "16px"
    padding: "28.8px"
---

## Overview

- **Composition cues:**
  - Layout: Flex
  - Content Width: Full Bleed
  - Framing: Glassy
  - Grid: Minimal

## Colors

The color system uses light mode with #E0714A as the main accent and #FFF6F1 as the neutral foundation.

- **Primary (#E0714A):** Main accent and emphasis color.
- **Secondary (#123029):** Supporting accent for secondary emphasis.
- **Tertiary (#2F9078):** Reserved accent for supporting contrast moments.
- **Neutral (#FFF6F1):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #E0714A; Surface: #E0714A; Text Primary: #123029; Text Secondary: #E0714A; Border: #123029; Accent: #E0714A

## Typography

Typography pairs Space Grotesk for display hierarchy with IBM Plex Mono for supporting content and interface copy.

- **Display (`display-lg`):** Space Grotesk, 45.6px, weight 600, line-height 41.04px, letter-spacing -0.025em.
- **Body (`body-md`):** IBM Plex Mono, 12px, weight 400, line-height 18px, letter-spacing 0.02em.
- **Labels (`label-md`):** Space Grotesk, 12px, weight 500, line-height 16px, letter-spacing 0.12px.

## Layout

Layout follows a flex composition with reusable spacing tokens. Preserve the flex, full bleed structural frame before changing ornament or component styling. Use 4px as the base rhythm and let larger gaps step up from that cadence instead of introducing unrelated spacing values.

Treat the page as a flex / full bleed composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Flex
- **Content width:** Full Bleed
- **Base unit:** 4px
- **Scale:** 1px, 4px, 6px, 9.6px, 10px, 11.52px, 12px, 15.2px
- **Section padding:** 27.2px
- **Card padding:** 11.6px, 16px, 28.8px
- **Gaps:** 6px, 7.6px, 8px, 10px

## Elevation & Depth

Depth is communicated through glass, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as glass first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Glass
- **Borders:** 1px #123029; 1px #FFFFFF
- **Shadows:** rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.4) 0px 0px 0px 0.5px inset; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(9, 44, 36, 0.25) 0px -2px 3px 0px inset, rgba(9, 44, 36, 0.2) 0px 1px 2px 0px; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(9, 44, 36, 0.55) 0px 14px 26px -14px inset
- **Blur:** 6px, 12px

### Techniques
- **Gradient border shell:** Use a thin gradient border shell around the main card. Wrap the surface in an outer shell with 0px padding and a 44% 56% 0px 0px / 22px 30px 0px 0px radius. Drive the shell with radial-gradient(140% 120% at 50% 120%, rgb(236, 220, 180), rgba(0, 0, 0, 0) 60%), linear-gradient(rgba(201, 176, 120, 0) 0%, rgb(201, 176, 120) 34%, rgb(221, 199, 147) 100%) so the edge reads like premium depth instead of a flat stroke. Keep the actual stroke understated so the gradient shell remains the hero edge treatment. Inset the real content surface inside the wrapper with a slightly smaller radius so the gradient only appears as a hairline frame.

## Shapes

Shapes rely on a tight radius system anchored by 12px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 12px, 16px, 9999px
- **Icon treatment:** Linear
- **Icon sets:** Solar

## Components

Anchor interactions to the detected button styles. Reuse the existing card surface recipe for content blocks.

### Buttons
- **Primary:** text #FFF6F1, radius 9999px, padding 11.52px, border 0px solid rgb(229, 231, 235).

### Cards and Surfaces
- **Card surface:** border 1px solid rgba(255, 255, 255, 0.7), radius 16px, padding 28.8px, shadow rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(9, 44, 36, 0.6) 0px 20px 44px -22px, rgba(255, 255, 255, 0.85) 0px 1px 0px 0px inset, blur 12px.

### Iconography
- **Treatment:** Linear.
- **Sets:** Solar.

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette as the main accent for emphasis and action states.
- Do keep spacing aligned to the detected 4px rhythm.
- Do reuse the Glass surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 12px, 16px, 9999px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected moderate motion intensity without a deliberate reason.

## Motion

Motion feels controlled and interface-led across text, layout, and section transitions. Timing clusters around 14000ms and 9000ms. Easing favors ease and linear. Scroll choreography uses GSAP ScrollTrigger for section reveals and pacing.

**Motion Level:** moderate

**Durations:** 14000ms, 9000ms, 12000ms, 34000ms, 88000ms, 96000ms

**Easings:** ease, linear, ease-in-out, ease-out, cubic-bezier(0.4, 0

**Scroll Patterns:** gsap-scrolltrigger
