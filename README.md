# Vupop Investor Data Room & Exit Valuation Dashboard

## Purpose
This project is a premium, investor-facing data room for Vupop, designed to model exit valuation scenarios, benchmark against market comps, and provide clear fundraising context. The dashboard is information-dense, visually modern, and built for rapid, data-driven investor decision-making.

## Approach & Philosophy
- **Investor-First UX:** Every element is designed for clarity, density, and premium feel—mirroring best-in-class SaaS and analytics dashboards.
- **Separation of Concerns:** Fundraising metrics (cap table, SEIS, valuation, round targets) are visually and structurally separated from business model forecasting (KPI cards, projections, benchmarking).
- **Live, Modular JS:** All calculations and UI updates are modularized. Changing any assumption instantly updates all widgets, charts, and tables.
- **Brand Consistency:** All yellow text and highlights use Vupop yellow `#FFFF00` for maximum brand impact.
- **Benchmarking:** Key metrics are benchmarked against recent market comps (Discord, Reddit, Truth Social, etc.) to contextualize Vupop's exit potential.

## Key Features
- **KPI Cards:** Dense grid of valuation, MAU, revenue, EBITDA, margin, etc., with sublabels and tooltips for investor context.
- **Charts:** Financial projections, benchmarking bar chart, and a cap table pie chart.
- **SEIS Gauge:** Curved arc widget showing SEIS amount remaining, styled for clarity and compliance.
- **Narrative/Insights:** Dynamic, investor-focused narrative at the top, always aligned with the latest model and market analysis.
- **Assumptions Modal:** Grid-based, compact, with tooltips and default values for all key drivers.
- **Responsive & Secure:** Fully responsive, password-protected, and deployable as a static site (GitHub Pages).

## Why This Structure?
- **Investor Clarity:** Investors see the most relevant exit and fundraising data first, with context and comparables.
- **Data-Rich, Not Overwhelming:** Small fonts, tight spacing, and premium card design maximize information per pixel without clutter.
- **Extensible:** Modular JS and clear separation of UI/state/calculation logic make it easy to add new metrics, charts, or scenarios.

## For Future Developers & AI
- **Extend by Adding Widgets:** New KPIs or charts can be added by extending the modular JS files and updating the main dashboard layout.
- **Maintain Brand Consistency:** Always use #FFFF00 for yellow, and keep the UI dense and premium.
- **Keep Investor Context:** Every widget, label, and tooltip should help an investor understand Vupop's exit potential and fundraising status.
- **Scenario Analysis:** Future work should allow saving and comparing multiple assumption sets.

## Codebase Structure
- `index.html`: Main entry point and dashboard layout.
- `css/style.css`: All styling, with emphasis on premium, dense, dark UI and Vupop yellow.
- `js/`: Modular JS for state, UI, calculations, and authentication.
- `vupop_financial_model_spreadsheet.html`: Parsed source for all financial data and assumptions.

## Deployment
- Static site, easily deployed to GitHub Pages for secure, shareable investor access.

---

**This README is designed to help future devs, AI agents, or collaborators quickly understand the what, why, and how of the Vupop investor dashboard.** 