import {
  useDateField,
  useDateSegment,
  useLocale,
  type AriaDateFieldProps,
  type DateValue,
} from "react-aria";
import {
  useDateFieldState,
  type DateFieldState,
  type DateSegment,
} from "react-stately";
import { createCalendar } from "@internationalized/date";
import { useRef, type FC } from "react";

const DateInput: FC<AriaDateFieldProps<DateValue>> = (props) => {
  const { locale } = useLocale();
  const state = useDateFieldState({
    ...props,
    locale,
    createCalendar,
  });

  const ref = useRef(null);
  const { labelProps, fieldProps } = useDateField(props, state, ref);

  return (
    <div className="wrapper">
      <span {...labelProps}>{props.label}</span>
      <div {...fieldProps} ref={ref} className="field">
        {state.segments.map((segment, i) => (
          <DateSegment key={i} segment={segment} state={state} />
        ))}
      </div>
    </div>
  );
};

type DateSegmentProps = {
  segment: DateSegment;
  state: DateFieldState;
};

const DateSegment: FC<DateSegmentProps> = ({ segment, state }) => {
  const ref = useRef(null);
  const { segmentProps } = useDateSegment(segment, state, ref);

  return (
    <span
      {...segmentProps}
      ref={ref}
      className={`segment ${segment.isPlaceholder ? "placeholder" : ""}`}
    >
      {segment.text}
    </span>
  );
};

export default DateInput;
