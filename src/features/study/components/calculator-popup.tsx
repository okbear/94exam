import { useRef, type ReactNode, type KeyboardEventHandler } from "react";
import { createPortal } from "react-dom";
import { Calculator, GripHorizontal, X } from "lucide-react";
import { useCalculatorPosition } from "../hooks/use-calculator-position";
export function CalculatorPopup({
  id,
  onClose,
  onKeyDown,
  children,
}: {
  id: string;
  onClose: () => void;
  onKeyDown: KeyboardEventHandler<HTMLElement>;
  children: ReactNode;
}) {
  const panel = useRef<HTMLElement>(null);
  const { style, dragHandlers } = useCalculatorPosition(panel);
  return createPortal(
    <section
      ref={panel}
      id={id}
      role="dialog"
      aria-modal="false"
      aria-label="四則演算の電卓"
      className="calculator-popup"
      style={style}
      onKeyDown={onKeyDown}
    >
      <header className="calculator-popup-header" {...dragHandlers}>
        <Calculator size={17} />
        <strong>電卓</strong>
        <span className="calculator-drag-hint">
          <GripHorizontal size={17} />
          移動
        </span>
        <button type="button" aria-label="電卓を閉じる" onClick={onClose}>
          <X size={20} />
        </button>
      </header>
      <div className="calculator-panel">{children}</div>
    </section>,
    document.body,
  );
}
