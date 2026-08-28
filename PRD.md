
# Product Requirements Document (PRD): Revigora Landing Page & Waitlist Architecture

## 1. Executive Summary & Brand Foundation

###### 1.1 Product Purpose

Revigora is a premium Direct-to-Consumer (DTC) biomarker testing and proactive health intelligence platform launching first in Denmark, followed by expansion into the broader Nordic region (Sweden, Norway, Finland). The platform transforms complex internal biological data into clear, actionable health performance protocols.

### 1.2 Target Persona (Ideal Customer Profile)

* **Demographics:** Male-skewed (70% male, 30% female focus), ages 25–45, residing in Denmark/Nordics. Mobile-first browser behavior (65%+ traffic via iOS/Android).
* **Psychographics:** High-performers, biohackers, endurance athletes, corporate executives, and longevity-focused individuals. They value data-driven optimization, energy efficiency, cognitive clarity, and physical longevity on the go.
* **Pain Points:** Standard Danish healthcare systems only test blood when individuals are clinically ill; high barriers to entry for advanced longevity diagnostics; confusing diagnostic jargon; fragmented testing solutions; poorly formatted mobile health applications.

### 1.3 Brand Positioning & Tone

* **Positioning:** Premium accessibility. Avoids exclusionary luxury, mass-market healthcare aesthetics, or sterile clinical vibes.
* **Tone of Voice:** Authoritative, direct, encouraging, scientifically grounded, highly readable across all screen sizes.

### 1.4 Visual Identity & Design System Tokens

```css
:root {
  /* Color Palette */
  --color-bg-linen: #F3E8DB;          /* Primary Canvas Background */
  --color-mint-leaf: #54B697;         /* Primary Brand & Conversion Actions */
  --color-tropical-teal: #47AEA5;     /* Secondary Brand Accent & Highlights */
  --color-silver: #A3A3A3;            /* Borders, Subtitles, Secondary UI */
  --color-text-primary: #141414;      /* High-contrast Typography */
  --color-white-surface: #FFFFFF;     /* Elevated Card Containers */
  
  /* Responsive Typography Scale */
  --font-display: 'Instrument Serif', Georgia, serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;

  /* Touch Targets & Layout Standards */
  --container-max-width: 1200px;
  --radius-card: 16px;
  --radius-pill: 9999px;
  --radius-button: 8px;
  --min-touch-target: 48px;           /* Mobile Accessibility Standard */
}

```

---

## 2. Responsive Breakpoint Matrix & Layout Strategy

To ensure zero interface degradation on any device, the layout adheres to a mobile-first responsive strategy with two explicit breakpoint targets:

* **Mobile Breakpoint (Viewport < 768px):** Single-column stacked layouts, full-width touch targets (minimum height 48px), optimized padding (16px lateral margin), fixed bottom-docked CTAs, and collapsed hamburger or minimal top navigation.
* **Desktop Breakpoint (Viewport ≥ 768px):** Multi-column grid systems (up to 3 columns), standard top navigation bar, side-by-side component alignments, max container constraint of 1200px, and hover states.

```
       MOBILE (Viewport < 768px)                DESKTOP (Viewport ≥ 768px)
+------------------------------------+    +------------------------------------+
| [Logo]                    [Action] |    | [Logo]      [Nav Links]   [Action] |
+------------------------------------+    +------------------------------------+
|                                    |    |                                    |
| HERO (Headline stacked above image)|    | HERO (50/50 split or wide banner)  |
| Full-width 48px touch CTA          |    | Inline auto-width CTA button       |
|                                    |    |                                    |
+------------------------------------+    +------------------------------------+
| VALUE PROPS (1 Column vertical)    |    | VALUE PROPS (3 Columns horizontal) |
| [Card 1]                           |    | [ Card 1 ] [ Card 2 ] [ Card 3 ]   |
| [Card 2]                           |    |                                    |
| [Card 3]                           |    +------------------------------------+
+------------------------------------+    | PACKAGES (3 Columns horizontal)    |
| PACKAGES (Vertical Carousel/Stack) |    | [ Tier 1 ]  [ Tier 2 ]  [ Tier 3 ] |
| [ Tier 1 ]                         |    +------------------------------------+
| [ Tier 2 (Highlighted) ]           |    | HOW IT WORKS (Horizontal timeline) |
| [ Tier 3 ]                         |    | [1] ----> [2] ----> [3] ----> [4]  |
+------------------------------------+    +------------------------------------+

```

---

## 3. High-Level User Flow

```
[ Visitor Lands on Revigora Homepage ]
                 │
                 ▼
[ Mobile/Desktop Scrolling through Value Prop, Process, Package Options, Founder Letter ]
                 │
                 ▼
[ Tap/Click "Get Started", "Select Package", or "Join Waitlist" ]
                 │
                 ▼
[ Bottom-Sheet Modal (Mobile) or Centered Modal (Desktop) Triggered ]
                 │
                 ▼
[ Touch-Optimized Form Submission → Confirmation Screen + Dynamic Referral Link ]

```

