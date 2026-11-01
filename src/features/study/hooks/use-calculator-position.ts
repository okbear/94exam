import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from "react";
type Position = { left: number; top: number };
let nextZIndex = 40;
export function useCalculatorPosition(panel: RefObject<HTMLElement | null>) {
  const [position, setPosition] = useState<Position | null>(null);
  const [zIndex, setZIndex] = useState(() => ++nextZIndex);
  const drag = useRef<{
    pointerId: number;
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  function clamp(left: number, top: number): Position | null {
    const rect = panel.current?.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) return null;
    return {
      left: Math.max(8, Math.min(left, window.innerWidth - rect.width - 8)),
      top: Math.max(8, Math.min(top, window.innerHeight - rect.height - 8)),
    };
  }
  useEffect(() => {
    const resize = () =>
      setPosition((current) =>
        current ? (clamp(current.left, current.top) ?? current) : null,
      );
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button"))
      return;
    const rect = panel.current?.getBoundingClientRect();
    if (!rect) return;
    drag.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: rect.left,
      top: rect.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function onPointerMove(event: PointerEvent<HTMLElement>) {
    const start = drag.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const next = clamp(
      start.left + event.clientX - start.x,
      start.top + event.clientY - start.y,
    );
    if (next) setPosition(next);
  }
  function stopDrag() {
    drag.current = null;
  }
  return {
    style: {
      zIndex,
      ...(position
        ? { ...position, right: "auto", bottom: "auto" }
        : undefined),
    },
    bringToFront: () =>
      setZIndex((current) => (current === nextZIndex ? current : ++nextZIndex)),
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: stopDrag,
      onPointerCancel: stopDrag,
      onLostPointerCapture: stopDrag,
    },
  };
}
