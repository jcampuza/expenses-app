import { Show } from "solid-js";
import { Settings, LogOut } from "lucide";
import { useNavigate } from "@solidjs/router";
import { useAuth, useUser } from "@/lib/clerk";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";

export function CustomUserButton() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <Show when={user()}>
      {(current) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              class="relative size-11 rounded-full"
              aria-label="Account menu"
            >
              <Avatar class="h-8 w-8">
                <AvatarImage
                  src={current().imageUrl}
                  alt={current().fullName || "User"}
                />
                <AvatarFallback>
                  {current()
                    .fullName?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel class="font-normal">
                <div class="flex flex-col space-y-2">
                  <p class="text-sm leading-none font-medium">
                    {current().fullName || "User"}
                  </p>
                  <p class="text-xs leading-none text-muted-foreground">
                    {current().primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Icon icon={Settings} class="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                class="text-red-600"
                onClick={() => void signOut()}
              >
                <Icon icon={LogOut} class="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Show>
  );
}
