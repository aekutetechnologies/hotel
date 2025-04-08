"use client"
import { useScroll, useTransform, motion } from "framer-motion"
import type React from "react"
import { useEffect, useRef, useState } from "react"

interface TimelineEntry {
  year: string
  title: string
  description: string
  content: React.ReactNode
}

interface TimelineProps {
  data: TimelineEntry[]
  theme?: "hotel" | "hostel"
}

export const Timeline = ({ data, theme = "hotel" }: TimelineProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (ref.current) {
      // Get the last item in the timeline
      const items = ref.current.querySelectorAll(".flex.justify-start")
      if (items.length > 0) {
        const lastItem = items[items.length - 1]
        const lastItemRect = lastItem.getBoundingClientRect()
        const refRect = ref.current.getBoundingClientRect()

        // Calculate height up to the last item plus some padding
        const calculatedHeight = lastItemRect.bottom - refRect.top + 40
        setHeight(calculatedHeight)
      } else {
        const rect = ref.current.getBoundingClientRect()
        setHeight(rect.height)
      }
    }
  }, [ref])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  })

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height])
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1])

  // Define theme colors
  const lineGradient =
    theme === "hotel"
      ? "bg-gradient-to-t from-[#A31C44] via-[#7A1533] to-transparent"
      : "bg-gradient-to-t from-[#2A2B2E] via-[#1A1B1E] to-transparent"

  // Define theme colors for the background line
  const bgLineColor = theme === "hotel" ? "bg-[#A31C44]/10" : "bg-[#2A2B2E]/10"
  
  // Text color based on theme
  const textColor = theme === "hotel" ? "text-[#A31C44]" : "text-[#2A2B2E]"

  return (
    <div className="w-full bg-white dark:bg-neutral-950 px-4 md:px-10" ref={containerRef}>
      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start pt-20 md:pt-40 gap-4 md:gap-10">
            <div className="sticky flex flex-row z-40 items-start top-20 md:top-40 self-start">
              <div className="h-10 w-10 relative rounded-full bg-white dark:bg-black flex items-center justify-center">
                <div
                  className={`h-4 w-4 rounded-full ${theme === "hotel" ? "bg-[#A31C44]/20 border-[#A31C44]" : "bg-[#2A2B2E]/20 border-[#2A2B2E]"} border p-2`}
                />
              </div>
              <div className="pl-4 md:pl-6">
                <h3
                  className={`text-2xl md:text-4xl font-bold ${textColor}`}
                >
                  {item.year}
                </h3>
                <p className="text-sm text-neutral-400 dark:text-neutral-600 mt-1">{item.title}</p>
              </div>
            </div>

            <div className="relative pl-4 w-full">
              <p className="text-neutral-800 dark:text-neutral-200 text-sm mb-8">
                {item.description}
              </p>
              {item.content}
            </div>
          </div>
        ))}

        {/* Background line - static */}
        <div
          style={{
            height: height + "px",
            maxHeight: `calc(100% - 80px)`,
          }}
          className={`absolute left-5 md:left-8 top-0 overflow-hidden w-[4px] ${bgLineColor}`}
        />

        {/* Animated progress line */}
        <div
          style={{
            height: height + "px",
            maxHeight: `calc(100% - 80px)`,
          }}
          className="absolute left-5 md:left-8 top-0 overflow-hidden w-[4px]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
              maxHeight: "100%",
            }}
            className={`absolute inset-x-0 top-0 w-[4px] ${lineGradient} from-[0%] via-[10%] rounded-full shadow-[0_0_8px_rgba(0,0,0,0.3)] shadow-current`}
          />
        </div>

        {/* Pulsing dot at the current progress point */}
        <motion.div
          style={{
            top: heightTransform,
            opacity: opacityTransform,
          }}
          className={`absolute left-5 md:left-8 w-[12px] h-[12px] -ml-[4px] rounded-full ${theme === "hotel" ? "bg-[#A31C44]" : "bg-[#2A2B2E]"}`}
        >
          <span
            className={`absolute inset-0 rounded-full ${theme === "hotel" ? "bg-[#A31C44]" : "bg-[#2A2B2E]"} animate-ping opacity-75`}
          ></span>
        </motion.div>
      </div>
    </div>
  )
}

