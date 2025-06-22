import type { FC } from "react";
import {
  Button,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DateRangePicker as AriaDateRangePicker,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Popover,
  RangeCalendar,
  type DateRangePickerProps,
  type DateValue,
} from "react-aria-components";

import CalendarIcon from "@/assets/calendar.svg?react";
import { tv } from "tailwind-variants";
import { cn } from "@/lib/cn";

const dateRangePicker = tv({
  variants: {
    color: {
      accent: {
        group: "focus-within:border-accent hover:border-accent",
        dateSegment: "text-gray focus:bg-background",
        button: "text-gray focus:bg-background p-1 rounded-full",
        calendarCell: "hover:bg-accent/10 focus:bg-accent/20",
      },
      red: {
        group: "border border-red hover:border-red focus-within:border-red",
        dateSegment: "text-red",
        button: "text-red",
        calendarCell: "hover:bg-red/10 focus:bg-red/20",
        selected: "bg-red text-white",
      },
    },
    disabled: {
      true: {
        group: "border border-gray-light hover:border-gray-light opacity-50",
        dateSegment: "text-gray-light",
        button: "text-gray-light",
      },
    },
  },
  slots: {
    base: "flex flex-col gap-1",
    group: "flex items-center gap-2 bg-surface p-3 rounded transition-colors border",
    dateInput: "flex px-1 rounded outline-none",
    dateSegment: "px-0.5 rounded-sm focus:outline-none",
    separator: "text-gray",
    button: "rounded-full hover:bg-gray-100 focus:outline-none ml-auto",
    popover: "entering:animate-fade-in exiting:animate-fade-out mt-1",
    dialog:
      "p-4 bg-surface rounded-lg shadow-lg outline-none border border-gray-light",
    calendar: "w-full",
    calendarHeader: "flex items-center justify-between mb-4",
    navButton: "w-8 h-8 rounded-full hover:bg-gray-100",
    heading: "font-semibold text-center text-gray-900",
    calendarGrid: "border-collapse",
    calendarCell: "w-8 h-8 flex items-center justify-center outline-none mt-2",
    calendarCellText: "text-sm",
  },
  defaultVariants: {
    color: "accent",
  },
});

const DateRangePicker: FC<DateRangePickerProps<DateValue>> = ({
  className,
  isDisabled,
  isInvalid,
  ...props
}) => {
  const {
    base,
    group,
    dateInput,
    dateSegment,
    separator,
    button,
    popover,
    dialog,
    calendar,
    calendarHeader,
    navButton,
    heading,
    calendarGrid,
    calendarCell,
    calendarCellText,
  } = dateRangePicker({
    disabled: isDisabled,
    color: isInvalid ? "red" : "accent",
  });

  return (
    <AriaDateRangePicker className={cn(base(), className)} {...props} isInvalid={isInvalid} aria-label="date-picker">
      <Group className={group()}>
        <DateInput slot="start" className={dateInput()}>
          {(segment) => (
            <DateSegment segment={segment} className={cn(dateSegment())} />
          )}
        </DateInput>

        <span aria-hidden="true" className={separator()}>
          -
        </span>

        <DateInput slot="end" className={dateInput()}>
          {(segment) => (
            <DateSegment segment={segment} className={cn(dateSegment())} />
          )}
        </DateInput>

        <Button className={button()}>
          <CalendarIcon width={16} height={16} />
        </Button>
      </Group>

      <Popover className={popover()} placement="bottom end">
        <Dialog className={dialog()}>
          <RangeCalendar className={calendar()}>
            <header className={calendarHeader()}>
              <Button slot="previous" className={navButton()}>
                ◀
              </Button>
              <Heading className={heading()} />
              <Button slot="next" className={navButton()}>
                ▶
              </Button>
            </header>

            <CalendarGrid className={calendarGrid()}>
              {(date) => (
                <CalendarCell
                  date={date}
                  className={({ isSelected, isOutsideMonth }) =>
                    cn(calendarCell(), {
                      "opacity-40": isOutsideMonth,
                      ["bg-accent/20 data-[selection-start=true]:rounded-l-full data-[selection-end=true]:rounded-r-full"]:
                        isSelected,
                    })
                  }
                >
                  {({ formattedDate }) => (
                    <span className={calendarCellText()}>{formattedDate}</span>
                  )}
                </CalendarCell>
              )}
            </CalendarGrid>
          </RangeCalendar>
        </Dialog>
      </Popover>
    </AriaDateRangePicker>
  );
};

export default DateRangePicker;
