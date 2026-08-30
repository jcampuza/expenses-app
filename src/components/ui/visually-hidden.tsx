import type { ParentProps } from "solid-js";

export function VisuallyHidden(props: ParentProps) {
  return (
    <span
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        margin: "-1px",
        padding: "0",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        "white-space": "nowrap",
        border: "0",
      }}
    >
      {props.children}
    </span>
  );
}
