# button

2026-07-05, transformation engine, migrated to Base UI.

## Changed

src/components/ui/button.tsx:2 now imports `@base-ui/react/button`; src/components/ui/button.tsx:37 uses `ButtonPrimitive.Props`; src/components/ui/button.tsx:41 renders `ButtonPrimitive` so consumers use `render` instead of `asChild`. Consumer `asChild` call sites were migrated in src/app/_authenticated/settings.tsx:82. Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/button.tsx` returned no matches.

## Left alone

`buttonVariants` styling stayed intact to preserve the existing new-york look.

## Behavior changes

Polymorphism now uses Base UI `render`; old `asChild` call sites were updated.

## Verify by hand

Click standard, link-rendered, disabled, and icon buttons. Confirm focus rings and disabled behavior.
