# 04 - Frontend & Design System Implementation

## 1. Overview
The frontend is built using **React (Vite) + Tailwind CSS + shadcn/ui + Lucide React**, strictly adhering to the tokens, accessibility standards, and component guidelines specified in [PilaGo Design System](../PilaGo_Design_System.md).

---

## 2. Tailwind Configuration & Design Tokens (`tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#12345A', // Deep brand blue; headers
          800: '#174675', // Primary dark blue
          700: '#1D5B91', // Primary interaction
          600: '#2876B8', // Primary buttons & links
          500: '#3D8BCB', // Highlights / active accents
          100: '#E8F2FA', // Soft brand surface
          50: '#F4F8FC',  // Subtle background
        },
        gold: {
          700: '#A96F08', // Dark gold text
          500: '#E5A928', // Golden accent / 'Next in line'
          100: '#FFF4D8', // Highlight surface
        },
        semantic: {
          success: '#24734A',
          'success-bg': '#E5F4EB',
          destructive: '#B83232',
          'destructive-bg': '#FCE8E8',
          waiting: '#1D5B91',
          'waiting-bg': '#E8F2FA',
        },
      },
      fontFamily: {
        sans: ['"Nunito Sans"', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: '14px', // Cards
        md: '10px', // Buttons and Inputs
        sm: '8px',  // Small controls
      },
      boxShadow: {
        subtle: '0 2px 8px rgba(18, 52, 90, 0.06)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

## 3. Core Component Mapping

| UI Component | Implementation Foundation | PilaGo Specification |
|---|---|---|
| **Buttons** | `shadcn/ui/button` | Heights: 40px (desktop), 48px (mobile primary); `bg-brand-600 hover:bg-brand-700 text-white` |
| **Queue Number Display** | Custom `QueueNumberBadge` | 48–56px `Nunito Sans` font-extrabold with `tabular-nums` |
| **Status Badges** | `shadcn/ui/badge` | Pair text + icon; Soft surface fills: Waiting (`brand-100`), Next (`gold-100`), Done (`green-100`) |
| **Fare Calculator Card** | Custom `FareBreakdownCard` | Itemized base fare, distance rate, discount tag, and prominent final ₱ amount |
| **Trip Ticket Modal** | `shadcn/ui/dialog` | Displays QR code for driver verification, driver details, and receipt summary |
| **Data Tables** | `shadcn/ui/table` | Admin tables with sorted columns, filter bar, and responsive card view on mobile |

---

## 4. Role-Specific Screen Specifications

### 4.1 Passenger Portal (Mobile-First)
- **Home / Join Queue View:**
  - Terminal selector dropdown (or auto-selected via scanned URL e.g. `pilago.ph/join?terminal=bayan-central`).
  - Destination Zone selector (displays live calculated fare for Regular vs Special).
  - Trip Type radio selector (`Regular (Shared)` vs `Special (Solo)`).
  - Discount indicator: Shows verified discount tag (e.g., "Student 20% Applied") or prompt to upload ID in Profile.
  - Primary button: "Join Queue" (48px height, `brand-600`).
- **Active Queue View:**
  - Large Queue Card:
    - Status Badge (e.g. `Waiting in Queue` or `Tricycle Ready`).
    - Huge Queue Number (e.g., `R-101`).
    - Position Indicator: "3 people ahead of you".
    - Destination & Terminal info.
    - Transparent Fare Tag: "₱20.00 (Cash on Drop-off)".
  - "View Trip Ticket / QR" button.
  - "Leave Queue" safe-action button with confirmation dialog.

### 4.2 Driver Portal (Mobile-First)
- **Top Bar:** Driver body number badge (`#042`), Terminal name, Availability toggle (Online / Queued / Paused).
- **FIFO Queue Status Card:**
  - "Your Turn: #2 in Line" (with real-time count of total queued tricycles).
- **Active Assignment Panel (When Called):**
  - Alert banner: "You are assigned to Boarding Bay 1!"
  - Trip Type badge: `REGULAR TRIP (4 Passengers)` or `SPECIAL TRIP (Solo)`.
  - Passenger boarding list with destinations and individual fares.
  - Total trip revenue accumulator (e.g. `Total Fare: ₱80.00`).
  - Primary Action Button: **"Dispatch Now / Depart"** (active when 4 passengers boarded OR used as manual override when ready to leave).

### 4.3 Administrator Portal (Desktop / Responsive)
- **Sidebar Navigation:**
  - Overview / Dashboard
  - Terminals & Fare Matrix
  - Active Queue Records
  - Driver Roster & Approvals
  - Discount ID Verification
  - Reports & Analytics
- **Live Terminal Monitor:** Real-time dual list showing active passenger queue alongside FIFO driver queue.
- **Fare Matrix Manager:** Table of destination zones with distance ($d$), base fare overrides, and immediate fare simulator.
- **Discount Approval Center:** Split view showing passenger ID upload photo, OCR/ID details, and One-Click Approve / Reject buttons.

### 4.4 Public Terminal Queue Board (TV / Monitor Screen)
- **Display Resolution:** Optimized for 1080p / 4K full-screen displays in waiting sheds.
- **Left Column:** "NOW BOARDING / SERVING"
  - Huge tabular cards for regular batches (`R-098`, `R-099`, `R-100`, `R-101`) assigned to Tricycle Body `#042`.
  - Special trip box (`S-041`) assigned to Tricycle Body `#019`.
- **Right Column:** "UPCOMING IN QUEUE"
  - Next 5-10 queue numbers with estimated boarding bay.
- **Audio Chime:** Web Audio API subtle chime triggered when a new queue number transitions to `CALLED`.
- **Theme:** High-contrast Dark theme (`#101923` background, `#FFFFFF` cards, `#E5A928` highlights) for maximum outdoor daylight readability.
