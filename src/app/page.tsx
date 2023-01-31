"use client";

import styles from "./page.module.scss";
import {
  useState,
  useId,
  ComponentProps,
  forwardRef,
  ComponentPropsWithoutRef,
  useCallback,
  useRef,
  useEffect,
  createContext,
  Dispatch,
  SetStateAction,
  ReactNode,
  useContext,
} from "react";
import useTransition from "react-transition-state";

const withDebugInputValues = true;

export default function Registration() {
  const [{ error, isLoading, data }, mutate] = useSubmitFormMutation();
  const isSuccess = !!data;
  const isInputDisabled = isLoading || isSuccess;

  return (
    <main className={styles.main}>
      <Fades targetFade={isSuccess ? "success" : "form"}>
        <Fade name={"success"}>
          <p className={styles.successMessage} role="alert">
            Please check your email for a confirmation message after registering
            on the website. This message will verify your account and allow you
            to access all features. Thank you for registering!
          </p>
        </Fade>
        <Fade name={"form"}>
          <p className={styles.welcomeMessage}>
            Welcome!
            <br />
            Please complete the registration form to proceed.
          </p>
          <form
            aria-busy={isLoading}
            className={classNames([styles.form])}
            onSubmit={(event) => {
              event.preventDefault();
              if (isLoading) return;
              if (!(event.target instanceof HTMLFormElement)) return;

              const formData = new FormData(event.target);
              mutate(Object.fromEntries(formData.entries()));
            }}
          >
            <InputField
              required
              type="text"
              name="name"
              placeholder="Your Name"
              aria-label="Your Name"
              autoComplete="name"
              readOnly={isInputDisabled}
              aria-disabled={isInputDisabled}
              className={classNames([
                isInputDisabled && styles.field__disabled,
              ])}
              defaultValue={withDebugInputValues ? "Alex Batalov" : undefined}
            />
            <InputField
              required
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              aria-label="Email"
              readOnly={isInputDisabled}
              aria-disabled={isInputDisabled}
              className={classNames([
                isInputDisabled && styles.field__disabled,
              ])}
              defaultValue={
                withDebugInputValues ? "radist2s@gmail.com" : undefined
              }
            />
            <InputField
              required
              type="password"
              name="password"
              minLength={5}
              maxLength={100}
              onInput={(event) => {
                if (!(event.target instanceof HTMLInputElement)) return;
                if (event.target.validity.patternMismatch) {
                  event.target.setCustomValidity(
                    "Must contain at least one  number and one uppercase and lowercase letter, and at least 8 or more characters"
                  );
                }
              }}
              placeholder="Password"
              autoComplete="new-password"
              aria-label="Password"
              readOnly={isInputDisabled}
              aria-disabled={isInputDisabled}
              className={classNames([
                isInputDisabled && styles.field__disabled,
              ])}
              defaultValue={withDebugInputValues ? "my-password" : undefined}
            />
            <div className={styles.field}>
              <button
                type="submit"
                className={classNames([
                  styles.field_button,
                  isInputDisabled && styles.field__disabled,
                ])}
                aria-disabled={isInputDisabled}
              >
                {isLoading ? (
                  <CircularProgress className={styles.field_button_icon} />
                ) : (
                  <Check className={styles.field_button_icon} />
                )}
                Sign Up
              </button>
            </div>

            <div
              role={error ? "alert" : "none"}
              aria-hidden={!error}
              className={styles.errorAlert}
            >
              {!!error && getErrorMessage(error)}
            </div>
          </form>
        </Fade>
      </Fades>
    </main>
  );
}

const InputField = forwardRef<
  HTMLInputElement,
  ComponentPropsWithoutRef<"input">
>(({ placeholder, className, ...restProps }, ref) => {
  const [highlightInvalid, setHighlightInvalid] = useState(false);
  const id = useId();

  return (
    <div className={styles.field}>
      <label aria-hidden className={styles.field_inputLabel} htmlFor={id}>
        {placeholder}
      </label>
      <input
        ref={ref}
        id={id}
        placeholder={placeholder}
        aria-label={placeholder}
        onInvalid={() => setHighlightInvalid(true)}
        className={classNames([
          className,
          styles.field_input,
          highlightInvalid && styles.field_input__highlightInvalid,
        ])}
        {...restProps}
      />
    </div>
  );
});

const CircularProgress = ({
  className,
  ...restProps
}: ComponentProps<"svg">) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={classNames([className, styles.circularProgress])}
    {...restProps}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
  </svg>
);

const Check = (props: ComponentProps<"svg">) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const FadeContext = createContext<{
  targetFade?: string;
  currentFade?: string;
  setMountedFade?: Dispatch<SetStateAction<string>>;
}>({});

const Fades = ({
  children,
  targetFade,
}: {
  children: ReactNode;
  targetFade: string;
}) => {
  const [mountedFade, setMountedFade] = useState(targetFade);

  return (
    <FadeContext.Provider
      value={{ targetFade, currentFade: mountedFade, setMountedFade }}
    >
      {children}
    </FadeContext.Provider>
  );
};

const Fade = ({
  className,
  name,
  ...restProps
}: { name: string } & ComponentProps<"div">) => {
  const transitionDurationMs = 500;
  const [{ status, isMounted }, toggle] = useTransition({
    timeout: transitionDurationMs,
    mountOnEnter: true,
    unmountOnExit: true,
    preEnter: true,
  });

  const { targetFade, currentFade, setMountedFade } = useContext(FadeContext);

  useEffect(() => {
    if (isMounted && targetFade !== name) {
      toggle(false);
    }
  }, [isMounted, targetFade, name, toggle]);

  useEffect(() => {
    return () => {
      if (isMounted && targetFade !== undefined) setMountedFade?.(targetFade);
    };
  }, [isMounted, targetFade, setMountedFade]);

  useEffect(() => {
    if (currentFade === name) {
      requestAnimationFrame(() => toggle(true));
    }
  }, [currentFade, name, toggle]);

  if (!isMounted) return null;

  return (
    <div
      style={{ transitionDuration: `${transitionDurationMs}ms` }}
      className={classNames([
        className,
        styles.fader,
        ["preEnter", "exiting"].includes(status) && styles.fader__hidden,
      ])}
      {...restProps}
    />
  );
};

const classNames = (classNames: (string | boolean | null | undefined)[]) => {
  return classNames.filter(Boolean).join(" ");
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return JSON.stringify(error);
};

const useSubmitFormMutation = () => {
  const [mutationState, setMutationState] = useState<{
    isLoading: boolean;
    error: unknown;
    data: unknown | undefined;
  }>({
    isLoading: false,
    error: false,
    data: undefined,
  });

  const abortController = useRef<AbortController | null>(null);

  const mutate = useCallback(
    async (body: Record<string, FormDataEntryValue>) => {
      if (abortController.current instanceof AbortController) {
        abortController.current.abort();
      }

      abortController.current = new AbortController();

      setMutationState((prev) => ({ ...prev, isLoading: true }));

      const result = await fetch("/api/registration", {
        method: "POST",
        body: JSON.stringify(body),
        signal: abortController.current?.signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!result.ok) {
        try {
          const { error } = await result.json();
          return setMutationState(() => ({
            isLoading: false,
            error: new Error(error),
            data: undefined,
          }));
        } catch (error) {
          return setMutationState(() => ({
            isLoading: false,
            error,
            data: undefined,
          }));
        }
      }

      setMutationState({
        isLoading: false,
        error: undefined,
        data: await result.json(),
      });
    },
    []
  );

  return [mutationState, mutate] as const;
};
