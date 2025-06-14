# Vupop Interactive Financial Model

This project is an interactive financial dashboard designed for investors to model and visualize Vupop's potential exit scenarios. It combines a clean, modern user interface with a powerful financial modeling engine, all built to run seamlessly on GitHub Pages.

## Project Status (August 2024)

The core functionality of the interactive dashboard is complete. Investors can securely access the model, adjust key financial assumptions in a pop-up modal, and see real-time updates to KPIs and a 5-year projection chart. The application successfully parses data from an HTML export of the master financial spreadsheet.

## Key Learnings & Development Journey

The development process has been iterative, with several key challenges and learnings:

1.  **Initial Parsing Errors:** The first version of the calculation engine produced inaccurate numbers because it misinterpreted percentage-based values.
    *   **Learning:** Data parsing requires careful validation. We implemented a `parseValue` function to correctly handle different number formats (currency, percentages, plain numbers) before they are used in calculations.

2.  **UI Layout Refinement:** Refactoring the assumptions panel from a fixed sidebar to a pop-up modal initially broke the dashboard's grid layout.
    *   **Learning:** CSS `display: grid` can be brittle for overlapping elements. We switched the main container to a `display: flex` layout, which proved more robust and flexible for managing the modal overlay.

3.  **Advanced Parsing Logic:** The most significant challenge was accurately parsing the complex, multi-table HTML spreadsheet. The initial simple parser failed, leaving the assumptions modal empty.
    *   **Learning:** A simple DOM query is not enough for complex documents. We engineered a more intelligent, stateful parser that:
        *   Identifies distinct sections of the spreadsheet (e.g., "KEY ASSUMPTIONS", "COST STRUCTURE").
        *   Separates data into two distinct objects: `assumptions` for user-editable inputs and `fixedInputs` for non-editable, year-on-year data.
        *   This approach not only fixed the bug but also created a much cleaner and more resilient data architecture for the application.

## Next Steps & Future Plans

- [ ] **Expand Visualizations:** Add more charts to visualize other key metrics like revenue breakdown (B2C vs. B2B) and cost structure over time.
- [ ] **Scenario Analysis:** Implement a feature to save and compare different financial scenarios.
- [ ] **UI/UX Polish:** Continue to refine the user interface, improve responsiveness, and add more contextual information.
- [ ] **Code Refactoring:** Review and refactor the calculation engine for clarity and performance as more complexity is added.

---

## Original Project Requirements

### 1. Interactive Dashboard UI
- A dynamic and responsive dashboard inspired by modern analytics platforms.
- The UI will include:
    - Main navigation
    - Data filters
    - Key Performance Indicator (KPI) cards
    - Interactive charts and graphs
    - Detailed data tables

### 2. Financial Modeling Engine
- The core financial logic, derived from the provided spreadsheet, will be implemented in JavaScript.
- Investors will be able to adjust key assumptions (e.g., user growth, monetization rates) to see the impact on the valuation.

### 3. Dynamic Real-time Updates
- All components of the dashboard—KPIs, charts, and tables—will update instantly in response to changes in the financial model's assumptions.

### 4. Secure Access
- The application will be protected by a client-side password prompt.
- The dashboard and its data will only be accessible after successful authentication.

### 5. Modern Technology Stack
- The project will follow a modular and maintainable structure:
    - **`index.html`**: The main entry point for the application.
    - **`css/style.css`**: For all styling and presentation.
    - **`js/`**: A directory for modular JavaScript files, separating concerns like state management, UI manipulation, and financial calculations.

### 6. GitHub Pages Deployment
- The entire application will be built as a static website, ensuring it can be easily deployed and hosted on GitHub Pages. 