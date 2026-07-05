# switch

2026-07-05, transformation engine, migrated to Base UI.

## Changed

src/components/ui/switch.tsx:4 now imports `@base-ui/react/switch`; state classes changed from Radix `data-[state=...]` to Base `data-checked` and `data-unchecked`. Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/switch.tsx` returned no matches.

## Left alone

Existing switch dimensions and visual styling were preserved.

## Behavior changes

Base Switch Root renders an element plus hidden input instead of Radix's button model.

## Verify by hand

Toggle switch controls with mouse and keyboard. Confirm checked and unchecked colors update.
