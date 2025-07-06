import { type RangeValue } from "@react-types/shared";
import { useSearchParams } from "react-router";
import { formatDate, parseDate } from "@/shared/lib/utils";
import type { DateValue } from "react-aria-components";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

const useDateRangeQueryParams = (): [
  RangeValue<DateValue> | null,
  Dispatch<SetStateAction<RangeValue<DateValue> | null>>
] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [range, setRange] = useState<RangeValue<DateValue> | null>(() => {
    const start = parseDate(searchParams.get("start"));
    const end = parseDate(searchParams.get("end"));

    return start && end ? { start, end } : null;
  });

  useEffect(() => {
    const start = parseDate(searchParams.get("start"));
    const end = parseDate(searchParams.get("end"));

    if (!start || !end) return;

    if (!range || start !== range.start || end !== range.end) {
      setRange({ start, end });
    }
  }, [searchParams]);

  useEffect(() => {
    if (range?.start && range?.end) {
      const start = formatDate(range.start);
      const end = formatDate(range.end);

      setSearchParams({ start: start, end: end });
    }
  }, [range, setSearchParams]);

  return [range, setRange];
};

export default useDateRangeQueryParams;
