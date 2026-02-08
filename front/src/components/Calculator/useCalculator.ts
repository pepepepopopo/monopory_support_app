import { useState, useCallback } from "react";

type Operator = "+" | "-" | "*" | "/";

interface CalculatorState {
  currentInput: string; // 現在入力中の数字
  expression: string; // 計算式（例: "9+9+"）
  waitingForOperand: boolean;
}

const MAX_DIGITS = 9;

// 計算式を表示用に変換
const toDisplayExpression = (expr: string): string => {
  return expr
    .replace(/\+/g, " + ")
    .replace(/-/g, " − ")
    .replace(/\*/g, " × ")
    .replace(/\//g, " ÷ ");
};

// 式を評価（左から右へ順番に計算）
const evaluateExpression = (expr: string): number | null => {
  if (!expr) return null;

  // 数字と演算子に分割
  const tokens: (number | Operator)[] = [];
  let currentNum = "";

  for (const char of expr) {
    if ("+-*/".includes(char)) {
      if (currentNum) {
        tokens.push(parseFloat(currentNum));
        currentNum = "";
      }
      tokens.push(char as Operator);
    } else {
      currentNum += char;
    }
  }
  if (currentNum) {
    tokens.push(parseFloat(currentNum));
  }

  if (tokens.length === 0) return null;

  // 左から右へ計算
  let result = tokens[0] as number;
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i] as Operator;
    const operand = tokens[i + 1] as number;
    if (operand === undefined) break;

    switch (op) {
      case "+":
        result += operand;
        break;
      case "-":
        result -= operand;
        break;
      case "*":
        result *= operand;
        break;
      case "/":
        if (operand === 0) return null; // ゼロ除算
        result /= operand;
        break;
    }
  }

  return result;
};

export const useCalculator = () => {
  const [state, setState] = useState<CalculatorState>({
    currentInput: "0",
    expression: "",
    waitingForOperand: false,
  });

  const formatNumber = (num: number): string => {
    const rounded = Math.floor(num);
    if (rounded.toString().length > MAX_DIGITS) {
      return "Error";
    }
    return rounded.toLocaleString();
  };

  const inputDigit = useCallback((digit: string) => {
    setState((prev) => {
      if (prev.currentInput === "Error") {
        return { ...prev, currentInput: digit, waitingForOperand: false };
      }

      if (prev.waitingForOperand) {
        return { ...prev, currentInput: digit, waitingForOperand: false };
      }

      const newInput =
        prev.currentInput === "0" ? digit : prev.currentInput + digit;

      // 桁数制限
      if (newInput.replace(/,/g, "").length > MAX_DIGITS) {
        return prev;
      }

      return { ...prev, currentInput: newInput };
    });
  }, []);

  const inputOperator = useCallback((nextOperator: Operator) => {
    setState((prev) => {
      if (prev.currentInput === "Error") {
        return prev;
      }

      // 演算子入力直後は演算子を置き換えるだけ
      if (prev.waitingForOperand && prev.expression) {
        // 最後の演算子を置き換え
        const newExpression = prev.expression.slice(0, -1) + nextOperator;
        return {
          ...prev,
          expression: newExpression,
        };
      }

      // 現在の入力を式に追加
      const newExpression = prev.expression + prev.currentInput + nextOperator;

      return {
        ...prev,
        expression: newExpression,
        waitingForOperand: true,
      };
    });
  }, []);

  const performCalculation = useCallback(() => {
    setState((prev) => {
      if (prev.currentInput === "Error") {
        return prev;
      }

      // 式がない場合は何もしない
      if (!prev.expression) {
        return prev;
      }

      // 完全な式を作成
      const fullExpression = prev.expression + prev.currentInput;
      const result = evaluateExpression(fullExpression);

      if (result === null) {
        return {
          currentInput: "Error",
          expression: "",
          waitingForOperand: true,
        };
      }

      return {
        currentInput: formatNumber(result),
        expression: "",
        waitingForOperand: true,
      };
    });
  }, []);

  const clear = useCallback(() => {
    setState({
      currentInput: "0",
      expression: "",
      waitingForOperand: false,
    });
  }, []);

  const getValue = useCallback((): number => {
    if (state.currentInput === "Error") return 0;
    return Math.max(
      0,
      Math.floor(parseFloat(state.currentInput.replace(/,/g, "")))
    );
  }, [state.currentInput]);

  // 計算を実行して結果を返す（決定ボタン用）
  const calculateAndGetValue = useCallback((): number => {
    if (state.currentInput === "Error") return 0;

    // 式がある場合は計算を実行
    if (state.expression) {
      const fullExpression = state.expression + state.currentInput;
      const result = evaluateExpression(fullExpression);

      if (result === null) {
        setState({
          currentInput: "Error",
          expression: "",
          waitingForOperand: true,
        });
        return 0;
      }

      const finalValue = Math.max(0, Math.floor(result));
      setState({
        currentInput: formatNumber(finalValue),
        expression: "",
        waitingForOperand: true,
      });
      return finalValue;
    }

    // 式がない場合は現在の入力値を返す
    return Math.max(
      0,
      Math.floor(parseFloat(state.currentInput.replace(/,/g, "")))
    );
  }, [state]);

  // 表示用の計算式を生成
  const getDisplayExpression = (): string => {
    if (!state.expression) return "";

    const displayExpr = toDisplayExpression(state.expression);

    if (state.waitingForOperand) {
      return displayExpr;
    }

    return displayExpr + state.currentInput;
  };

  return {
    display: state.currentInput,
    expression: getDisplayExpression(),
    inputDigit,
    inputOperator,
    performCalculation,
    clear,
    getValue,
    calculateAndGetValue,
  };
};
