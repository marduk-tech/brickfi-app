"use client";

import { useEffect, useState } from "react";
import DynamicReactIcon, { IconSetKey } from "./dynamic-react-icon";
import styles from "./flipping-icons.module.css";

export type FlippingIcon = { iconName: string; iconSet: IconSetKey };

// `count` distinct indices into a list of `total`, none of them in `current`
// when there are enough icons left - so every slot visibly flips each tick
const randomIndices = (total: number, count: number, current: number[]) => {
  const fresh = [...Array(total).keys()].filter((i) => !current.includes(i));
  const pool = fresh.length >= count ? fresh : [...Array(total).keys()];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
};

// Cycles through `icons`, `count` at a time, with a flip - in order, or in a
// random order with `random`. Its own component so the ticks only re-render
// the icons, not the page. Starts on the first `count` icons either way, so
// the server and client render the same thing.
export function FlippingIcons({
  icons,
  count,
  size,
  color,
  intervalMs = 1500,
  random = false,
  // white circle behind each icon
  circled = true,
}: {
  icons: FlippingIcon[];
  count: number;
  size: number;
  color: string;
  intervalMs?: number;
  random?: boolean;
  circled?: boolean;
}) {
  const slots = Math.min(count, icons.length);
  const [shown, setShown] = useState(() =>
    Array.from({ length: slots }, (_, i) => i),
  );

  useEffect(() => {
    const id = setInterval(
      () =>
        setShown((current) =>
          random
            ? randomIndices(icons.length, slots, current)
            : current.map((i) => (i + slots) % icons.length),
        ),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [icons.length, slots, intervalMs, random]);

  const gap = 6;
  const circle = circled ? size + 10 : size;
  return (
    // fixed box (and fixed slots) so loading/swapping icons never shifts the
    // layout around it
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap,
        width: slots * circle + (slots - 1) * gap,
        height: circle,
        flexShrink: 0,
      }}
    >
      {shown.map((iconIndex, slot) => {
        const icon = icons[iconIndex];
        return (
          // the circle stays put; only the icon inside it flips
          <span
            key={slot}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: circle,
              height: circle,
              borderRadius: "50%",
              backgroundColor: circled ? "white" : undefined,
            }}
          >
            {/* key remounts on every change, replaying the flip; later slots
                flip slightly after earlier ones */}
            <span
              key={iconIndex}
              className={styles.flipIcon}
              style={{
                width: size,
                height: size,
                animationDelay: `${slot * 120}ms`,
              }}
            >
              <DynamicReactIcon
                iconName={icon.iconName}
                iconSet={icon.iconSet}
                size={size}
                color={color}
              />
            </span>
          </span>
        );
      })}
    </span>
  );
}
