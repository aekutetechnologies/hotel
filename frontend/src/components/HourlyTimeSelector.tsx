"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HourlyTimeSelectorProps {
  onChange: (times: { checkInTime: string; checkOutTime: string }) => void
}

export function HourlyTimeSelector({ onChange }: HourlyTimeSelectorProps) {
  const defaultCheckInTime = "12"
  const defaultCheckOutTime = "14"

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const formatTime = (hour: number) => {
    return hour === 0 ? "12:00 AM" : hour < 12 ? `${hour}:00 AM` : hour === 12 ? "12:00 PM" : `${hour - 12}:00 PM`
  }

  const onCheckInTimeChange = (value: string) => {
    onChange({ checkInTime: value, checkOutTime: defaultCheckOutTime })
  }

  const onCheckOutTimeChange = (value: string) => {
    onChange({ checkInTime: defaultCheckInTime, checkOutTime: value })
  }

  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">Time</label>
      <div className="flex">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Select defaultValue={defaultCheckInTime} onValueChange={onCheckInTimeChange}>
              <SelectTrigger className="w-full h-10 ">
                <SelectValue placeholder="Check-in" />
              </SelectTrigger>
              <SelectContent>
                {hours.map((hour) => (
                  <SelectItem key={`in-${hour}`} value={hour.toString()}>
                    {formatTime(hour)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select defaultValue={defaultCheckOutTime} onValueChange={onCheckOutTimeChange}>
              <SelectTrigger className="w-full h-10 ">
                <SelectValue placeholder="Check-out" />
              </SelectTrigger>
              <SelectContent>
                {hours.map((hour) => (
                  <SelectItem key={`out-${hour}`} value={hour.toString()}>
                    {formatTime(hour)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}

