import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";

interface DatePickerWithSingleDefaultProps {
  date: DateRange | undefined;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  className?: string;
}

export function DatePickerWithSingleDefault({
  date,
  setDate,
  className,
}: DatePickerWithSingleDefaultProps) {
  const isMobile = useIsMobile();

  // Format display text for the date button
  const formatDateDisplay = () => {
    if (!date?.from) return <span>{isMobile ? "Date range" : "Pick a date range"}</span>;
    
    if (date.to) {
      // If both dates are the same, just show one date
      if (
        date.from.getDate() === date.to.getDate() &&
        date.from.getMonth() === date.to.getMonth() &&
        date.from.getFullYear() === date.to.getFullYear()
      ) {
        return format(date.from, "LLL dd, y");
      }
      // Otherwise show the range
      return (
        <>
          {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
        </>
      );
    }
    
    // If only from date is set
    return format(date.from, "LLL dd, y");
  };
  
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full sm:w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateDisplay()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={isMobile ? 1 : 2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
