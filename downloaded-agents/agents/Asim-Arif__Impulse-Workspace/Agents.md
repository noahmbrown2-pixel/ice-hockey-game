# Developer Agent Guardrails & Guidelines

You are an expert .NET/Blazor developer working on a legacy VB6 ERP migration project. Your primary task is converting legacy `.frm` layouts into modern, clean Blazor web components.

## 1. Database Schema & Data Integrity
- **CRITICAL:** Do not guess, assume, or invent database column names or properties (e.g., never invent fields like `EntryID` if the table uses `ID`).
- The complete, exact SQL Server schema definitions (Tables, Views, and Stored Procedures) are located in: `Schema/DBScriptsFull.sql`.
- You must parse and cross-reference this file before writing any data models, DTOs, or database bindings to ensure 100% naming accuracy.

## 2. Component Architecture
- **Code-Behind Separation:** Always separate presentation from logic. Do not write massive `@code` blocks inside the `.razor` file. Use a matching code-behind partial class file (e.g., `MyForm.razor` and `MyForm.razor.cs`).
- **State Management:** Bind form inputs cleanly to a structured data model or DTO class passed down from or managed by the parent container.

## 3. UI/UX & Design System
- **Design Tokens:** Adhere strictly to the Material Design 3 (MD3) styling established in our layout files. Maintain consistent spacing, padding, and border radiuses.
- **Form Fields:** Use `BlazorTypeahead` for lookups, dropdown selectors, and search fields.
- **Context Menus:** Use `BlazorContextMenu`. If a context menu is triggered via a top action button ("Options"), override the default mouse-click coordinate auto-flip logic by passing a fixed vertical Y-coordinate offset to force the menu to open downwards cleanly.

## 4. Verification
- All code must compile cleanly using a standard `dotnet build` without runtime errors or missing references.

## 5. Reference Templates & Design Patterns
When creating or modifying pages, do not invent new structural layouts. Use the following existing files as your blueprint templates:

- **List / Grid Views:** Use `EmployeeList.razor` and `Customer.razor` as your foundational templates for data grid layout, search filtering rows, and asynchronous loading states.
- **Context Menu Separation (Row State vs. Global):**
  - **Right-Click Menu (`Id="rowContextMenu"`):** Reserved *exclusively* for options that are directly linked to the current row state (e.g., Edit, Delete, View, or actions modifying that specific selected record).
  - **Top Options Button (`Id="optionsBarMenu"`):** Must contain all other general, global, or multi-item actions that do not depend on a single row's state. Force this menu to open downwards cleanly using fixed vertical coordinates.

## 6. Reporting & Printing Standards
- **Implementation Approach:** For all reporting, printing, and document export functionalities, strictly follow and replicate the exact approach and execution pattern used in the `EmployeeList` page. Do not invent alternative reporting triggers or data-fetching methods.

## 8. File Organization & Directory Structure
- **Module Isolation:** All new pages, components, and code-behind files for the Payroll module must be placed strictly within the payroll directory structure (e.g., `Pages/Payroll/` or `Components/Payroll/`). Do not leave files loose in the root layout or generic folders.
- **Code-Behind Placement:** The partial class file (`.razor.cs`) must always reside in the exact same directory as its corresponding presentation file (`.razor`).

## 9. Navigation & Dashboard Integration
When a new page or form is introduced, you must completely wire it into the application's UI hierarchy. Do not leave pages unlinked:
- **NavMenu Updates:** Update `Shared/NavMenu.razor` (or your central navigation component) to include a modern Material Design 3 styled link to the new page under the specific Payroll module section.
- **Module Dashboard Integration:** Add a quick-access link, metric card, or status tile for the new form to the **Payroll Module Dashboard** (`Pages/Payroll/PayrollDashboard.razor`) so it is instantly accessible to the end-user.
- **Routing:** Ensure the `@page` directive at the top of the new file matches our clean, restful URL routing conventions (e.g., `/payroll/new-employee`).

## 10. Multi-Tab & Complex Form Architecture
- **Monolith Prevention:** Never build large legacy forms (such as screens with multiple tabs or extensive field groupings) into a single, massive `.razor` file.
- **Parent Master Shell:** Create a lean parent container page (e.g., `NewItem.razor`) that is solely responsible for:
  - Initializing and managing the master shared state model or DTO.
  - Rendering the Material Design 3 tab navigation headers.
  - Handling global form validation and top-level Save/Cancel operations.
- **Child Tab Components:** Every individual tab must be extracted into its own completely separate, isolated child component file (e.g., `GeneralTab.razor`, `PricingTab.razor`). 
- **State Communication:** Pass the master data model down from the parent shell to these child tab components using cascading parameters or standard component data binding, ensuring all data updates feed back cleanly into the unified master state.

- **Code-Behind & C# Logic Reference:** If there is any structural or architectural confusion when writing the backend logic, use `EmployeeList.razor.cs` (or `EmployeeList.cs`) and `Customer.cs` as your definitive reference guides for service consumption, error handling, and data mapping.