"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

interface Frame {
  id: number
  image: string
  content: React.ReactNode
  defaultPos: { x: number; y: number; w: number; h: number }
  mediaSize?: number
  isHovered?: boolean
}

interface FrameComponentProps {
  image: string
  content: React.ReactNode
  width: number | string
  height: number | string
  className?: string
  mediaSize?: number
  isHovered: boolean
}

function FrameComponent({
  image,
  content,
  width,
  height,
  className = "",
  mediaSize = 1,
  isHovered,
}: FrameComponentProps) {
  return (
    <div
      className={`relative ${className} overflow-hidden rounded-xl`}
      style={{
        width,
        height,
        transition: "width 0.3s ease-in-out, height 0.3s ease-in-out",
      }}
    >
      <div className="relative w-full h-full overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            zIndex: 1,
            transition: "all 0.3s ease-in-out",
          }}
        >
          <div
            className="w-full h-full overflow-hidden"
            style={{
              transform: `scale(${isHovered ? 1.05 : mediaSize})`,
              transformOrigin: "center",
              transition: "transform 0.5s ease-in-out",
            }}
          >
            <Image
              className="w-full h-full object-cover transition-all duration-500"
              src={image || "/placeholder.svg"}
              alt="Property"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        </div>

        <div
          className="absolute inset-0 bg-black transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.6 : 0,
          }}
        />

        <div
          className="absolute bottom-0 left-0 right-0 p-4 z-10 transition-all duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? "translateY(0)" : "translateY(20px)",
          }}
        >
          {content}
        </div>
      </div>
    </div>
  )
}

interface DynamicFrameLayoutProps {
  frames: Frame[]
  className?: string
  hoverSize?: number
  gapSize?: number
}

export function DynamicFrameLayout({
  frames: initialFrames,
  className,
  hoverSize = 6,
  gapSize = 4,
}: DynamicFrameLayoutProps) {
  const [frames] = useState<Frame[]>(initialFrames)
  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null)

  const getRowSizes = () => {
    if (hovered === null) return "1fr 1fr 1fr"
    const { row } = hovered
    const nonHoveredSize = (12 - hoverSize) / 2
    return [0, 1, 2].map((r) => (r === row ? `${hoverSize}fr` : `${nonHoveredSize}fr`)).join(" ")
  }

  const getColSizes = () => {
    if (hovered === null) return "1fr 1fr 1fr"
    const { col } = hovered
    const nonHoveredSize = (12 - hoverSize) / 2
    return [0, 1, 2].map((c) => (c === col ? `${hoverSize}fr` : `${nonHoveredSize}fr`)).join(" ")
  }

  const getTransformOrigin = (x: number, y: number) => {
    const vertical = y === 0 ? "top" : y === 4 ? "center" : "bottom"
    const horizontal = x === 0 ? "left" : x === 4 ? "center" : "right"
    return `${vertical} ${horizontal}`
  }

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{
        display: "grid",
        gridTemplateRows: getRowSizes(),
        gridTemplateColumns: getColSizes(),
        gap: `${gapSize}px`,
        transition: "grid-template-rows 0.4s ease, grid-template-columns 0.4s ease",
      }}
    >
      {frames.map((frame) => {
        const row = Math.floor(frame.defaultPos.y / 4)
        const col = Math.floor(frame.defaultPos.x / 4)
        const transformOrigin = getTransformOrigin(frame.defaultPos.x, frame.defaultPos.y)

        return (
          <motion.div
            key={frame.id}
            className="relative"
            style={{
              transformOrigin,
              transition: "transform 0.4s ease",
            }}
            onMouseEnter={() => setHovered({ row, col })}
            onMouseLeave={() => setHovered(null)}
          >
            <FrameComponent
              image={frame.image}
              content={frame.content}
              width="100%"
              height="100%"
              className="absolute inset-0"
              mediaSize={frame.mediaSize || 1}
              isHovered={hovered?.row === row && hovered?.col === col}
            />
          </motion.div>
        )
      })}
    </div>
  )
}

