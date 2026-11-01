import {
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  Calculator as CalculatorIcon,
  Check,
  Copy,
  Delete,
  Percent,
  SquareArrowOutUpRight,
} from "lucide-react";
import { CalculatorPopup } from "./calculator-popup";
import {
  calculate,
  calculatorReducer,
  initialCalculator,
} from "../../../lib/calculator";
const keys = [
  { value: "7" },
  { value: "8" },
  { value: "9" },
  { value: "/", label: "÷", name: "割る" },
  { value: "4" },
  { value: "5" },
  { value: "6" },
  { value: "*", label: "×", name: "掛ける" },
  { value: "1" },
  { value: "2" },
  { value: "3" },
  { value: "-", label: "−", name: "引く" },
  { value: "0" },
  { value: ".", name: "小数点" },
  { value: "=", name: "計算する" },
  { value: "+", name: "足す" },
];
const displayExpression = (value: string) =>
  value
    .replaceAll("*", " × ")
    .replaceAll("/", " ÷ ")
    .replaceAll("+", " + ")
    .replaceAll("-", " − ");
export function Calculator({ resetKey }: { resetKey?: string }) {
  const [open, setOpen] = useState(false);
  const [copiedFor, setCopiedFor] = useState<string | null>(null);
  const [state, dispatch] = useReducer(
    calculatorReducer,
    undefined,
    initialCalculator,
  );
  const [prevKey, setPrevKey] = useState(resetKey);
  if (prevKey !== resetKey) {
    setPrevKey(resetKey);
    dispatch({ type: "clear" });
  }
  const currentCopyKey = `${resetKey ?? ""}:${state.expression}`;
  const copied = !state.error && copiedFor === currentCopyKey;
  const panelId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const history = useRef<HTMLDivElement>(null);
  const display = useRef<HTMLOutputElement>(null);
  useEffect(() => {
    if (open) display.current?.focus({ preventScroll: true });
  }, [open]);
  useEffect(() => {
    if (!open) return;
    if (display.current)
      display.current.scrollLeft = display.current.scrollWidth;
    if (history.current)
      history.current.scrollLeft = history.current.scrollWidth;
  }, [open, state.expression, state.previousExpression, state.error]);
  function close() {
    setOpen(false);
    setCopiedFor(null);
    trigger.current?.focus({ preventScroll: true });
  }
  async function copyResult() {
    if (state.error || !navigator.clipboard?.writeText) return;
    try {
      const value = calculate(state.expression);
      await navigator.clipboard.writeText(value);
      setCopiedFor(currentCopyKey);
    } catch {
      // Ignore if expression is incomplete or clipboard API is unavailable.
    }
  }
  function handleKey(event: KeyboardEvent<HTMLElement>) {
    // Handle shortcuts only while focus is inside the calculator, leaving answer controls alone.
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "Tab" || event.key === " ") return;
    if (event.key === "Enter" && event.target instanceof HTMLButtonElement)
      return;
    if (/^[0-9.+\-*/%]$/.test(event.key)) {
      event.preventDefault();
      dispatch({ type: "input", value: event.key });
    } else if (event.key === "=" || event.key === "Enter") {
      event.preventDefault();
      dispatch({ type: "equals" });
    } else if (event.key === "Backspace") {
      event.preventDefault();
      dispatch({ type: "backspace" });
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Delete") {
      event.preventDefault();
      dispatch({ type: "clear" });
    }
  }
  return (
    <div className="calculator">
      <button
        type="button"
        ref={trigger}
        className="calculator-toggle"
        aria-label={open ? "電卓を閉じる" : "電卓を開く"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <CalculatorIcon size={16} />
        <span>電卓</span>
        <SquareArrowOutUpRight size={13} aria-hidden="true" />
      </button>
      {open && (
        <CalculatorPopup id={panelId} onClose={close} onKeyDown={handleKey}>
          <div className="calculator-display">
            <div ref={history} className="calculator-history">
              {state.previousExpression
                ? `${displayExpression(state.previousExpression)} =`
                : "\u00a0"}
            </div>
            <output
              ref={display}
              aria-label="電卓の表示"
              aria-live="polite"
              tabIndex={0}
            >
              {state.error ?? displayExpression(state.expression)}
            </output>
          </div>
          <div className="calculator-tools">
            <button
              type="button"
              aria-label="クリア"
              title="クリア"
              className="calculator-clear"
              onClick={() => dispatch({ type: "clear" })}
            >
              C
            </button>
            <button
              type="button"
              aria-label="1文字削除"
              title="1文字削除"
              onClick={() => dispatch({ type: "backspace" })}
            >
              <Delete size={17} />
            </button>
            <button
              type="button"
              aria-label="パーセント"
              title="パーセント"
              onClick={() => dispatch({ type: "input", value: "%" })}
            >
              <Percent size={16} />
            </button>
            <button
              type="button"
              aria-label="コピー"
              title={copied ? "コピーしました" : "コピー"}
              onClick={() => void copyResult()}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <div className="calculator-keys">
            {keys.map((key) => (
              <button
                type="button"
                key={key.value}
                aria-label={key.name ?? key.value}
                className={
                  key.value === "="
                    ? "calculator-equals"
                    : /[+\-*/]/.test(key.value)
                      ? "calculator-operator"
                      : ""
                }
                onClick={() =>
                  dispatch(
                    key.value === "="
                      ? { type: "equals" }
                      : { type: "input", value: key.value },
                  )
                }
              >
                {key.label ?? key.value}
              </button>
            ))}
          </div>
        </CalculatorPopup>
      )}
    </div>
  );
}
