"use client"
 
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-between pt-1 relative items-center px-2",
        caption_label: "text-sm font-medium",
        nav: "flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent rounded-full flex items-center justify-center p-0 hover:bg-[#8F1837] hover:text-white",
        ),
        nav_button_previous: "mr-auto",
        nav_button_next: "ml-auto",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-gray-500 rounded-md w-8 font-medium text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&>button]:pointer-events-auto",
        day: "h-8 w-8 p-0 font-normal flex items-center justify-center rounded-full hover:bg-[#8F1837] hover:text-white pointer-events-auto",
        day_selected: "bg-[#8F1837] text-white hover:bg-[#8F1837] hover:text-white pointer-events-auto",
        day_today: "border border-gray-200",
        day_disabled: "text-gray-300 opacity-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => (
          <ChevronLeft className="h-4 w-4" {...props} />
        ),
        IconRight: ({ ...props }) => (
          <ChevronRight className="h-4 w-4" {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }