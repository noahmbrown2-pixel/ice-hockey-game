# AI Agent Instructions for Aadat iOS App

## Project Context

You are assisting with "Aadat", a native iOS habit tracker and daily planner. The application relies heavily on timeline data visualization and a gamified ELO scoring system.

## Technical Constraints & Guidelines

- **Language & Framework:** Use Swift and SwiftUI exclusively. Do not suggest React Native paradigms or third-party bridging libraries.
- **Persistence:** Use SwiftData for local data storage.Do not use CoreData unless absolutely necessary for a migration.
- **Design Pattern:** Strictly enforce the MVVM (Model-View-ViewModel) architecture.
- **State Management:** Utilize `@State`, `@Binding`, `@StateObject`, and `@Published` property wrappers appropriately to manage data flow between Views and ViewModels.

## Architectural Rules

- **Models (`.swift`):** Must remain pure data structures. Define entities, time/duration objects, and recurrence enums here.
- **ViewModels (`.swift`):** All business logic must reside here. This includes the "You can't change the past" lock logic, ELO mathematical progression, and array sorting algorithms.
- **Views (`.swift`):** UI must be declarative. Use native system components (`List`, `LazyVGrid`, `TabView`, `VStack`, `ZStack`).

## UI/UX Directives

- **Apple HIG:** Prioritize Apple's Human Interface Guidelines to ensure users intuitively know how to navigate the app.
- **Intellectual Property:** Avoid copying "Trade Dress" (unique visual combinations, specific shapes, and color palettes) of other popular planner app Standard design paradigms like calendar grids or timelines are acceptable.
- **Development Flow:** Adopt a "Function-First" strategy. When generating code for a new feature, provide the basic structural layout (e.g., standard rectangles and circles) combined with working data logic before generating complex visual modifiers.
