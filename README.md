# PoConuts — B2B Coconut Export Website

**Brand Name:** PoConuts (Coconuts from Pollachi)  
**Origin:** Pollachi, Coimbatore District, Tamil Nadu, India  
**Target Markets:** Bulk Buyers, Importers, Processors & Food Manufacturers in the **UAE** and **Vietnam**  
**Core Product:** Export-grade Semi-Husked Mature Coconuts (*Cocos nucifera*)  
**Verified DGFT HS Code:** `0801 19 10` (Fresh Coconuts / Semi-husked) | WCO 6-digit: `0801.19`

---

## 1. Project Architecture & Files

```
PoConuts/
├── index.html                 # Main Homepage (Hero, Quick Specs, Why Pollachi, Primary RFQ Form, Founder Story)
├── specs.html                 # Technical Product Specifications & Interactive Reefer Container Estimator
├── quality.html               # Farm-to-Container 5-Stage Quality & Sourcing System
├── compliance.html            # Regulatory Registrations, Phytosanitary, Fumigation & Honest Organic Status
├── about.html                 # Founder narrative & ethical smallholder sourcing from Pollachi
├── quote.html                 # Dedicated standalone B2B Request for Quotation (RFQ) Page
├── css/
│   └── styles.css             # Mobile-first responsive styling, agricultural palette, print datasheet rules
├── js/
│   ├── translations.js        # Bilingual dictionary (English & formal trade Vietnamese)
│   └── main.js                # Persistent i18n engine, calculator, RFQ handler, summary generator
├── assets/
│   ├── logo.svg               # Scalable vector logo (PoConuts - Pollachi • India)
│   ├── logo-icon.svg          # Favicon & mobile app icon
│   ├── logo.jpg               # AI-generated brand visual showcase
│   └── images/
│       ├── hero-pollachi.jpg      # Commercial B2B plantation photography in Pollachi
│       ├── product-specs.jpg      # Studio photography of semi-husked coconuts with protective tuft
│       └── sorting-facility.jpg   # Calibrated weight grading (400g–550g) export packing facility
└── README.md                  # Project documentation & CRM webhook setup guide
```

---

## 2. Key B2B Specifications & Guardrails Implemented

| Parameter | Specification / Standard |
| :--- | :--- |
| **Product** | Semi-husked mature coconuts (*Cocos nucifera*) |
| **Average Weight** | **450g** (tolerance band: **400g – 550g** per nut) |
| **Protective Tuft** | Intact fibrous tuft retained over the 3 germinative eyes to insulate against puncture & mould |
| **Cultivation** | Naturally grown using traditional pesticide-free agricultural methods |
| **Organic Status** | **NOT YET CERTIFIED ORGANIC**. State explicitly in disclaimers: *"Grown using traditional pesticide-free methods; formal organic certification in progress — not currently certified organic."* Zero standalone "Organic" claims. |
| **Origin** | Pollachi, Tamil Nadu, India (microclimate of Western Ghats, high copra thickness) |
| **HS Code** | **`0801 19 10`** verified against DGFT India ITC-HS Tariff Schedule |
| **E-Commerce** | **Zero consumer cart/checkout or per-unit pricing**. B2B negotiation by container volume. |
| **Primary CTA** | RFQ / Quote Request on every page |

---

## 3. Localization System (English & Vietnamese)

- **Default Language:** English (`en`).
- **Vietnamese (`vi`):** Complete professional translation using formal agricultural trade register (e.g., *Dừa già bán sơ dừa*, *Chỏm xơ bảo vệ*, *Điều kiện Incoterms*, *Sản lượng dự kiến*).
- **Persistent Switcher:** The `EN | VI` toggle button in the header and mobile drawer updates all `[data-i18n]` elements in real time and stores preference in `localStorage.getItem('poconuts_lang')`.
- **Strategic Decision on Arabic:**
  > **Note:** Arabic localization is deliberately held off for version 1.0. Field trade analysis confirms commercial importers, food processors, and customs clearing agents in the UAE (Jebel Ali, Dubai Wholesale Markets) conduct cross-border B2B procurement in English. Modern Standard Arabic (MSA) localization will be added in Phase 2 during regional retail expansion across the GCC and Saudi Arabia.

---

## 4. CRM & Webhook Integration Guide

The RFQ form in `js/main.js` validates user input, generates an inquiry reference ID (e.g., `PCN-2026-4892`), and structures a clean JSON payload:

```json
{
  "referenceId": "PCN-2026-4892",
  "timestamp": "2026-09-05T05:48:10.000Z",
  "language": "en",
  "company": "Al-Maha Foods LLC",
  "contactName": "Ahmed Mansoor",
  "email": "procurement@almaha.ae",
  "phone": "+971 50 123 4567",
  "country": "United Arab Emirates (UAE)",
  "portOfDischarge": "Jebel Ali, Dubai",
  "productInterest": "Semi-Husked Coconuts (400g–550g Standard)",
  "packaging": "PP Mesh Bags (50 nuts / ~23-25 kg)",
  "volume": "2 x 40ft HC Reefers per Month",
  "incoterm": "CIF (Cost, Insurance & Freight to Port of Discharge)",
  "message": "Target delivery starting next month. LC payment terms requested."
}
```

### Active Email Notification Routing
The form is actively configured to send formatted B2B inquiries directly to:
- **Primary Recipient**: `gggaravind@gmail.com`
- **CC Recipient**: `arunkumarakcv@gmail.com`

**First Submission Activation Note:**
When the first test submission is made, FormSubmit sends a one-time verification email to `gggaravind@gmail.com` with a button: *"Activate Form"*. Click that once, and all future buyer inquiries will automatically land in both inboxes with complete company, country, volume, and contact details!

---

### Connecting to CRM / Webhook (Optional Advanced Integration)
If you also want to route inquiries into a CRM (HubSpot, Zoho CRM, Salesforce) or Google Sheets:
In `js/main.js`, add a secondary webhook POST request inside `initQuoteForm()` pointing to your CRM webhook or Make.com / Zapier trigger.

---

## 5. Deployment Instructions

This is a zero-dependency static site. It can be hosted on any static host:

- **GitHub Pages:** Push to repository and enable GitHub Pages on branch `main` root `/`.
- **Netlify / Vercel:** Drag and drop directory or connect git repo (build command: *none*, publish directory: `.`).
- **Cloudflare Pages:** Connect repository with static deployment.
- **Nginx / Apache:** Serve directory as standard web root with `index.html` as directory index.
