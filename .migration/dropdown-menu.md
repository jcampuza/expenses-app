# dropdown-menu

2026-07-05, transformation engine, migrated to Base UI.

## Changed

src/components/ui/dropdown-menu.tsx:4 now imports `@base-ui/react/menu`; Content and SubContent were rebuilt as Portal > Positioner > Popup at src/components/ui/dropdown-menu.tsx:62 and src/components/ui/dropdown-menu.tsx:106; Label maps to GroupLabel; item indicators split into CheckboxItemIndicator and RadioItemIndicator. App call sites now use `render`, `DropdownMenuGroup`, and Base item props in src/components/CustomUserButton.tsx:35 and src/app/_authenticated/settings.tsx:414. Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/dropdown-menu.tsx` returned no matches.

## Left alone

Menu visual classes and icon spacing were preserved.

## Behavior changes

Base checkbox and radio menu items do not close on click by default. The existing app only uses regular items; the alert-dialog trigger item explicitly sets `closeOnClick={false}`.

## Verify by hand

Open the user menu and connected-user action menu. Test keyboard navigation, item highlight, submenu positioning if added later, and typeahead.
