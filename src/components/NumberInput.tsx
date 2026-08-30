import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { Input } from "./ui/input";

export type NumberInputProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  allowDecimal?: boolean;
  allowNegative?: boolean;
};

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
  inputPattern: string;
  mode: "numeric" | "decimal";
};

const getPatternRegexMode = (
  allowDecimal: boolean,
  allowNegative: boolean,
): PatternRegexMode => {
  if (allowDecimal && allowNegative) {
    return {
      regex: /^-?\d*(\.\d*)?$/,
      inputPattern: "^-?\\d*(\\.\\d*)?$",
      mode: "decimal",
    };
  }
  if (allowDecimal) {
    return {
      regex: /^\d*(\.\d*)?$/,
      inputPattern: "^\\d*(\\.\\d*)?$",
      mode: "decimal",
    };
  }
  if (allowNegative) {
    return {
      regex: /^-?\d*$/,
      inputPattern: "^-?\\d*$",
      mode: "numeric",
    };
  }
  return {
    regex: /^[0-9]*$/,
    inputPattern: "^[0-9]*$",
    mode: "numeric",
  };
};

export function NumberInput(props: NumberInputProps) {
  const rest = omit(
    props,
    "allowDecimal",
    "allowNegative",
    "onInput",
    "onKeyDown",
  );
  const config = () =>
    getPatternRegexMode(
      Boolean(props.allowDecimal),
      Boolean(props.allowNegative),
    );

  const handleInput: JSX.InputEventHandler<HTMLInputElement, InputEvent> = (
    event,
  ) => {
    const val = event.currentTarget.value;
    if (val === "" || config().regex.test(val)) {
      const onInput = props.onInput;
      if (typeof onInput === "function") {
        onInput(event);
      }
      return;
    }
    event.currentTarget.value = String(props.value ?? "");
  };

  const handleKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent> = (
    event,
  ) => {
    if (ALLOWED_KEYS.has(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }
    const currentValue = event.currentTarget.value;
    const selectionStart = event.currentTarget.selectionStart || 0;
    const selectionEnd = event.currentTarget.selectionEnd || 0;
    const newValue =
      currentValue.slice(0, selectionStart) +
      event.key +
      currentValue.slice(selectionEnd);
    if (newValue !== "" && !config().regex.test(newValue)) {
      event.preventDefault();
    }
  };

  return (
    <Input
      type="text"
      autocomplete="off"
      {...rest}
      inputmode={props.inputmode || config().mode}
      pattern={props.pattern || config().inputPattern}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
    />
  );
}