---

## 4. Structural Section-by-Section Specifications

### Section 0: Global Navigation Header

* **Desktop (≥ 768px):** Fixed header (`height: 72px`), space-between alignment. Left: Logo mark. Center: Anchor links (*Packages, Process, Science*). Right: "Reserve Access" CTA.
* **Mobile (< 768px):** Compact sticky header (`height: 56px`), reduced horizontal padding (16px). Left: Logo mark. Right: Compact "Reserve" pill button (`height: 40px`, `#54B697`). Hides secondary nav items to eliminate header clutter.

---

### Section 1: Hero Section (Editorial Media Feature)

* **Goal:** Hook high-intent users immediately across mobile viewports without forcing vertical scrolling for key messaging.

#### Copy Matrix

* **Eyebrow:** `PREVENTATIVE HEALTHCARE FOR THE NORDICS` (Inter, Upper Case; Mobile: 10px; Desktop: 12px; Silver `#A3A3A3`, Tracking +0.1em).
* **Headline:** *"Stop guessing your health. Measure what matters inside."* (Instrument Serif; Mobile: 36px/42px leading; Desktop: 56px/64px leading; Near-black `#141414`).
* **Sub-headline:** *"Advanced blood biomarker testing, tailored longevity insights, and medical-grade protocols—designed for high performers in Denmark."* (Inter; Mobile: 15px/22px leading; Desktop: 18px/28px leading).
* **Primary CTA:** `Join the Danish Launch Waitlist →` (Mint Leaf `#54B697`; Mobile: `width: 100%`, `height: 52px`; Desktop: `width: auto`, `padding: 16px 32px`).

#### Media Asset & Adaptive Rules

* **Desktop:** Side-by-side or wide aspect media block (16:9 aspect ratio).
* **Mobile:** Media rendered directly below text content in a square/portrait aspect ratio (4:5) with optimized WebP compression to preserve LCP < 1.2s on 4G cellular connections.

---

### Section 2: "Testing Made Easy" (Value Proposition Grid)

* **Goal:** Eliminate friction and common fears around venous blood draws and lab mechanics.
* **Responsive Behavior:**
* Desktop: 3-column equal grid.
* Mobile: 1-column vertically stacked list with 12px spacing between cards.

#### Content Specifications

1. **Local Partner Clinics:** Over 50 sample collection points across Copenhagen, Aarhus, and Odense. Walk in or book online in under 60 seconds.
2. **Clinical-Grade Diagnostics:** All samples are processed through ISO 15189-certified Danish diagnostic laboratories.
3. **Actionable Digital Dashboard:** Clear biomarker readings paired with personalized, actionable lifestyle and supplementation protocols instead of ambiguous lab ranges.

---

### Section 3: Package & Membership Selection Cards

* **Goal:** Showcase the three core offerings clearly with immediate conversion triggers.

#### Layout Adaptation

* **Desktop (≥ 768px):** 3-column side-by-side layout. Highlighted Tier 2 features a subtle vertical scale up (`transform: scale(1.03)`).
* **Mobile (< 768px):** Single-column stacked cards. Tier 2 (Longevity & Healthspan) appears **first** or retains visual prioritization via a persistent "Most Popular" top banner to maximize mobile conversion.

#### Card Breakdown Specs

| Attribute             | Tier 1: Performance & Fitness                                      | Tier 2: Longevity & Healthspan                                                           | Tier 3: Revigora Membership                                                    |
| --------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Badge**       | Essential Baseline                                                 | Most Popular                                                                             | Continuous Optimization                                                        |
| **Target**      | Athletes, Gym-goers, Energy Focus                                  | Biohackers, Executive Health, Anti-Aging                                                 | Long-term Trackers                                                             |
| **Biomarkers**  | 28 Biomarkers                                                      | 45+ Biomarkers                                                                           | 45+ Biomarkers (Tracked 4x/yr)                                                 |
| **Key Metrics** | Testosterone/Hormones, Metabolic, Lipid Panel, Vitamin D, Ferritin | Everything in Performance + ApoB, hs-CRP, Fasting Insulin, Biological Age Score, Thyroid | Quarterly panels, Trend Analytics, Physician Reviews, Supplement Stack Updates |
| **Price**       | **2,490 DKK**                                                | **3,990 DKK**                                                                      | **1,190 DKK / quarter**                                                  |
| **Mobile CTA**  | 100% width button (50px h)                                         | 100% width button (50px h, Mint Leaf)                                                    | 100% width button (50px h)                                                     |

---

### Section 4: Founder’s Mini Sales Letter

* **Goal:** Build human trust, explain brand origins, and establish empathy.
* **Responsive Styling:** Mobile font size drops to 15px with 1.6 line height for fast scanning.

#### Copy Payload

