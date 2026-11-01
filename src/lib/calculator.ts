export type Operator = "+" | "-" | "*" | "/";
export type CalculatorState = {
  expression: string;
  previousExpression: string;
  evaluated: boolean;
  error: string | null;
};
export type CalculatorAction =
  | { type: "input"; value: string }
  | { type: "clear" }
  | { type: "backspace" }
  | { type: "equals" };
export const initialCalculator = (): CalculatorState => ({
  expression: "0",
  previousExpression: "",
  evaluated: false,
  error: null,
});

// Parse only numbers, percent, and the four operators. Multiplication/division precede addition/subtraction.
export function calculate(expression: string): string {
  const tokens = expression.match(/\d+(?:\.\d*)?|\.\d+|%|[+\-*/]/g);
  if (!tokens || tokens.join("") !== expression)
    throw new Error("式を確認してください");
  let position = 0;
  function operand(): number {
    if (tokens![position] === "-") {
      position++;
      return -operand();
    }
    if (tokens![position] === "+") {
      position++;
      return operand();
    }
    const token = tokens![position++];
    if (!token || !/^\d*\.?\d+$|^\d+\.$/.test(token))
      throw new Error("式を確認してください");
    let value = Number(token);
    while (tokens![position] === "%") {
      position++;
      value /= 100;
    }
    return value;
  }
  function product(): number {
    let value = operand();
    while (tokens![position] === "*" || tokens![position] === "/") {
      const operator = tokens![position++],
        next = operand();
      if (operator === "/" && next === 0) throw new Error("0では割れません");
      value = operator === "*" ? value * next : value / next;
    }
    return value;
  }
  function sum(): number {
    let value = product();
    while (tokens![position] === "+" || tokens![position] === "-") {
      const operator = tokens![position++],
        next = product();
      value = operator === "+" ? value + next : value - next;
    }
    return value;
  }
  const result = sum();
  if (position !== tokens.length) throw new Error("式を確認してください");
  if (!Number.isFinite(result) || Math.abs(result) >= 1e15)
    throw new Error("計算できる範囲を超えています");
  // Suppress floating-point artifacts such as 0.1 + 0.2, without currency rounding.
  return Number(result.toPrecision(15)).toLocaleString("en-US", {
    useGrouping: false,
    maximumSignificantDigits: 15,
  });
}
export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  if (action.type === "clear") return initialCalculator();
  if (action.type === "backspace")
    return {
      ...initialCalculator(),
      expression: state.error ? "0" : state.expression.slice(0, -1) || "0",
    };
  if (action.type === "equals") {
    if (state.error || state.evaluated) return state;
    try {
      return {
        expression: calculate(state.expression),
        previousExpression: state.expression,
        evaluated: true,
        error: null,
      };
    } catch (error) {
      return {
        ...state,
        error: error instanceof Error ? error.message : "計算できません",
      };
    }
  }
  const input = action.value;
  if (!/^[0-9.+\-*/%]$/.test(input)) return state;
  const operator = /^[+\-*/]$/.test(input);
  let expression =
    state.error || (state.evaluated && !operator && input !== "%")
      ? "0"
      : state.expression;
  if (expression.length >= 100) return state;
  if (input === "%") {
    if (!/\d$/.test(expression)) return state;
    expression += "%";
  } else if (operator) {
    if (/[+\-*/]$/.test(expression))
      expression =
        input === "-" && !expression.endsWith("-")
          ? expression + input
          : expression.replace(/[+\-*/]+$/, input);
    else expression += input;
  } else if (input === ".") {
    if (expression.endsWith("%")) return state;
    const current = expression.split(/[+\-*/]/).at(-1)!;
    if (current.includes(".")) return state;
    expression += current === "" ? "0." : ".";
  } else {
    if (expression.endsWith("%")) return state;
    const current = expression.split(/[+\-*/]/).at(-1)!;
    expression =
      current === "0" ? expression.slice(0, -1) + input : expression + input;
  }
  return { expression, previousExpression: "", evaluated: false, error: null };
}
