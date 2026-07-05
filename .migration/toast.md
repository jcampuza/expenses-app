# toast

2026-07-05, transformation engine, migrated to Base UI manager API.

## Changed

src/components/ui/toast.tsx:4 now imports `@base-ui/react/toast`; src/components/ui/toast.tsx:42 creates a shared Base toast manager; src/hooks/use-toast.ts now forwards the existing `toast({ title, description, variant, duration })` helper to that manager; src/components/ui/toaster.tsx:16 renders Base manager toasts. Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/toast.tsx src/hooks/use-toast.ts src/components/ui/toaster.tsx` returned no matches.

## Left alone

Callers of `useToast().toast(...)` were left intact.

## Behavior changes

Base UI toasts are manager-driven, not controlled by `open`/`onOpenChange`. The app-facing helper still exposes `dismiss` and `update`.

## Verify by hand

Trigger success and destructive toasts from settings actions. Confirm auto-dismiss, close button, and destructive styling.
