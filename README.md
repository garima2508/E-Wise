# E-Wise — Smart E-Waste Management Portal

E-Wise is a full-stack web application built to simplify how households dispose of old electronics and how local collection hubs manage pickups. Instead of letting broken laptops, old phones, and dead batteries sit in drawers or end up in landfills, E-Wise lets users bundle their e-waste into a single pickup request, track the collection in real time, and earn reward points once the handover is verified.

---

## Why I Built This

Most people want to dispose of old gadgets responsibly, but finding a legitimate recycling center or coordinating a pickup is usually inconvenient. On the flip side, municipal collection teams often deal with incomplete requests, mismatched items at the doorstep, and inefficient routing.

I built E-Wise to bridge that gap with a two-sided workflow:
- **For Recyclers (Citizens):** A simple way to bundle multiple devices, upload condition photos, schedule a pickup slot, and earn redeemable points.
- **For Operations (Hub Teams):** A clean queue to inspect uploaded photos, auto-assign the nearest field worker based on locality, verify pickups via QR codes, and export collection reports.

---

## Key Features

### Recycler Side
- **Multi-Device E-Waste Cart:** Add multiple items (laptops, smartphones, batteries, chargers) in one go instead of raising separate requests for every cable.
- **Condition-Based Routing & Photo Upload:** Select whether a device is reusable, needs minor repair, or is pure scrap, and attach a photo so the collection team knows what to expect.
- **Pre-Pickup Request Analysis:** Preview estimated E-Points and disposition routing before locking in a pickup date and time slot.
- **4-Stage Live Tracking & Notifications:** Track every submission from *Request Received* $\rightarrow$ *Worker Dispatched* $\rightarrow$ *QR Verified* $\rightarrow$ *Points Credited*, with persistent stage-by-stage notifications.
- **CO₂ & Water Impact Calculator:** Automatically calculates carbon emissions prevented and clean water conserved based on verified pickups.
- **Rewards Store & Regional Info:** Redeem earned E-Points for repair discounts and eco-vouchers, explore active collection hubs across Mumbai, Delhi, and Bengaluru, and access official recycling guidelines.

### Operations / Admin Side
- **Smart Locality-to-Worker Matching:** Automatically recommends the closest field worker hub by matching keywords from the user's area/locality.
- **QR Code Handshake Verification:** Every accepted request generates a unique QR code (`QR-EW-XXXX`). Points are held until the field worker scans the QR code at pickup—and if the item doesn't match the submission, it can still be rejected with a documented reason.
- **One-Click CSV Audit Export:** Download complete collection logs (Request ID, devices, locality, assigned worker, verification status) for municipal compliance and record-keeping.

---

## Tech Stack

- **Frontend:** React (Vite), React Router, Tailwind CSS, Framer Motion, Lucide Icons, Canvas Confetti
- **Backend:** Node.js, Express.js
- **Database:** SQLite (`sqlite` & `sqlite3`)

---

## Getting Started Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) installed on your machine.

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/E-Wise.git](https://github.com/your-username/E-Wise.git)
cd E-Wise
