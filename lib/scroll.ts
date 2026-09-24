import { useTransform, type MotionValue } from "framer-motion";

/**
 * Lineaire mapping van een scroll-progress naar een waarde, altijd begrensd.
 *
 * Waarom niet gewoon useTransform(mv, [a, b], [c, d])? framer-motion 12 zet
 * scroll-gestuurde opacity dan om naar een native ScrollTimeline, en in dat
 * pad wordt buiten het bereik niet begrensd: woorden die al opgelicht waren
 * vielen verderop terug naar donker. Een functie-transform blijft in JS.
 */
export function useClamped(
  mv: MotionValue<number>,
  [inStart, inEnd]: [number, number],
  [outStart, outEnd]: [number, number]
) {
  return useTransform(mv, (v) => {
    const t = inEnd === inStart ? (v >= inEnd ? 1 : 0) : (v - inStart) / (inEnd - inStart);
    const c = Math.min(1, Math.max(0, t));
    return outStart + (outEnd - outStart) * c;
  });
}
