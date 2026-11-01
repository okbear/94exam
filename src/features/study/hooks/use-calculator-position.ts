import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from "react";
type Position = { left: number; top: number };
export function useCalculatorPosition(panel: RefObject<HTMLElement | null>) {
  const [position, setPosition] = useState<Position | null>(null);
  const drag = useRef<{
    pointerId: number;
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  function clamp(left: number, top: number): Position {
    const rect = panel.current?.getBoundingClientRect();
    return {
      left: Math.max(
        8,
        Math.min(left, window.innerWidth - (rect?.width ?? 0) - 8),
      ),
      top: Math.max(
        8,
        Math.min(top, window.innerHeight - (rect?.height ?? 0) - 8),
      ),
    };
  }
  useEffect(() => {
    const resize = () =>
      setPosition((current) =>
        current ? clamp(current.left, current.top) : null,
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
    setPosition(
      clamp(
        start.left + event.clientX - start.x,
        start.top + event.clientY - start.y,
      ),
    );
  }
  function stopDrag() {
    drag.current = null;
  }
  return {
    style: position
      ? { ...position, right: "auto", bottom: "auto" }
      : undefined,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: stopDrag,
      onPointerCancel: stopDrag,
      onLostPointerCapture: stopDrag,
    },
  };
}
