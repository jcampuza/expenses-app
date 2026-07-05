# avatar

2026-07-05, transformation engine, migrated to Base UI.

## Changed

src/components/ui/avatar.tsx:4 now imports `@base-ui/react/avatar`; Root, Image, and Fallback wrappers keep their public names. Fallback accepts the Base `delay` prop and maps legacy `delayMs` for compatibility. Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/avatar.tsx` returned no matches.

## Left alone

Avatar sizing and fallback classes were preserved.

## Behavior changes

Fallback delay prop is now Base UI `delay`; legacy `delayMs` remains accepted by the wrapper.

## Verify by hand

Open the user menu and confirm avatar image and fallback initials render correctly.
