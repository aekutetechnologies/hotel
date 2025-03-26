"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, RefreshCw, Home, Mail } from "lucide-react"
import { NewButton } from "@/components/ui/new-button"
import Image from "next/image"
import Link from "next/link"

interface ErrorPageProps {
  message?: string
  onRetry?: () => void
  showHomeButton?: boolean
}

export function ErrorPage({
  message = "Something went wrong. Please try again or contact our support team.",
  onRetry,
  showHomeButton = true
}: ErrorPageProps) {
  const [animateIcon, setAnimateIcon] = useState(false)

  // Trigger animation every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimateIcon(true)
      setTimeout(() => setAnimateIcon(false), 1000)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#b95372] via-[#A31C44] to-[#b95372] py-6">
          <div className="flex justify-center">
            <motion.div 
              animate={animateIcon ? { 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              } : {}}
              transition={{ duration: 0.5 }}
            >
              <AlertTriangle size={80} className="text-white" />
            </motion.div>
          </div>
        </div>
        
        <div className="p-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Hsquare Logo"
              width={180}
              height={60}
              priority
              className="h-12 w-auto"
            />
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Oops!</h1>
          <p className="text-center text-gray-600 mb-6">We're sorry, but an error occurred while loading this page. Please try again or contact our support team at help@hssquare.com.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
            {onRetry && (
              <NewButton 
                variant="default" 
                onClick={onRetry}
                className="flex items-center justify-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </NewButton>
            )}
            
            {showHomeButton && (
              <Link href="/" passHref>
                <NewButton 
                  variant="neutral"
                  className="flex items-center justify-center"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go to Home
                </NewButton>
              </Link>
            )}
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-center text-gray-500 text-sm">
              Need assistance? Contact our support team:
            </p>
            <a 
              href="mailto:help@hsquare.com" 
              className="flex items-center justify-center text-[#A31C44] mt-2 hover:underline"
            >
              <Mail className="w-4 h-4 mr-2" />
              help@hsquare.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 