import React from "react";
import { Input } from "./ui/input";

export interface NumberInputProps extends React.ComponentProps<typeof Input> {
  allowDecimal?: boolean;
  allowNegative?: boolean;
}

const ALLOWED_KEYS = new Set([
  "Backspace",
  "Delete",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "Tab",
  "Escape",
  "Enter",
]);

type PatternRegexMode = {
  regex: RegExp;
  inputPattern: HTMLInputElement["inputMode"];
  mode: "numeric" | "decimal";
};

const DECIMA_NEGATIVE_CONFIG: PatternRegexMode = {
  regex: /^-?\d*(\.\d*)?$/,
  inputPattern: "^-?\\d*(\\.\\d*)?$",
  mode: "decimal",
};

const DECIMAL_CONFIG: PatternRegexMode = {
  regex: /^\d*(\.\d*)?$/,
  inputPattern: "^\\d*(\\.\\d*)?$",
  mode: "decimal",
};

const NEGATIVE_CONFIG: PatternRegexMode = {
  regex: /^-?\d*$/,
  inputPattern: "^-?\\d*$",
  mode: "numeric",
};

const DEFAULT_CONFIG: PatternRegexMode = {
  regex: /^[0-9]*$/,
  inputPattern: "^[0-9]*$",
  mode: "numeric",
};

const getPatternRegexMode = (
  allowDecimal: boolean,
  allowNegative: boolean,
): PatternRegexMode => {
  if (allowDecimal && allowNegative) {
    return DECIMA_NEGATIVE_CONFIG;
  } else if (allowDecimal) {
    return DECIMAL_CONFIG;
  } else if (allowNegative) {
    return NEGATIVE_CONFIG;
  }

  return DEFAULT_CONFIG;
};
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      allowDecimal = false,
      allowNegative = false,
      pattern,
      inputMode,
      onChange,
      value,
      ...props
    },
    ref,
  ) => {
    // Build regex pattern based on props
    const { regex, inputPattern, mode } = getPatternRegexMode(
      allowDecimal,
      allowNegative,
    );

    // Handler to filter input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === "" || regex.test(val)) {
        onChange?.(e);
      } else {
        // Prevent invalid input by resetting to the previous valid value
        e.target.value = (value as string) || "";
      }
    };

    // Handler to prevent invalid keystrokes
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow control keys (backspace, delete, arrow keys, etc.)
      if (
        ALLOWED_KEYS.has(e.key) ||
        e.ctrlKey ||
        e.metaKey // Allow Ctrl/Cmd shortcuts
      ) {
        return;
      }

      // Check if the key would result in a valid input
      const currentValue = e.currentTarget.value;
      const selectionStart = e.currentTarget.selectionStart || 0;
      const selectionEnd = e.currentTarget.selectionEnd || 0;

      // Simulate the new value after the key press
      const newValue =
        currentValue.slice(0, selectionStart) +
        e.key +
        currentValue.slice(selectionEnd);

      // Test if the new value would be valid
      if (newValue !== "" && !regex.test(newValue)) {
        e.preventDefault();
      }
    };

    return (
      <Input
        type="text"
        inputMode={inputMode || mode}
        pattern={pattern || inputPattern}
        autoComplete="off"
        ref={ref}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  },
);
NumberInput.displayName = "NumberInput";
