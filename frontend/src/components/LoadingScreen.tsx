"use client"

import Image from "next/image"
import { motion } from "framer-motion"

interface LoadingScreenProps {
  progress: number
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <Image
        src="/logo.png"
        alt="Hsquare Logo"
        width={280}  // Larger size for loading screen
        height={80}  // Maintaining aspect ratio
        className="mb-4"
        priority
      />
      <div className="w-64 h-2 bg-gray-800 rounded-full mt-8 overflow-hidden">
        <motion.div
          className="h-full"
          style={{ backgroundColor: 'rgb(138 24 57 / var(--tw-bg-opacity, 1))' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="text-black mt-4 text-lg" style={{ color: 'rgb(138 24 57 / var(--tw-bg-opacity, 1))' }}>
        {progress < 100 ? "Loading Assets..." : "Welcome to Hsquare"}
      </div>
    </motion.div>
  )
} 