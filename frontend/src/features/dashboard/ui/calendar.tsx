import { useState, type FC } from "react";
import { Calendar as UICalendar } from "@/shared/components/ui/calendar";
import { Popover } from "@/shared/components/ui/popover";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { useDashboard } from "@/features/dashboard/model/dashboard.context";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "@/shared/components/ui/button";
import { ChevronRight } from "lucide-react";

const Calendar: FC = () => {
  const [open, setOpen] = useState(false);
  const { dateRange, setDateRange } = useDashboard();
  const isMobile = useIsMobile();

  if (isMobile)
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" id="date" className="w-full justify-between font-normal">
            {dateRange?.from && dateRange.to
              ? dateRange.from.toLocaleDateString() + " - " + dateRange.to.toLocaleDateString()
              : "Select date"}
            <ChevronRight className="transition-transform duration-200 data-[active=true]:rotate-90" data-active={open} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0 z-20" align="end">
          <UICalendar
            mode="range"
            selected={dateRange}
            captionLayout="dropdown"
            onSelect={(date) => {
              setDateRange(date);
            }}
          />
        </PopoverContent>
      </Popover>
    );

  return (
    <UICalendar
      className="w-full rounded-lg border shadow-sm"
      mode="range"
      selected={dateRange}
      onSelect={setDateRange}
    />
  );
};

export default Calendar;
