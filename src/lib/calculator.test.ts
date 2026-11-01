import { describe, it, expect } from "vitest";
import { calculate, calculatorReducer, initialCalculator } from "./calculator";
function enter(keys: string) {
  return [...keys].reduce(
    (state, value) =>
      calculatorReducer(
        state,
        value === "=" ? { type: "equals" } : { type: "input", value },
      ),
    initialCalculator(),
  );
}
describe("four-operation calculator", () => {
  it("uses multiplication/division precedence and supports negative results", () => {
    expect(calculate("2+3*4")).toBe("14");
    expect(calculate("20/4-8")).toBe("-3");
    expect(calculate("5*-2")).toBe("-10");
    expect(calculate("20/5*2")).toBe("8");
  });
  it("avoids decimal artifacts and keeps small results usable in another calculation", () => {
    expect(calculate("0.1+0.2")).toBe("0.3");
    const small = calculate("1/100000000000000");
    expect(small).toBe("0.00000000000001");
    expect(calculate(`${small}*100000000000000`)).toBe("1");
  });
  it("rejects invalid expressions, zero division, and overflow", () => {
    for (const expression of [
      "2+",
      "1/0",
      "0/0",
      "1;alert(1)",
      "2**3",
      "999999999999999*2",
    ])
      expect(() => calculate(expression)).toThrow();
  });
  it("continues a result with an operator and starts over with a digit", () => {
    const result = enter("12+3=");
    expect(result.expression).toBe("15");
    expect(result.previousExpression).toBe("12+3");
    const multiplied = calculatorReducer(
      calculatorReducer(result, { type: "input", value: "*" }),
      { type: "input", value: "2" },
    );
    expect(calculatorReducer(multiplied, { type: "equals" }).expression).toBe(
      "30",
    );
    expect(
      calculatorReducer(result, { type: "input", value: "7" }).expression,
    ).toBe("7");
    expect(calculatorReducer(result, { type: "equals" })).toEqual(result);
  });
  it("handles leading zeros, decimal keys, replacing operators, deletion, and clear", () => {
    expect(enter("00012.3.4").expression).toBe("12.34");
    expect(enter("2+*3=").expression).toBe("6");
    expect(enter("2*.5=").expression).toBe("1");
    expect(
      calculatorReducer(enter("12"), { type: "backspace" }).expression,
    ).toBe("1");
    expect(
      calculatorReducer(enter("1"), { type: "backspace" }).expression,
    ).toBe("0");
    expect(calculatorReducer(enter("123"), { type: "clear" })).toEqual(
      initialCalculator(),
    );
  });
  it("recovers from errors with clear or a new number", () => {
    const error = enter("1/0=");
    expect(error.error).toBe("0では割れません");
    expect(
      calculatorReducer(error, { type: "input", value: "8" }),
    ).toMatchObject({ expression: "8", error: null });
    expect(calculatorReducer(error, { type: "clear" })).toEqual(
      initialCalculator(),
    );
  });
});
