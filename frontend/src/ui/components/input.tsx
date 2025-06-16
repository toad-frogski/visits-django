import { forwardRef, useEffect, useRef, useState, type ChangeEvent, type FC, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import useDesktop from "@/lib/hooks/useDesktop";

import Eye from "@/assets/eye.svg?react";
import EyeOff from "@/assets/eye-off.svg?react";
import Clock from "@/assets/clock.svg?react";

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

const TimeInput = forwardRef<HTMLInputElement, Omit<BaseInputProps, "type">>(
  ({ className, value, onChange, ...props }, ref) => {
    const [hours, setHours] = useState<number>(0);
    const [minutes, setMinutes] = useState<number>(0);
    const hoursRef = useRef<HTMLDivElement>(null);
    const minutesRef = useRef<HTMLDivElement>(null);
    const mobileTimeRef = useRef<HTMLInputElement>(null);

    const isDesktop = useDesktop();

    const handleHoursChange = (increment: number) => {
      setHours((hours + increment + 24) % 24);
    };

    const handleMinutesChange = (increment: number) => {
      setMinutes((minutes + increment + 60) % 60);
    };

    const handleDigitInput = (
      value: number,
      setValue: React.Dispatch<React.SetStateAction<number>>,
      max: number,
      nextRef?: React.RefObject<HTMLDivElement | null>
    ) => {
      return (digit: number | string) => {
        digit = Number(digit) || 0;
        let newValue: number;

        if (value > 0) {
          newValue = (value % 10) * 10 + digit;
        } else {
          newValue = digit;
        }

        if (newValue <= max) {
          setValue(newValue);
          if (newValue > 9 && nextRef?.current) {
            nextRef.current.focus();
          }
        }
      };
    };

    const handleDelete = (
      value: number,
      setValue: React.Dispatch<React.SetStateAction<number>>,
      prevRef?: React.RefObject<HTMLDivElement | null>
    ) => {
      if (value > 9) {
        setValue(Math.floor(value / 10));
      } else if (value > 0) {
        setValue(0);
      } else if (prevRef?.current) {
        prevRef.current.focus();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent, type: "hours" | "minutes") => {
      const isHours = type === "hours";

      const actions = {
        ArrowUp: () => (isHours ? handleHoursChange(1) : handleMinutesChange(1)),
        ArrowDown: () => (isHours ? handleHoursChange(-1) : handleMinutesChange(-1)),
        Home: () => (isHours ? setHours(23) : setMinutes(59)),
        End: () => (isHours ? setHours(0) : setMinutes(0)),
        PageUp: () => (isHours ? handleHoursChange(5) : handleMinutesChange(5)),
        PageDown: () => (isHours ? handleHoursChange(-5) : handleMinutesChange(-5)),
        ArrowRight: () => isHours && minutesRef.current?.focus(),
        ArrowLeft: () => !isHours && hoursRef.current?.focus(),
        Delete: () => (isHours ? setHours(0) : setMinutes(0)),
        Backspace: () => (isHours ? handleDelete(hours, setHours) : handleDelete(minutes, setMinutes, hoursRef)),
      } as const;

      const action = actions[e.key as keyof typeof actions];
      if (action) {
        e.preventDefault();
        action();
      }

      if (/^\d$/.test(e.key)) {
        e.preventDefault();
        const handler = isHours
          ? handleDigitInput(hours, setHours, 23, minutesRef)
          : handleDigitInput(minutes, setMinutes, 59);
        handler(e.key);
        return;
      }
    };

    const parseTime = (time: string) => {
      if (!time) return;

      const [h, m] = String(time).split(":").map(Number);
      if (!isNaN(h)) setHours(h);
      if (!isNaN(m)) setMinutes(m);
    };

    const handleMobileChange = (e: ChangeEvent<HTMLInputElement>) => {
      parseTime(e.target.value);
    };

    useEffect(() => {
      parseTime(value as string);
    }, [value]);

    useEffect(() => {
      if (hoursRef.current) {
        hoursRef.current.innerText = String(hours).padStart(2, "0");
      }
    }, [hours]);

    useEffect(() => {
      if (minutesRef.current) {
        minutesRef.current.innerText = String(minutes).padStart(2, "0");
      }
    }, [minutes]);

    useEffect(() => {
      if (!onChange) return;

      const newValue = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      const event = {
        target: { value: newValue },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange(event);
    }, [hours, minutes, onChange]);

    return (
      <div
        className={cn(
          className,
          "relative py-3 pl-2 pr-10 flex items-center border border-gray-light hover:border-accent bg-surface rounded transition-colors duration-200 ease-in-out text-gray font-semibold"
        )}
        onClick={() => {
          if (!isDesktop) {
            mobileTimeRef.current?.focus();
          }
        }}
      >
        <div
          ref={hoursRef}
          role="spinbutton"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={23}
          aria-valuenow={hours}
          aria-valuetext={String(hours).padStart(2, "0")}
          onClick={() => hoursRef.current?.focus()}
          onKeyDown={(e) => handleKeyDown(e, "hours")}
          onWheel={(e) => {
            e.preventDefault();
            handleHoursChange(e.deltaY > 0 ? -1 : 1);
          }}
          className="outline-none focus:bg-background rounded px-1 caret-transparent"
          contentEditable
          inputMode="numeric"
        />

        <span className="px-1">:</span>

        <div
          ref={minutesRef}
          role="spinbutton"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={59}
          aria-valuenow={minutes}
          aria-valuetext={String(minutes).padStart(2, "0")}
          onClick={() => minutesRef.current?.focus()}
          onKeyDown={(e) => handleKeyDown(e, "minutes")}
          onWheel={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleMinutesChange(e.deltaY > 0 ? -1 : 1);
          }}
          className="outline-none focus:bg-background rounded px-1 caret-transparent"
          contentEditable
          inputMode="numeric"
        />

        <Clock className="absolute right-2" width={24} height={24} />

        <input
          ref={ref}
          type="hidden"
          value={`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`}
          {...props}
        />

        <input
          ref={mobileTimeRef}
          type="time"
          className="opacity-0"
          value={`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`}
          onChange={handleMobileChange}
        />
      </div>
    );
  }
);

export { TextInput, PasswordInput, TimeInput, ErrorMessage };
