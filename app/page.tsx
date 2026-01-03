"use client";
import Image from "next/image";
import { SetStateAction, useState } from "react";
import * as math from "mathjs";

export default function Home() {
  const [functionInput, setFunctionInput] = useState("x^3 - 7*x");
  const [initialGuess, setInitialGuess] = useState("1.5");
  const [iterations, setIterations] = useState("20");
  const [functionError, setFunctionError] = useState("");
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [calculationError, setCalculationError] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  interface IterationData {
    iteration: number;
    x: number;
    fx: number;
    fpx: number;
    xNew: number;
  }

  interface CalculationResult {
    iterations: IterationData[];
    finalRoot: number | null;
  }

  const validateFunction = (value: string): boolean => {
    if (value.trim() === "") {
      setFunctionError("Unexpected end after undefined");
      return false;
    }

    const hasInvalidLetters: boolean = /[a-wyzA-WYZ]/.test(value);
    if (hasInvalidLetters) {
      setFunctionError("any variables other than x is not allowed");
      return false;
    } else {
      setFunctionError("");
      return true;
    }
  };

  const handleFunctionChange = (e: { target: { value: unknown } }) => {
    const value = String(e.target.value);
    setFunctionInput(value);
    validateFunction(value);
  };

  const handleNumberInput = (
    value: string,
    setter: { (value: SetStateAction<string>): void; (arg0: string): void }
  ) => {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || value.trim() === "") {
      setter("0");
    } else {
      setter(value);
    }
  };

  const handleIterationsInput = (
    value: string,
    setter: { (value: SetStateAction<string>): void; (arg0: string): void }
  ) => {
    const parsed = parseInt(value);
    if (isNaN(parsed) || value.trim() === "") {
      setter("0");
    } else {
      setter(Math.floor(Math.abs(parsed)).toString());
    }
  };

  const evaluateFunction = (func: math.MathExpression, xValue: number) => {
    try {
      const scope = { x: xValue };
      return math.evaluate(func, scope);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error("Invalid function expression");
    }
  };

  const numericalDerivative = (func: string, xValue: number) => {
    const h = 1e-7;
    const fx1 = evaluateFunction(func, xValue + h);
    const fx2 = evaluateFunction(func, xValue - h);
    return (fx1 - fx2) / (2 * h);
  };

  const handleCalculate = (): void => {
    console.log("This is actually working");
    setCalculationError("");
    setResults(null);
    setIsCalculating(true);

    if (!validateFunction(functionInput)) {
      setCalculationError("Please fix the function input errors");
      setIsCalculating(false);
      return;
    }

    const x0 = parseFloat(initialGuess);
    const maxIter = parseInt(iterations);

    if (isNaN(x0) || isNaN(maxIter)) {
      setCalculationError("Please ensure all inputs are valid numbers");
      setIsCalculating(false);
      return;
    }

    if (maxIter <= 0) {
      setCalculationError("Number of iterations must be greater than 0");
      setIsCalculating(false);
      return;
    }

    try {
      const iterationData: IterationData[] = [];
      let x = x0;

      for (let i = 0; i < maxIter; i++) {
        const fx = evaluateFunction(functionInput, x);
        const fpx = numericalDerivative(functionInput, x);

        if (Math.abs(fpx) < 1e-12) {
          setCalculationError(
            `Derivative is zero at iteration ${i + 1}. Method cannot continue.`
          );
          setResults({
            iterations: iterationData,
            finalRoot: null,
          });
          setIsCalculating(false);
          return;
        }

        const xNew = x - fx / fpx;

        iterationData.push({
          iteration: i + 1,
          x: x,
          fx: fx,
          fpx: fpx,
          xNew: xNew,
        });

        x = xNew;
      }

      setResults({
        iterations: iterationData,
        finalRoot: x,
      });
    } catch (error) {
      setCalculationError(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
        <nav className="fixed top-0 left-0 flex w-full items-center justify-left border-b border-zinc-200 bg-white dark:border-zinc-700 dark:bg-black h-14 px-4 py-2 z-10">
          <Image
            className="dark:invert"
            src="/logo.svg"
            alt="Okocha-Ojeah Benedict Logo"
            width={37}
            height={37}
            priority
          />
          <span className="ml-2 text-lg font-bold dark:text-white">
            NEWTON-R
            <Image
              className="inline-block dark:invert"
              src="/logo2.svg"
              alt="Next.js logo"
              width={24}
              height={24}
              priority
            />
            PHSON CALCULATOR
          </span>
        </nav>
        <main className="flex w-full max-w-5xl flex-col items-start px-16 pt-20 pb-32 bg-white dark:bg-black mx-auto">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tighter dark:text-white sm:text-5xl ">
            Newton-Raphson Calculator
          </h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            This is a simple Newton-Raphson Calculator built with Next.js and
            TypeScript. It allows users to find roots of real-valued functions
            using the Newton-Raphson method.
          </p>
          <section className="mt-8 w-full">
            <div className="flex flex-col">
              <div className="flex items-center mt-1">
                <span className="dark:text-white">y = f(x) = </span>

                <input
                  type="text"
                  className={`ml-2 w-64 rounded-md border ${
                    functionError
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-zinc-200 focus:border-blue-500 focus:ring-blue-500"
                  } bg-white px-3 py-2 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:outline-none focus:ring-1 dark:border-zinc-700 dark:bg-black dark:text-white dark:placeholder:text-zinc-500`}
                  placeholder="Enter function"
                  value={functionInput}
                  onChange={handleFunctionChange}
                />
              </div>
              {functionError && (
                <p className="mt-1 ml-28 text-sm text-red-600 dark:text-red-400">
                  {functionError}
                </p>
              )}
            </div>
            <div className="flex items-center mt-4">
              <span className="dark:text-white">Initial Guess (x₀): </span>
              <input
                type="text"
                className="ml-2 w-32 rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-black dark:text-white dark:placeholder:text-zinc-500"
                placeholder="e.g., 1.0"
                value={initialGuess}
                onChange={(e) => setInitialGuess(e.target.value)}
                onBlur={(e) =>
                  handleNumberInput(e.target.value, setInitialGuess)
                }
              />
            </div>
            <div className="flex items-center mt-4">
              <span className="dark:text-white">Number of Iterations: </span>
              <input
                type="text"
                className="ml-2 w-32 rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-black dark:text-white dark:placeholder:text-zinc-500"
                placeholder="e.g., 10"
                value={iterations}
                onChange={(e) => setIterations(e.target.value)}
                onBlur={(e) =>
                  handleIterationsInput(e.target.value, setIterations)
                }
              />
            </div>
            <div className="flex items-center mt-4">
              <button
                onClick={handleCalculate}
                className={`rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer ${
                  isCalculating ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isCalculating}
              >
                {isCalculating ? "Calculating..." : "Calculate"}
              </button>
            </div>

            {calculationError && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
                <p className="text-red-800 dark:text-red-200">
                  {calculationError}
                </p>
              </div>
            )}

            {results && (
              <div className="mt-8 w-full">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">
                  Results
                </h2>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-zinc-200 dark:border-zinc-700">
                    <thead className="bg-zinc-100 dark:bg-zinc-800">
                      <tr>
                        <th className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 text-left dark:text-white">
                          Iteration
                        </th>
                        <th className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 text-left dark:text-white">
                          xₙ
                        </th>
                        <th className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 text-left dark:text-white">
                          f(xₙ)
                        </th>
                        <th className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 text-left dark:text-white">
                          f&apos;(xₙ)
                        </th>
                        <th className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 text-left dark:text-white">
                          xₙ₊₁
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.iterations.map((iter) => (
                        <tr
                          key={iter.iteration}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        >
                          <td className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 dark:text-white">
                            {iter.iteration}
                          </td>
                          <td className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 font-mono text-sm dark:text-white">
                            {iter.x.toFixed(10)}
                          </td>
                          <td className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 font-mono text-sm dark:text-white">
                            {iter.fx.toFixed(10)}
                          </td>
                          <td className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 font-mono text-sm dark:text-white">
                            {iter.fpx.toFixed(10)}
                          </td>
                          <td className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 font-mono text-sm dark:text-white">
                            {iter.xNew.toFixed(10)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </main>
        <footer className="fixed bottom-0 left-0 flex w-full items-center justify-center border-t border-zinc-200 bg-white px-8 py-6 dark:border-zinc-700 dark:bg-black">
          <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-4">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              <p className="font-medium">Okocha-Ojeah Benedict</p>
              <p className="text-xs">Pan-Atlantic University</p>
            </div>
            <span className="hidden text-zinc-300 dark:text-zinc-600 sm:inline">
              •
            </span>
            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <span>Built with</span>
              <Image
                className="dark:invert"
                src="/next.svg"
                alt="Next.js logo"
                width={60}
                height={12}
                priority
              />
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
