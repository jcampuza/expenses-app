# Component Architecture

This document outlines the component organization and architecture in the expenses app.

## UI Framework

This project uses [shadcn/ui](https://ui.shadcn.com/), a component library built on top of Radix UI primitives and Tailwind CSS. shadcn/ui provides accessible, customizable components that serve as the foundation of our design system.

## Component Organization

### `src/components/ui/` - Design System Components

The `components/ui/` folder contains **building block components** that form the foundation of our design system:

- **shadcn components**: Core UI primitives installed from shadcn/ui (buttons, inputs, dialogs, etc.)
- **Design system extensions**: Custom variations and extensions of shadcn components
- **Reusable primitives**: Low-level components used across the application

These components are:

- Framework-agnostic and reusable
- Focused on presentation and interaction patterns
- Generally stateless (props-driven)
- Follow consistent design tokens and patterns

**Examples:**

- `button.tsx` - Button component with variants
- `input.tsx` - Form input component
- `dialog.tsx` - Modal dialog primitive
- `skeleton.tsx` - Loading skeleton primitive

### `src/components/` (Root Level) - Application Components

All other components in the root `components/` folder are **application-specific components** that implement business logic and features:

- **Feature components**: Components tied to specific application features
- **Layout components**: Page layouts, headers, footers
- **Composite components**: Complex components that combine multiple UI primitives
- **Business logic components**: Components that handle data fetching, mutations, and state management

These components are:

- Application-specific and context-aware
- Often stateful and connected to data
- Compose UI primitives to create meaningful interfaces
- Handle business logic and user interactions

**Examples:**

- `ExpenseCard.tsx` - Displays expense data
- `Header.tsx` - Application header with navigation
- `LoadingComponent.tsx` - Application-specific loading states

## Component Guidelines

### When to use `components/ui/`

Create components in `components/ui/` when:

- Building reusable design system primitives
- Installing new shadcn/ui components
- Creating variations of existing UI components
- Building framework-agnostic building blocks

### When to use `components/` (root)

Create components in the root `components/` folder when:

- Building feature-specific components
- Combining multiple UI primitives
- Implementing business logic
- Creating application layouts

### Installation and Updates

- **shadcn components**: Install using the shadcn CLI: `npx shadcn@latest add [component-name]`
- **Component updates**: shadcn components can be updated individually or customized as needed
- **Configuration**: Component styling and behavior is configured through `components.json`

## Best Practices

1. **Composition over customization**: Prefer composing UI primitives rather than heavily customizing them
2. **Keep UI primitives simple**: Components in `components/ui/` should be focused and reusable
3. **Separate concerns**: Business logic belongs in application components, not UI primitives
4. **Follow shadcn conventions**: Maintain consistency with shadcn/ui patterns and APIs
5. **Document variants**: When extending UI components, document available variants and use cases

## File Structure Example

```
src/components/
├── ui/                          # Design system & shadcn components
│   ├── button.tsx              # shadcn button primitive
│   ├── input.tsx               # shadcn input primitive
│   ├── dialog.tsx              # shadcn dialog primitive
│   └── skeleton.tsx            # Loading skeleton primitive
├── ExpenseCard.tsx             # Application: expense display logic
├── Header.tsx                  # Application: navigation and layout
├── LoadingComponent.tsx        # Application: loading states
└── ErrorBoundary.tsx          # Application: error handling
```

This separation ensures a clear distinction between reusable design system components and application-specific functionality, making the codebase more maintainable and the design system more consistent.
