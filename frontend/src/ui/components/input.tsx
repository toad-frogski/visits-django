import { forwardRef, useEffect, useState, type ChangeEvent, type FC, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

import Eye from "@/assets/eye.svg?react";
import EyeOff from "@/assets/eye-off.svg?react";

export type BaseInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
  ({ label, error, className, defaultValue, value, type, onChange, children, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [innerValue, setInnerValue] = useState(defaultValue || "");

    useEffect(() => {
      if (value !== undefined) {
        setInnerValue(value);
      }
    }, [value]);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInnerValue(e.target.value);
      }
      onChange?.(e);
    };

    const currentValue = value !== undefined ? value : innerValue;
    const shouldFloatLabel = isFocused || !!currentValue || !!props.placeholder;

    return (
      <div className="w-full">
        <label
          className={cn(
            "relative border rounded-md overflow-hidden transition-all duration-200 flex",
            { "!border-gray !text-gray": !!props.disabled },
            { "border-red text-red": error },
            className,
            isFocused ? "border-accent" : "hover:border-blue-light"
          )}
        >
          {label && (
            <span
              className={cn(
                "absolute left-3 transition-all duration-200 pointer-events-none",
                shouldFloatLabel ? "top-2 text-xs" : "top-1/2 text-base transform -translate-y-1/2"
              )}
            >
              {label}
            </span>
          )}
          <input
            {...props}
            ref={ref}
            className={cn("border-none outline-none bg-transparent p-3 pr-12 w-full", label && "pt-6")}
            onBlur={handleBlur}
            onFocus={handleFocus}
            value={currentValue}
            onChange={handleChange}
            type={type}
          />
          {children}
        </label>
        <ErrorMessage error={error} />
      </div>
    );
  }
);

const ErrorMessage: FC<{ error?: string }> = ({ error }) => {
  return (
    error && (
      <p
        className={cn(
          "ml-3 text-red transition-all duration-200 ease-in-out transform",
          error ? "visible opacity-100 -translate-y-0" : "invisible opacity-0 translate-y-1"
        )}
      >
        {error}
      </p>
    )
  );
};

const TextInput = forwardRef<HTMLInputElement, BaseInputProps>((props, ref) => (
  <BaseInput {...props} ref={ref} type={props.type || "text"} />
));

const PasswordInput = forwardRef<HTMLInputElement, BaseInputProps>((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <BaseInput {...props} ref={ref} type={showPassword ? "text" : "password"}>
      <span
        className="px-3 cursor-pointer absolute right-0 top-1/2 -translate-y-1/2"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <Eye width={24} height={24} /> : <EyeOff width={24} height={24} />}
      </span>
    </BaseInput>
  );
});

export { TextInput, PasswordInput, ErrorMessage };
