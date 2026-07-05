# project

2026-07-05, whole-project legacy-style migration, Base UI wrappers complete.

## Changed

package.json:25 adds `@base-ui/react` and removes the Radix packages; bun.lock was updated by Bun. App code was swept for `asChild`, `onSelect`, `forceMount`, and legacy accordion props. `rg -n "radix-ui|@radix-ui|--radix|asChild|onSelect|forceMount" src package.json components.json` returns no Radix or consumer migration leftovers; the remaining `data-[state=selected]` in src/components/ui/table.tsx is table selection styling, not a Radix primitive.

## Left alone

Static shadcn wrappers with no Radix imports were left alone: alert, badge, card, input, skeleton, table, app-link, visually-hidden. `components.json` remains `style: new-york` because the current shadcn CLI rejects a manual `base` key, and `init --base base --no-reinstall` prompts for a preset that would restyle the project.

## Behavior changes

Tabs default to Base UI manual activation. Separator is semantic by default. Toast is manager-backed. Future shadcn CLI additions may still report this legacy `new-york` config as radix unless a preset/base migration is chosen.

## Verify by hand

Run the app and click through public FAQ accordion, account settings dialogs, connected-user dropdown and alert dialog, user menu, add/edit expense dialogs, and toast-producing settings actions. Derived count: 0 wrappers remain on Radix.
