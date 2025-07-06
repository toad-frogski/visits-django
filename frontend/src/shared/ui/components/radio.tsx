import { useRadioGroupState, type RadioGroupState } from "@react-stately/radio";
import {
  useRadio,
  useRadioGroup,
  VisuallyHidden,
  type AriaRadioProps,
  type AriaRadioGroupProps,
  useFocusRing,
} from "react-aria";
import {
  createContext,
  useContext,
  useRef,
  type FC,
  type HTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { cn } from "@/shared/lib/cn";

const RadioContext = createContext<RadioGroupState | null>(null);

export const RadioGroup: FC<
  AriaRadioGroupProps & PropsWithChildren & HTMLAttributes<HTMLDivElement>
> = ({ children, label, description, errorMessage, ...props }) => {
  const state = useRadioGroupState(props);
  const { radioGroupProps, labelProps, descriptionProps, errorMessageProps } =
    useRadioGroup(props, state);

  return (
    <div {...radioGroupProps} {...props}>
      <span {...labelProps}>{label}</span>
      <RadioContext.Provider value={state}>{children}</RadioContext.Provider>
      {description && (
        <div {...descriptionProps} style={{ fontSize: 12 }}>
          {description}
        </div>
      )}
      {errorMessage && state.isInvalid && (
        <div {...errorMessageProps} style={{ color: "red", fontSize: 12 }}>
          {errorMessage as ReactNode}
        </div>
      )}
    </div>
  );
};

const Radio: FC<AriaRadioProps> = ({ children, ...props }) => {
  const state = useContext(RadioContext);
  const ref = useRef<HTMLInputElement>(null);

  const { inputProps, isSelected, isDisabled } = useRadio(
    props,
    state as RadioGroupState,
    ref
  );

  const { focusProps } = useFocusRing();

  return (
    <label
      className={cn(
      "flex items-center gap-2",
      isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      )}
    >
      <VisuallyHidden>
      <input {...inputProps} {...focusProps} ref={ref} />
      </VisuallyHidden>

      <div
      className={cn(
        "size-5 rounded-full border-2 border-accent relative transition-colors ease-in-out duration-200",
        isSelected ? "bg-accent" : "bg-transparent"
      )}
      aria-hidden="true"
      >
      {isSelected && (
        <div className="absolute bg-white top-1/2 left-1/2 -translate-1/2 size-2.5 rounded-full" />
      )}
      </div>

      {children}
    </label>
  );
};
export default Radio;
