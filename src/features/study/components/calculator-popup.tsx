import { useRef, type ReactNode, type KeyboardEventHandler } from "react";
import { createPortal } from "react-dom";
import { Calculator, GripHorizontal, X } from "lucide-react";
import { useCalculatorPosition } from "../hooks/use-calculator-position";
export function CalculatorPopup({
  id,
  title = "電卓",
  ariaLabel = "四則演算の電卓",
  closeLabel = "電卓を閉じる",
  icon = <Calculator size={17} />,
  className,
  panelClassName = "calculator-panel",
  onClose,
  onKeyDown,
  children,
}: {
  id: string;
  title?: string;
  ariaLabel?: string;
  closeLabel?: string;
  icon?: ReactNode;
  className?: string;
  panelClassName?: string;
  onClose: () => void;
  onKeyDown: KeyboardEventHandler<HTMLElement>;
  children: ReactNode;
}) {
  const panel = useRef<HTMLElement>(null);
  const { style, bringToFront, dragHandlers } = useCalculatorPosition(panel);
  return createPortal(
    <section
      ref={panel}
      id={id}
      role="dialog"
      aria-modal="false"
      aria-label={ariaLabel}
      className={
        className ? `calculator-popup ${className}` : "calculator-popup"
      }
      style={style}
      onPointerDownCapture={bringToFront}
      onFocusCapture={bringToFront}
      onKeyDown={onKeyDown}
    >
      <header className="calculator-popup-header" {...dragHandlers}>
        {icon}
        <strong>{title}</strong>
        <span className="calculator-drag-hint">
          <GripHorizontal size={17} />
          移動
        </span>
        <button type="button" aria-label={closeLabel} onClick={onClose}>
          <X size={20} />
        </button>
      </header>
      <div className={panelClassName}>{children}</div>
    </section>,
    document.body,
  );
}
