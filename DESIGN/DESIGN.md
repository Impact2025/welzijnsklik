---
name: Zorgklik Healthcare System
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#404751'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#717783'
  outline-variant: '#c0c7d3'
  surface-tint: '#0061a5'
  primary: '#005e9f'
  on-primary: '#ffffff'
  primary-container: '#0077c8'
  on-primary-container: '#fbfbff'
  inverse-primary: '#9fcaff'
  secondary: '#485f84'
  on-secondary: '#ffffff'
  secondary-container: '#bbd3fd'
  on-secondary-container: '#445a7f'
  tertiary: '#785500'
  on-tertiary: '#ffffff'
  tertiary-container: '#986c00'
  on-tertiary-container: '#fffbf9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#9fcaff'
  on-primary-fixed: '#001d36'
  on-primary-fixed-variant: '#00497e'
  secondary-fixed: '#d5e3ff'
  secondary-fixed-dim: '#b0c7f1'
  on-secondary-fixed: '#001b3c'
  on-secondary-fixed-variant: '#30476a'
  tertiary-fixed: '#ffdea8'
  tertiary-fixed-dim: '#ffba20'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5e4200'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  caption:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is engineered to bridge the gap between high-efficiency SaaS and the human-centric world of elder care. The visual language is **Human-Centered Modernism**: a blend of professional corporate reliability and warm, empathetic accessibility. 

The aesthetic is clean and spacious, prioritizing clarity of information to reduce cognitive load for healthcare professionals. It utilizes a "Soft-Tech" approach—combining the precision of modern software with rounded geometries and a calming light-mode palette to evoke trust and approachability.

Key brand attributes:
- **Empathetic:** Generous whitespace and soft edges suggest care and patience.
- **Reliable:** A structured grid and strong blue tones establish medical-grade authority.
- **Refreshing:** High-contrast accents prevent the UI from feeling sterile or clinical.

## Colors

The palette is anchored by **Bright Corporate Blue**, used for primary actions and brand presence. **Dark Navy** provides grounding for typography and structural elements, ensuring high legibility and a sense of "medical-grade" stability. 

**Golden-Yellow** is reserved exclusively for high-priority Call-to-Actions and urgent notifications, acting as a warm, energetic beacon within the professional blue environment. The background utilizes off-whites and very light greys to reduce eye strain during long shifts.

- **Primary (#0077C8):** Interaction states, links, and primary branding.
- **Secondary (#1D3557):** Headers, navigation backgrounds, and deep contrast text.
- **Accent (#FFB800):** Main CTAs and high-priority alerts.
- **Neutral (#F8F9FA):** Main page backgrounds and subtle section containers.

## Typography

The design system exclusively uses **Outfit**, a geometric sans-serif that feels contemporary yet approachable. Its wide apertures and balanced x-height ensure excellent legibility for users of all ages, including those with minor visual impairments common in elder care contexts.

- **Headlines:** Use Semi-Bold (600) or Bold (700) weights to establish clear hierarchy.
- **Body Text:** Standardize on 16px (body-md) for general interface text to ensure comfort.
- **Tracking:** Headlines use a slight negative tracking (-0.02em) for a more "designed" SaaS feel, while labels use positive tracking (0.01em) for clarity at small sizes.

## Layout & Spacing

This design system employs a **Fluid Grid** model based on an 8px square rhythm to ensure mathematical harmony across all components.

- **Desktop:** 12-column grid with 24px gutters. Content is usually centered with a max-width of 1440px.
- **Tablet:** 8-column grid with 20px gutters.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.
- **Spacing Philosophy:** Use generous "breathing room" (md/lg spacing) between logical sections to maintain the "Empathetic" brand pillar. Information-dense dashboards may shift to a 4px/8px (base/xs) rhythm for data tables only.

## Elevation & Depth

To maintain a soft and approachable feel, this design system avoids harsh borders in favor of **Ambient Shadows**. Depth is used to communicate interactivity and information hierarchy.

- **Surface Level (0dp):** The main background (#F8F9FA).
- **Card Level (1dp):** White surfaces with a very soft, diffused shadow: `0px 4px 20px rgba(29, 53, 87, 0.05)`.
- **Overlay Level (2dp):** Modals and dropdowns with a deeper, more defined shadow: `0px 12px 32px rgba(29, 53, 87, 0.12)`.

Tinted shadows are used—using the Dark Navy (#1D3557) as the shadow base color instead of pure black—to keep the interface looking clean and sophisticated.

## Shapes

The shape language is defined by **16px (1rem) rounded corners** for all primary containers and cards. This specific radius creates a "friendly" container that avoids the clinical sharpness of traditional medical software.

- **Small Components:** Checkboxes and small tags use a 4px (Soft) radius.
- **Standard Components:** Buttons and Input fields use a 12px radius for a consistent but distinct look from larger cards.
- **Large Containers:** Cards, Modals, and Sidebars use the 16px (Rounded) radius.

## Components

### Buttons
- **Primary:** Bright Blue (#0077C8) background with White text. 12px corner radius.
- **CTA:** Golden-Yellow (#FFB800) background with Navy (#1D3557) text for maximum visibility.
- **Secondary:** Transparent with a 2px Border in Primary Blue.

### Cards
Cards are the primary vehicle for patient and task information. They feature a white background, 16px corner radius, and a 1px soft border in #E9ECEF to ensure they don't get lost on the neutral background.

### Input Fields
Inputs should feel accessible and easy to tap. Use a minimum height of 48px, a 12px radius, and a 1px border. When focused, the border should transition to 2px Primary Blue with a soft glow.

### Chips & Badges
Used for status indicators (e.g., "Active," "Scheduled"). These should have a pill-shape (full rounding) and use low-saturation background tints of the status colors with high-saturation text for readability.

### Lists
Healthcare data is list-heavy. Use "Divided Lists" where each row is separated by a subtle grey line (#E9ECEF) and features a subtle hover state (background change to #F1F3F5) to assist with tracking eyes across rows.