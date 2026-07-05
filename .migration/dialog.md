# dialog

2026-07-05, transformation engine, migrated to Base UI.

## Changed

src/components/ui/dialog.tsx:4 now imports `@base-ui/react/dialog`; Overlay maps to Backdrop; Content maps to Popup; animation selectors use Base `data-starting-style` and `data-ending-style`. Dialog consumer triggers and closes were migrated to `render` in src/components/ExpensesTabContent.tsx:248 and src/app/_authenticated/settings.tsx:161. Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/dialog.tsx` returned no matches.

## Left alone

The local mobile full-screen dialog layout and desktop centered layout were preserved.

## Behavior changes

Radix auto-focus interception props are not surfaced by this wrapper. Current app call sites did not use them.

## Verify by hand

Open add/edit expense dialogs and settings dialogs. Confirm focus trapping, Escape close, outside close, and cancel close behavior.
