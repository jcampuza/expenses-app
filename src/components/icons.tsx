import { For } from "solid-js";
import { Dynamic } from "@solidjs/web";
import type { JSX } from "@solidjs/web";

type IconNode = [
  tag: string,
  attrs: Record<string, string | number | undefined>,
][];

export function Icon(
  props: {
    icon: IconNode;
    class?: string;
    size?: number;
  } & JSX.SvgSVGAttributes<SVGSVGElement>,
) {
  const size = () => props.size ?? 24;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size()}
      height={size()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class}
    >
      <For each={props.icon}>
        {([tag, attrs]) => <Dynamic component={tag} {...attrs} />}
      </For>
    </svg>
  );
}
