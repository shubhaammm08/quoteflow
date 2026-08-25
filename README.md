# QuoteFlow AI — Quotation Builder

**QuoteFlow AI** is a modern, responsive 3-step web application that transforms raw customer inquiry messages (emails, WhatsApp chats, plain text) and PDF uploads into formatted, professional sales quotations and print-ready PDF documents using AI-assisted extraction and dynamic price calculations.

---

## 🚀 Quick Start & How to Run

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.

### Installation & Running

1. **Install Dependencies**
   Open your terminal in the project directory and run:
   ```bash
   npm install
   ```
   This will install required packages like `pdf-parse` and `pdf-lib`.

2. **Start the Server**
   Start the local Express server by running:
   ```bash
   node server.js
   ```
   You should see a message in the terminal saying: `QuoteFlow AI server running at http://localhost:3005/`

3. **Open the Application**
   Open your web browser and navigate to:
   [http://localhost:3005/](http://localhost:3005/)

---

## 📋 The 3-Step Workflow

### Step 1: Input Request
- **Purpose**: Intake raw customer inquiry messages or PDF uploads.
- **Features**: Paste inquiries directly, or upload PDF quotations. AI is used to intelligently extract customer names, emails, billing addresses, line items, and quantities.

### Step 2: Review Details
- **Purpose**: Inspect, calculate, and modify quotation information.
- **Features**: 
  - Edit customer info, items, and terms.
  - Interactive table to add/duplicate/remove line items.
  - Real-Time Price Calculations for subtotal, GST (18%), discounts, and grand totals.
  - Currency Switcher (INR, USD, EUR).

### Step 3: Summary & PDF Generation
- **Purpose**: Render the final A4 quotation sheet for client review and printing.
- **Features**: 
  - Summary card & pre-flight validation.
  - Pixel-perfect A4 printable layout.
  - Zoom controls, Share URL, Print, and Download PDF options.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Tailwind CSS (via CDN) with custom theme extensions (`tailwind-theme.js`).
- **Backend**: Zero-dependency Node.js HTTP server (`server.js`).
- **AI Integration**: Google Gemini Flash API for intelligent structured entity extraction from raw text/PDFs, with a regex fallback.
- **State Management**: Client-side single source of truth saved in `localStorage`.

---

## 📁 File Structure

```
.
├── QuoteFlow_AI_Quotation_Builder.html  # Step 1: Input Request Page (Main Entry)
├── Step_2_Review_Details.html           # Step 2: Review & Edit Details Page
├── Step_3_Summary_PDF.html              # Step 3: Summary PDF Preview Page
├── scripts.js                           # Core JS Application Logic & Event Handlers
├── server.js                            # Local Node HTTP Server
├── tailwind-theme.js                    # Tailwind CSS Custom Configuration & Tokens
└── package.json                         # Node dependencies
```
