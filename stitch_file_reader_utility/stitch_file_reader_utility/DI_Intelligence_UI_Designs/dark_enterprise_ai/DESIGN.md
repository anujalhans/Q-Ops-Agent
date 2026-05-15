---
name: Dark Enterprise AI
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#ddb7ff'
  on-secondary: '#490080'
  secondary-container: '#6f00be'
  on-secondary-container: '#d6a9ff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00a572'
  on-tertiary-container: '#00311f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#f0dbff'
  secondary-fixed-dim: '#ddb7ff'
  on-secondary-fixed: '#2c0051'
  on-secondary-fixed-variant: '#6900b3'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  h1:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h3:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  data-mono:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  grid_columns: '12'
  grid_gutter: 16px
  container_margin: 24px
---

## Brand & Style
The design system is engineered for high-stakes technical environments where precision and clarity are paramount. It adopts a "Dark Enterprise" aesthetic, balancing the serious nature of quality assurance with the futuristic intelligence of AI. The brand personality is authoritative yet innovative, evoking a sense of calm control over complex data.

The visual style is a hybrid of **Minimalism** and **Glassmorphism**. It utilizes semi-transparent layers and subtle glows to suggest depth and "intelligence" without overwhelming the user. The interface prioritizes density and utility, ensuring that technical users have immediate access to critical information through a disciplined, high-contrast visual language.

## Colors
The palette is built on a foundation of deep, nocturnal tones to reduce eye strain during long technical sessions. 
- **Deep Slate (#0f172a)** serves as the primary canvas for the application background.
- **Charcoal (#1e293b)** is used for elevated containers, sidebars, and card elements.
- **Cyber Blue (#3b82f6)** is reserved strictly for primary actions and interactive states.
- **Amethyst (#a855f7)** signifies AI-driven insights, automated suggestions, and machine-learning processes.
- **Emerald Green (#10b981)** provides high-contrast feedback for successful test completions and healthy system states.

## Typography
The typographic system utilizes a dual-font approach to distinguish between structural guidance and technical data. **Space Grotesk** is used for headlines and data points where a geometric, high-tech feel is required. **Inter** serves as the workhorse for body copy and UI labels, ensuring maximum legibility at small sizes. 

Clear hierarchy is established through rigorous use of "Label Caps" for section headers and "Data Mono" for code snippets, test IDs, and timestamps.

## Layout & Spacing
This design system employs a **high-density fluid grid** to maximize the information displayed on screen. A 4px baseline shift ensures that all components align to a predictable technical rhythm.

Layouts follow a 12-column structure with tight 16px gutters to maintain a compact, "cockpit-like" feel. Margin sizes are kept at 24px to provide a slim buffer from the screen edge. Components should favor horizontal expansion to utilize the wide-screen monitors common in enterprise QA environments.

## Elevation & Depth
Depth in the design system is achieved through **Glassmorphism** and **Tonal Layers** rather than heavy shadows. 
1. **Base Layer:** Deep Slate (#0f172a) for the background.
2. **Surface Layer:** Charcoal (#1e293b) with a 1px border (White @ 10% opacity) to define component boundaries.
3. **Overlay Layer:** Semi-transparent backgrounds (Charcoal @ 80% opacity) with a 12px backdrop blur for modals and popovers.
4. **AI Glow:** Components associated with AI features (Amethyst) utilize a subtle outer glow (5px blur, 10% opacity) to signify active intelligence.

## Shapes
The shape language is "Soft-Technical." Elements use a **0.25rem (4px)** base radius to maintain a sharp, geometric feel while avoiding the clinical coldness of 0px corners. Large containers like cards or panels may scale up to 8px (rounded-lg) for better visual grouping. This restrained rounding ensures that the UI feels engineered and precise.

## Components
- **Buttons:** Primary buttons use Cyber Blue with white text. AI buttons use Amethyst with a subtle 1px inner glow. Ghost buttons are preferred for secondary actions to maintain low visual noise.
- **Inputs & Uploads:** Text fields use a 1px border that shifts to Cyber Blue on focus. The Document Upload component features a dashed 1px border and a subtle Charcoal gradient background, suggesting a drop zone.
- **Status Indicators:** Small, circular geometric pips. Emerald Green for "Passed," Amber for "Warning," and Red for "Failed."
- **AI Insight Cards:** These cards use a semi-transparent Amethyst border and a very faint purple gradient fill (5% opacity) to distinguish them from standard data cards.
- **Data Tables:** High-density rows (32px height) with thin horizontal dividers and alternate row striping using a 2% lighter charcoal tint.
- **Icons:** Sharp, 1.5px stroke geometric line icons. Avoid filled icons unless used as a status indicator.