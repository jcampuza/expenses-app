# accordion

2026-07-05, transformation engine, migrated to Base UI.

## Changed

src/components/ui/accordion.tsx:4 now imports `@base-ui/react/accordion`; src/components/ui/accordion.tsx:26 maps legacy `type="multiple"` to Base `multiple`; src/components/ui/accordion.tsx:75 maps Content to Base Panel; src/app/_public/index.tsx:266 removes legacy `type="single" collapsible`. Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/accordion.tsx` returned no matches.

## Left alone

Existing FAQ content and visual spacing were preserved.

## Behavior changes

Base single accordion is collapsible by default. Legacy `collapsible` is accepted by the wrapper for compatibility but does not change behavior.

## Verify by hand

Open and close FAQ items. Confirm the chevron rotates and panel content expands/collapses.