> "I founded Revigora because the standard healthcare system in Denmark is built for reactive treatment, not proactive human performance. When I tried to optimize my own energy, hormones, and longevity markers, I was repeatedly told that standard blood tests were unnecessary unless I was already sick. We built Revigora to give ambitious individuals complete ownership over their internal biology with clinical clarity. By measuring what actually drives healthspan, we empower you to look, feel, and perform at your absolute peak."
> — **Founder, Revigora**

---

### Section 5: Step-by-Step Process ("How It Works")

* **Goal:** De-risk the conversion by walking through the entire process.
* **Desktop Layout:** Horizontal 4-step row with directional arrows (`[01] -> [02] -> [03] -> [04]`).
* **Mobile Layout:** Vertical timeline indicator with a left-aligned Mint Leaf connecting accent line (`border-left: 2px solid #54B697`).

1. **Select Panel:** Choose your targeted diagnostic suite online in seconds.
2. **10-Minute Collection:** Visit a partner clinic nearby in Copenhagen, Aarhus, or Odense for a fast sample collection.
3. **Advanced Lab Analysis:** Certified Danish laboratories analyze your blood markers within 3–5 business days.
4. **Optimize Your Health:** Access your personalized online dashboard with biological age metrics, target ranges, and actionable health protocols.

---

### Section 6: Secondary Conversion Opportunity (CTA Banner)

* **Visual Style:** Full-width container in Tropical Teal (`#47AEA5`). On mobile, paddings compress from 80px top/bottom to 36px top/bottom.
* **Headline:** *"Ready to unlock your biological potential?"* (Mobile: 28px; Desktop: 40px).
* **Sub-text:** *"Join over 1,500 health-conscious Nordics currently waiting for our early access batch."*
* **CTA Button:** `Join the Membership Waitlist →` (Full width on mobile, auto width on desktop).

---

### Section 7: Global Footer & Social Links

* **Layout Adaptation:**
* **Desktop:** Multi-column footer layout (Brand, Quick Links, Legal, Location).
* **Mobile:** Centered 1-column layout. Stacked links with 16px vertical gap for easy thumb tapping.
* **Elements:**
* **Brand Column:** Revigora Logo, Tagline (*Proactive Health Intelligence for the Nordics*), © 2026 Revigora ApS.
* **Location Badge:** 🇩🇰 Designed & Engineered in Copenhagen, Denmark.

---

## 5. Mobile & Desktop Waitlist UX Specifications

### 5.1 Trigger & Container Behavior

* **Desktop (≥ 768px):** Triggers a centered modal (`max-width: 560px`, `backdrop-filter: blur(8px)`).
* **Mobile (< 768px):** Triggers an iOS-style **Slide-up Bottom Sheet** (`height: 92vh`, rounded top corners `24px 24px 0 0`) with a visible drag indicator handle at the top. This allows single-handed thumb completion without requiring full-screen navigation switches.

### 5.2 Responsive Form Flow

```
[ Step 1: Intent Selection ] ──► [ Step 2: Contact Info ] ──► [ Step 3: Referral & Position ]

```

* **Touch Optimizations:**
* Input field heights set to minimum 48px to prevent accidental mis-taps.
* Form inputs leverage appropriate mobile keyboard flags (`type="email"`, `autocomplete="given-name"`, `inputmode="text"`).
* System font scales to at least 16px inside form fields to prevent iOS automatic browser zooming on input focus.

#### Step 1: User Intent & Preference Selection

* **Heading:** *"Which panel fits your health goals?"*
* **Fields:** Large block selector buttons (Stacked vertically on mobile, full width).
* Preference: `[ Performance & Fitness ]` | `[ Longevity & Healthspan ]` | `[ Quarterly Membership ]`

#### Step 2: Contact Information

* **Fields:**
* Full Name
* Email Address
* Primary City Dropdown (Optimized native select picker on mobile for easier scrolling: *Copenhagen, Aarhus, Odense, Other*)

#### Step 3: Confirmation & Native Mobile Sharing

* **Heading:** *"You're on the list for early access."*
* **Dynamic Badge:** `Your Priority Position: #142`
* **Mobile Native Share Integration:** On phone viewports, the standard text link field is supplemented with a `Web Share API` trigger button: `[ Share via SMS / WhatsApp ]`.

---

## 6. Technical Performance Requirements Across Breakpoints

1. **Mobile Performance Target:** PageSpeed Index score ≥ 90 on 4G Mobile networks. Largest Contentful Paint (LCP) < 1.5 seconds. Cumulative Layout Shift (CLS) = 0.
2. **Touch Targets:** Minimum interactive element dimensions of `48px x 48px` with clear visual active/pressed states.
3. **Adaptive Media Loading:** Responsive image assets delivered via `<picture>` elements with native lazy loading for below-the-fold components.
4. **Analytics Events:** Standardized tracking across desktop and mobile viewports (`mobile_modal_open`, `desktop_modal_open`, `waitlist_completed`).

---
