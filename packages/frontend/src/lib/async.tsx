import { createContext, useEffect, useState, type JSX } from "react";

type Res<Ok, Err> =
  | { type: "loading" }
  | { type: "error"; value: Err }
  | { type: "ok"; value: Ok };

type FinalRes<Ok, Err> =
  | { ok: Ok; error: undefined; loading: undefined }
  | { ok: undefined; error: Err; loading: undefined }
  | { ok: undefined; error: undefined; loading: JSX.Element };

/**
 * State wrapper for async functions,
 * rendering different JSX for different states:
 * * Loading (pending) states -- default is `\<\>Loading\</\>`;
 * * Error states -- default is to just `console.error`;
 * * Success state -- returns `{ok: data}`.
 *
 * See {@link asyncHook} for example usage.
 */
export class Result<Ok, Err> {
  #internal: Res<Ok, Err>;
  #loadingHandler: () => JSX.Element = () => <>Loading</>;
  #errorHandler: (error: Err) => unknown = console.error;

  private constructor(internal: Res<Ok, Err>) {
    this.#internal = internal;
  }

  static loading(): Result<never, never> {
    return new Result({ type: "loading" });
  }

  static error<Err>(error: Err): Result<never, Err> {
    return new Result({ type: "error", value: error }) as Result<never, Err>;
  }

  static ok<Ok>(ok: Ok): Result<Ok, never> {
    return new Result({ type: "ok", value: ok }) as unknown as Result<
      Ok,
      never
    >;
  }

  catch(handler?: (error: Err) => unknown): this {
    this.#errorHandler = handler ?? this.#errorHandler;
    return this;
  }

  loading(handler: () => JSX.Element): this {
    this.#loadingHandler = handler;
    return this;
  }

  await(): FinalRes<Ok, unknown> {
    switch (this.#internal.type) {
      case "loading":
        return {
          loading: this.#loadingHandler(),
          ok: undefined,
          error: undefined,
        };
      case "error":
        return {
          error: this.#errorHandler(this.#internal.value),
          loading: undefined,
          ok: undefined,
        };
      case "ok":
        return {
          ok: this.#internal.value,
          error: undefined,
          loading: undefined,
        };
    }
  }
}

/**
 * ## `useAsync` hook.
 *
 * Allows you to call async functions from
 * within a functional component.
 *
 * @param func - The async function to call.
 * @returns The {@link Result} state wrapper.
 *
 * @example
 * ```tsx
 * import { useAsync } from "../lib/async";
 *
 * async function randomWaiting(ms: number) {
 *  await new Promise((resolve) => setTimeout(resolve, ms));
 *  if (Math.random() > 0.5) {
 *    throw new Error("Random error.");
 *  }
 *
 *  return "Random success.";
 * }
 *
 * function Example() {
 *  const { loading, error, ok } = useAsync(() => randomWaiting(1_000))
 *    .loading(() => <>Waiting...</>)
 *    .catch((error: Error) => <>{error.toString()}</>)
 *    .await();
 *
 *  if (!ok) return loading ?? error;
 *
 *  return <>{ok}</>;
 * }
 * ```
 */
export function useAsync<S>(func: () => Promise<S>) {
  const [state, setState] = useState(
    Result.loading() as unknown as Result<S, Error>,
  );

  useEffect(() => {
    func()
      .then((data: S) => {
        setState(Result.ok(data) as unknown as Result<S, Error>);
      })
      .catch((error: Error) => {
        setState(Result.error(error));
      });
  }, []);

  return state;
}

/**
 * ## `ErrorHandler` context.
 *
 * Allows you to `catch` errors from child components further
 * down the component tree.
 *
 * The parent provides a callback to handle errors, which any
 * child component with `useAsync` may call in the event of an error.
 *
 * @example
 * ```tsx
 * import { ErrorHandler } from "../lib/async";
 *
 * function Parent({children}: {children: JSX.Element}) {
 *    const [error, setError] = useState<Error | undefined>(undefined);
 *    return (
 *      <ErrorHandler.Provider value={setError}>
 *        {<>{error?.toString() ?? null}</>}
 *        {children}
 *      </ErrorHandler.Provider>
 *    );
 * }
 * ```
 */
export const ErrorHandler = createContext<((error: Error) => void) | undefined>(
  undefined,
);
