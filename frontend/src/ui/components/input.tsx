import { clsx } from "clsx";
import { forwardRef, useEffect, useState, type ChangeEvent, type InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>((
  { label, error, className, defaultValue, value, onChange, ...props }, ref
) => {
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
  }

  const currentValue = value !== undefined ? value : innerValue;
  const shouldFloatLabel = isFocused || !!currentValue || !!props.placeholder;

  return (
    <div className="w-full">
      <label className={clsx(
        "relative block border rounded-md overflow-hidden transition-all duration-200",
        { "!border-gray !text-gray": !!props.disabled },
        { "border-red text-red": error },
        className,
        isFocused
          ? "border-accent"
          : "hover:border-blue-light",
      )}>
        {label && (
          <span
            className={clsx(
              "absolute left-3 transition-all duration-200 pointer-events-none",
              shouldFloatLabel
                ? "top-2 text-xs"
                : "top-1/2 text-base transform -translate-y-1/2"
            )}
          >
            {label}
          </span>
        )}
        <input
          {...props}
          ref={ref}
          className={clsx(
            "border-none outline-none bg-transparent p-3 w-full",
            { "pt-6": label }
          )}
          onBlur={handleBlur}
          onFocus={handleFocus}
          value={currentValue}
          onChange={handleChange}
        />
      </label>
      {error && (<p className={clsx(
        "ml-3 text-red transition-all duration-200 ease-in-out transform",
        error
          ? "visible opacity-100 -translate-y-0"
          : "invisible opacity-0 translate-y-1"
      )}>{error}</p>)}
    </div>
  )
})

export default Input;