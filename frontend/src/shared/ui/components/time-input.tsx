import { useRef, type FC, type HTMLAttributes, type ReactNode } from "react";
import type { Time } from "@internationalized/date";
import {
  useDateSegment,
  useLocale,
  useTimeField,
  type AriaTimeFieldProps,
} from "react-aria";
import {
  useTimeFieldState,
  type DateSegment as DateSegmentType,
  type DateFieldState,
} from "react-stately";
import { tv } from "tailwind-variants";

import Clock from "@/assets/clock.svg?react";

type TimeInputProps = AriaTimeFieldProps<Time> &
  Pick<HTMLAttributes<Time>, "className"> & {
    color?: "red" | "accent";
  };

const timeInput = tv({
  variants: {
    color: {
      accent: {
        base: "hover:border-accent focus:border-accent focus-within:border-accent",
        segments: "text-gray focus:bg-background p-1",
      },
      red: {
        base: "border-red hover:border-red focus:border-red",
        icon: "*:stroke-red",
        segments: "text-red",
        label: "text-red",
      },
    },
    disabled: {
      true: {
        base: "border-gray-light hover:border-gray focus:border-gray",
        icon: "*stroke-gray-light",
        segments: "text-gray-light",
      },
    },
  },
  slots: {
    base: "relative gap-3 pl-3 pr-9 py-3 bg-surface rounded min-w-24 border",
    icon: "absolute right-0 bottom-0 -translate-1/2",
    error: "text-red",
    label: "",
    segments: "focus:outline-0",
  },
  defaultVariants: {
    color: "accent",
  },
});

const TimeInput: FC<TimeInputProps> = (props) => {
  const { locale } = useLocale();
  const state = useTimeFieldState({ ...props, locale });
  const ref = useRef(null);
  const { labelProps, fieldProps, errorMessageProps } = useTimeField(
    props,
    state,
    ref
  );
  const { label, errorMessage, className } = props;

  const { base, icon, error, segments, label: labelCn } = timeInput({
    color: errorMessage ? "red" : props.color ?? "accent",
  });

  return (
    <div className={className}>
      <span {...labelProps} className={labelCn()}>{label}</span>
      <div {...fieldProps} ref={ref} className={base()}>
        <div>
          {state.segments.map((segment, i) => (
            <DateSegment
              key={i}
              segment={segment}
              state={state}
              className={segments()}
            />
          ))}
        </div>
        <Clock width={24} height={24} className={icon()} />
      </div>
      <span {...errorMessageProps} className={error()}>
        {errorMessage as ReactNode}
      </span>
    </div>
  );
};

type DateSegmentProps = {
  segment: DateSegmentType;
  state: DateFieldState;
  className?: string;
};

const DateSegment: FC<DateSegmentProps> = ({ segment, state, className }) => {
  const ref = useRef(null);
  const { segmentProps } = useDateSegment(segment, state, ref);

  return (
    <span {...segmentProps} ref={ref} className={className}>
      {segment.text}
    </span>
  );
};

export default TimeInput;
