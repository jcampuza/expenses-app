# separator

2026-07-05, transformation engine, migrated to Base UI.

## Changed

src/components/ui/separator.tsx:4 now imports `@base-ui/react/separator`; the Radix `decorative` prop was removed from the primitive call. Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/separator.tsx` returned no matches.

## Left alone

Existing horizontal and vertical sizing classes were preserved.

## Behavior changes

Base UI separators are semantic by default; the prior Radix default decorative separator behavior is not retained.

## Verify by hand

Inspect horizontal page separators and any vertical separators for orientation and spacing.
