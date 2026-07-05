# tabs

2026-07-05, transformation engine, migrated to Base UI.

## Changed

src/components/ui/tabs.tsx:4 now imports `@base-ui/react/tabs`; Trigger maps to `TabsPrimitive.Tab`; Content maps to `TabsPrimitive.Panel`; active classes now use `data-active`. Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/tabs.tsx` returned no matches.

## Left alone

Tab list and panel styling were preserved.

## Behavior changes

Base UI tabs default to manual activation. This is flagged rather than patched.

## Verify by hand

Navigate tabs with keyboard and mouse. Confirm active tab styling and panel visibility.
