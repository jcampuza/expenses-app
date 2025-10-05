"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Theme</Label>
      <RadioGroup
        value={theme}
        onValueChange={(value) =>
          setTheme(value as "system" | "light" | "dark")
        }
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="system" id="system" />
          <Label
            htmlFor="system"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Monitor className="h-4 w-4" />
            System
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="light" id="light" />
          <Label
            htmlFor="light"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Sun className="h-4 w-4" />
            Light
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="dark" id="dark" />
          <Label
            htmlFor="dark"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Moon className="h-4 w-4" />
            Dark
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
