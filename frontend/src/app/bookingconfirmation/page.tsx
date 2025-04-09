'use client';

import { Header } from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, CalendarDays, Home, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"

export default function BookingConfirmationPage() {
  const router = useRouter();

  useEffect(() => {
    // You can add any logic here that should run when the component mounts,
    // such as clearing any booking-related state or local storage.
  }, []);

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="flex justify-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 10,
              delay: 0.2 
            }}
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-14 h-14 text-green-600" />
            </div>
          </motion.div>
          
          <motion.h2 
            className="text-3xl font-bold mb-4 text-center text-green-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Booking Confirmed!
          </motion.h2>
          
          <motion.p 
            className="mb-8 text-gray-700 text-center text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Thank you for your booking. Your reservation has been successfully confirmed.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="mb-8 bg-white shadow-md">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <CalendarDays className="h-5 w-5 text-[#B11E43]" />
                    <p className="text-gray-700">Your booking details have been sent to your email address.</p>
                  </div>
                  
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <Home className="h-5 w-5 text-[#B11E43]" />
                    <p className="text-gray-700">You can view your booking details in the <Link href="/booking" className="text-[#B11E43] font-medium hover:underline">My Bookings</Link> section.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div 
            className="flex justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link href="/booking">
              <Button variant="neutral" size="lg" className="border-[#B11E43] text-[#B11E43] hover:bg-[#B11E43] hover:text-white">
                View My Bookings
              </Button>
            </Link>
            
            <Button 
              variant="default" 
              size="lg" 
              onClick={handleGoHome}
              className="bg-[#B11E43] hover:bg-[#8f1836] text-white"
            >
              Return to Homepage <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      </main>
      <Footer sectionType="hotels" />
    </div>
  )
}

