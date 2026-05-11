---
name: Enterprise AI Design System
colors:
  surface: '#fcf8ff'
  surface-dim: '#dcd8e5'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#f0ecf9'
  surface-container-high: '#eae6f4'
  surface-container-highest: '#e4e1ee'
  on-surface: '#1b1b24'
  on-surface-variant: '#464555'
  inverse-surface: '#302f39'
  inverse-on-surface: '#f3effc'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#fcf8ff'
  on-background: '#1b1b24'
  surface-variant: '#e4e1ee'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
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
  xl: 48px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style
This design system is engineered for high-density enterprise environments where clarity and intelligence are paramount. The brand personality is **Precision-Led**, **Reliable**, and **Efficient**, aiming to evoke a sense of calm control amidst complex data workflows.

The design style follows a **Modern Corporate** aesthetic with a lean toward **Minimalism**. It prioritizes function over flourish, utilizing a limited color palette and intentional whitespace to reduce cognitive load. High-tech "AI" touches are introduced through crisp, hairline borders and subtle depth rather than aggressive gradients. The interface should feel like a sophisticated instrument—approachable for daily use but powerful enough for expert analysis.

## Colors
The palette is rooted in a "Clean Office" spectrum. The primary accent is a professional **Indigo**, used for key actions and focus states to signal intelligence and stability. **Slate Blue** serves as the secondary neutral-base, providing a softer alternative to pure black for text and icons.

**Active/Success States:** We utilize **Emerald Green** specifically for AI-driven "Active" states, verified insights, and successful completions.

**Dark Mode Strategy:** The system transitions from a white/light-gray foundation to a deep "Midnight Slate" (#0F172A) background. Surfaces in dark mode use increased tonal separation rather than shadows to define hierarchy.

## Typography
We utilize **Inter** across all levels for its exceptional legibility in data-heavy interfaces. The typographic scale is tightly controlled to maintain a professional hierarchy.

- **Headlines:** Use tighter letter spacing and semi-bold weights to anchor page sections.
- **Body Text:** Optimized for long-form reading with a standard 1.5x line height.
- **Data Labels:** Small, uppercase labels with increased tracking are used for metadata and table headers to distinguish them from actionable content.

## Layout & Spacing
The layout employs a **12-column Fixed Grid** for standard dashboards and a **Fluid Content Area** for data tables. 

A strict **4px baseline grid** governs all spacing. Vertical rhythm is maintained by using 16px (md) for standard component gaps and 24px (lg) for section margins. For AI chat interfaces or sidebars, use "compact" spacing (8px) to maximize information density without sacrificing touch targets.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Subtle Shadows**. Instead of heavy shadows, we use a "Layered Surface" approach:

1.  **Level 0 (Background):** #F8FAFC (Subtle Gray).
2.  **Level 1 (Cards/Containers):** #FFFFFF (Pure White) with a 1px border of #E2E8F0.
3.  **Level 2 (Dropdowns/Modals):** Pure White with a "Soft Ambient" shadow (0px 4px 12px rgba(0,0,0, 0.05)).

In Dark Mode, elevation is represented by shifting the surface color to a lighter shade of slate rather than adding shadow opacity.

## Shapes
This design system uses a **Small/Medium (6px-8px)** corner radius. This "Soft" geometry strikes a balance between the rigid precision of traditional enterprise software and the approachability of modern consumer apps.

- **Standard Components (Buttons, Inputs, Cards):** 6px radius.
- **Large Containers (Modals):** 8px radius.
- **Inner Elements (Tags/Chips):** 4px radius to maintain nested visual harmony.

## Components
- **Buttons:** Primary buttons use a solid Indigo background with white text. Ghost buttons use a 1px border (#E2E8F0) and slate text to indicate secondary actions. 
- **Input Fields:** Crisp 1px borders. On focus, the border transitions to Indigo with a subtle 2px outer glow (Primary color at 10% opacity).
- **Cards:** White background, 1px Slate-200 border, and no shadow unless hovered.
- **Chips/Tags:** Used for AI categories or status. Success tags use Emerald Green text on a 10% Emerald tint background.
- **AI Suggestion Box:** Distinctive component featuring a very subtle Indigo-to-Transparent left-to-right gradient border to signify "Machine Generated" content.
- **Data Tables:** Zebra-striping is avoided; use 1px horizontal dividers and high-contrast Slate-800 for header text.