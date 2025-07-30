import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import moment from "moment";
import type { DateRange } from "react-day-picker";

export const useDateRangeQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const initialRange: DateRange | undefined =
    fromParam && toParam && moment(fromParam).isValid() && moment(toParam).isValid()
      ? {
          from: moment(fromParam, "YYYY-MM-DD").toDate(),
          to: moment(toParam, "YYYY-MM-DD").toDate(),
        }
      : undefined;

  const [dateRange, setDateRange] = useState<DateRange | undefined>(initialRange);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      searchParams.set("from", moment(dateRange.from).format("YYYY-MM-DD"));
      searchParams.set("to", moment(dateRange.to).format("YYYY-MM-DD"));
      setSearchParams(searchParams);
    } else {
      searchParams.delete("from");
      searchParams.delete("to");
      setSearchParams(searchParams);
    }
  }, [dateRange, setSearchParams]);

  return { dateRange, setDateRange };
};
