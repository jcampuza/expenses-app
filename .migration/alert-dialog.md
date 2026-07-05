# alert-dialog

2026-07-05, transformation engine, migrated to Base UI.

## Changed

src/components/ui/alert-dialog.tsx:4 now imports `@base-ui/react/alert-dialog`; Overlay maps to Backdrop; Content maps to Popup; Action and Cancel both render Base Close with the existing button classes. The dropdown-triggered alert dialog in src/app/_authenticated/settings.tsx:385 is controlled outside the menu so the dropdown item keeps `role="menuitem"`. Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/alert-dialog.tsx` returned no matches.

## Left alone

Existing header, footer, title, description, and button styling were preserved.

## Behavior changes

Base UI has no AlertDialog Action part. The wrapper uses Close for action semantics so clicking the action still closes the alert.

## Verify by hand

Open the remove-connection confirmation. Confirm focus lands in the dialog, Cancel closes, Remove triggers the action, and Escape behavior is correct.
