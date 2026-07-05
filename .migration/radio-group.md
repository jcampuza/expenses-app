# radio-group

2026-07-05, transformation engine, migrated to Base UI.

## Changed

src/components/ui/radio-group.tsx:4 imports `@base-ui/react/radio-group`; src/components/ui/radio-group.tsx:5 imports `@base-ui/react/radio`; item and indicator wrappers now use `Radio.Root` and `Radio.Indicator`. Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/radio-group.tsx` returned no matches.

## Left alone

Existing radio sizes, border, and selected-dot styling were preserved.

## Behavior changes

Base Radio items render an element plus hidden input rather than Radix's button item.

## Verify by hand

Use any radio group with keyboard arrows and pointer clicks. Confirm selected state and focus ring.
