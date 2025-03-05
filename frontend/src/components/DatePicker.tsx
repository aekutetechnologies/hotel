"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PopoverProps } from "@radix-ui/react-popover"
import { useRouter, useSearchParams } from 'next/navigation'

interface DatePickerProps extends PopoverProps {
  onChange: (date: Date | undefined) => void
  defaultDate?: Date | undefined
}

export function DatePicker({ onChange, defaultDate }: DatePickerProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)

  const defaultDateFromProps = defaultDate
  const [date, setDate] = React.useState<Date | undefined>(defaultDateFromProps)

  const onSelect = React.useCallback((date: Date | undefined) => {
    setDate(date)
    setIsOpen(false)
    const params = new URLSearchParams(searchParams)

    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd')
      params.set('checkInDate', formattedDate)
      params.set('checkOutDate', formattedDate) // Assuming check-out is same as check-in for now
    } else {
      params.delete('checkInDate')
      params.delete('checkOutDate')
    }

    router.push(`/?${params.toString()}`, { scroll: false })
    onChange(date)
  }, [router, searchParams, setIsOpen, onChange])


  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal h-10 px-3 py-2", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={onSelect} initialFocus />
      </PopoverContent>
    </Popover>
  )
}

