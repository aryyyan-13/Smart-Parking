---
name: AeroBay CyberHUD
colors:
  surface: '#131317'
  surface-dim: '#131317'
  surface-bright: '#39393d'
  surface-container-lowest: '#0e0e12'
  surface-container-low: '#1b1b1f'
  surface-container: '#1f1f23'
  surface-container-high: '#2a292e'
  surface-container-highest: '#353439'
  on-surface: '#e5e1e7'
  on-surface-variant: '#b9cac9'
  inverse-surface: '#e5e1e7'
  inverse-on-surface: '#303034'
  outline: '#839493'
  outline-variant: '#3a4a49'
  surface-tint: '#00dddd'
  primary: '#ffffff'
  on-primary: '#003737'
  primary-container: '#00fbfb'
  on-primary-container: '#007070'
  inverse-primary: '#006a6a'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#ffffff'
  on-tertiary: '#003824'
  tertiary-container: '#6ffbbe'
  on-tertiary-container: '#00734e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#00fbfb'
  primary-fixed-dim: '#00dddd'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#004f4f'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#131317'
  on-background: '#e5e1e7'
  surface-variant: '#353439'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-data-lg:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-data-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-data-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies an elite convergence of aerospace head-up displays (HUD), tactical avionics, and high-end automotive telemetry. It is engineered for next-generation smart parking infrastructure, real-time spatial digital twins, and autonomous vehicle reservation terminals.

### Design Movement: Tactical Cyber-Glass & Precision HUD
The aesthetic rejects kitschy, chaotic retro-cyberpunk in favor of clean military-spec avionics and luxury dark glassmorphism. It leverages deep space blacks, sub-surface obsidian panels, surgical 1px micro-borders, and disciplined neon vector glows that signal operational states instantly.

### Target Audience & Psychological Impact
- **Audience:** High-net-worth commuters, EV drivers navigating premium transit hubs, airport concierge operators, and autonomous fleet dispatchers.
- **Sensory Response:** Instantaneous command, architectural certainty, surgical precision, and effortless luxury. Users feel as though they are interacting with the flight avionics of a stealth aircraft rather than a mundane utility form.

## Colors

The palette is anchored in photon-deprived backgrounds to achieve boundless spatial contrast, complemented by high-luminance spectral accents mapped directly to real-time parking states.

### Palette Architecture
- **Primary (`#00FFFF` / Neon Cyan):** Primary HUD reticles, selected bay vectors, interactive focus rings, active routes, and key actions.
- **Secondary (`#3B82F6` / Electric Blue):** Structural bay geometry, standard navigation nodes, secondary controls, and telemetry graphs.
- **Tertiary (`#10B981` / Emerald Operational):** Available slots, active charging states, successful clearances, and valid FASTag/RFID pings.
- **Neutral Dark (`#050508` / Deep Void Black):** Absolute background floor for 3D canvases and app shell.
- **Surface Elevation (`#0A0A0F` & `#12121A`):** Frosted cockpit-grade glass containers with backdrop filters.

### Functional Status Tokens
- **Alert Amber (`#F59E0B`):** Reserved, pending occupancy, or expiring reservations.
- **Critical Rose (`#F43F5E`):** Occupied bays, restricted security zones, structural obstructions, or unauthorized vehicles.
- **Surface Line (`rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.14)`): Hairline tactical containment borders.

## Typography

The typographic hierarchy implements a tripartite structure tailored for precision data ingestion:

1. **Space Grotesk (Display & Structural Headers):** Delivers clean geometry with subtle technical quirks, grounding level overviews, facility decks, and screen titles.
2. **Inter (Body Copy & Contextual Prose):** Delivers neutral, uncompromised legibility across complex settings panels, pricing breakdowns, and vehicle specs.
3. **JetBrains Mono (Avionics, Telemetry & Machine Identity):** Exclusively handles spot markers (e.g., `BAY:B1-04`), FASTag tokens, pricing tickers (`$0.08/MIN`), timestamps, countdown timers, and coordinates. All numerical tables must enforce tabular figures (`font-variant-numeric: tabular-nums`).

## Layout & Spacing

The interface functions as a contextual spatial cockpit, prioritizing viewport real estate for the 3D twin canvas while floating ergonomic HUD panels on the periphery.

### Layout Philosophy
- **Spatial HUD Overlay Model:** On wide displays, the primary viewport renders the 3D deck or reservation scene without edge cropping. Collapsible telemetry rails (docked left and right) float on a 12-column coordinate framework.
- **Breakpoints:**
  - **Mobile (< 768px):** Single-column vertical stack. The 3D bay view is docked to the top 45vh with bottom sheet overlays for reservation parameters. Outer margins shrink to `margin` (1rem).
  - **Tablet (768px - 1199px):** 8-column layout. Interactive controls sit within a floating bottom-dock console.
  - **Desktop (1200px+):** 12-column layout with 24px gutters. Multi-tier floating glass HUD docks leave the central focal area free for spatial interaction.

## Elevation & Depth

Visual hierarchy does not use diffuse paper shadows; depth is rendered using light physics, luminescence, and glass refraction.

### Cockpit Stratification
- **Level 0 (World Canvas):** Solid Deep Void Black (`#050508`) hosting the WebGL/Canvas 3D bay visualizer.
- **Level 1 (Sub-surface Deck HUD):** Background `#0A0A0F` at 85% opacity, backdrop blur 16px, bounded by a 1px micro-border in `rgba(255, 255, 255, 0.06)`.
- **Level 2 (Tactical Modals & Selection Cards):** Frosted obsidian (`#12121A` at 70% opacity), backdrop blur 24px, 1px border `rgba(255, 255, 255, 0.12)`. Accented with directional top-edge lighting gradients: `linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 100%)`.
- **Level 3 (Interactive Active States / Reticles):** Glowing borders utilizing primary neon tinting with double drop-shadow glows:
  - Cyan Target: `box-shadow: 0 0 12px rgba(0, 255, 255, 0.25), inset 0 0 8px rgba(0, 255, 255, 0.1)`.
  - Danger Obstruction: `box-shadow: 0 0 12px rgba(244, 63, 94, 0.3), inset 0 0 8px rgba(244, 63, 94, 0.15)`.

## Shapes

The system adopts a disciplined soft-angled geometry (`roundedness: 1`). Radii stay tight (4px on micro components, 8px on HUD cards, 12px maximum on master dialogs) to preserve the look of machined avionics, avoiding toy-like over-rounding.

Status indicators, RFID beacons, and active telemetry tags are the sole exceptions, utilizing full pill radii to provide immediate perceptual separation between structural containers and real-time state chips.

## Components

### Buttons & Tactical Triggers
- **Primary Flight Action:** Solid Cyan (`#00FFFF`) fill with JetBrains Mono bold text in `#050508`. Subtle box glow on hover (`0 0 20px rgba(0, 255, 255, 0.4)`). Active state applies a 0.98 transform scale.
- **Secondary Ghost Avionics:** Transparent container, `#12121A` at 60% opacity with a 1px micro-border in `rgba(0, 255, 255, 0.4)`. Text in `#00FFFF`.
- **Destructive/Cancel Trigger:** Transparent container with `rgba(244, 63, 94, 0.15)` fill and 1px border in `#F43F5E`.

### Telemetry Cards & Bay Modules
- **Container Structure:** 8px corner radius, background `#12121A` (75% opacity, backdrop-blur 20px). Corner crosshair marks or chamfered border highlights simulate aerospace diagnostic panels.
- **Selected Bay State:** Border color shifts to `#00FFFF` with a continuous breathing glow animation. Header features the bay designation (`B1-04`) in JetBrains Mono.

### HUD Status Pills & Chips
- Fully rounded (`border-radius: 9999px`) compact pills.
- Interior text rendered in `label-data-sm` with a pulsating 6px neon dot indicator to the left.
- **Available:** Background `rgba(16, 185, 129, 0.12)`, border `rgba(16, 185, 129, 0.4)`, text `#10B981`.
- **Occupied:** Background `rgba(244, 63, 94, 0.12)`, border `rgba(244, 63, 94, 0.4)`, text `#F43F5E`.

### Cyber-Tactile Inputs
- Dark recessed background (`#07070B`), 4px border radius, 1px perimeter in `rgba(255, 255, 255, 0.1)`.
- Typographic input set in JetBrains Mono.
- **Focus:** Border transitions to `#00FFFF` with `0 0 10px rgba(0, 255, 255, 0.25)` outer emission.

### Precision Checkboxes & Radios
- Square 16px footprint with 2px corner radius.
- Unchecked: 1px border in `rgba(255, 255, 255, 0.2)`.
- Checked: `#00FFFF` background, black vector check icon, ambient cyan rim-light.

### Specialized Telemetry Displays
- **FASTag / RFID Scanner Bar:** Real-time pulse bar with high-speed scan line animation running across an ultraviolet/cyan micro-gradient.
- **Spatial Bay Mini-Reticle:** An SVG overlay pinned to 3D coordinate anchors showing live time elapsed, vehicle silhouette preview, and inductive charging status.