# label

2026-07-05, transformation engine, migrated off Radix.

## Changed

src/components/ui/label.tsx now uses a native `label`, because Base UI has no Label primitive. Classes and variants were preserved. Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/label.tsx` returned no matches.

## Left alone

Form consumers were left as-is because native label props are compatible with current usage.

## Behavior changes

No Base UI primitive exists for Label; this is intentionally native markup.

## Verify by hand

Click labels in forms and confirm focus moves to the associated input.
