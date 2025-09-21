"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import Footer from "@/components/Footer"
import { Header } from "@/components/Header"

export default function RefundPolicyPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    const name = localStorage.getItem("name")
    
    if (name) {
      setUserName(name)
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    setIsLoggedIn(false)
    router.push("/")
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Header />
      
      {/* Main content */}
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-[#A31C44]">Refund Policy</h1>
          
          <div className="max-w-4xl bg-white p-8 rounded-lg shadow-md">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#A31C44]">Booking Cancellations</h2>
              <p className="mb-4">
                At HSquare Living, we understand that plans can change. Our refund policy is designed to be fair and transparent, 
                while also protecting our business operations. Please review our cancellation and refund terms below:
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="border-l-4 border-[#A31C44] pl-4">
                  <h3 className="font-semibold text-lg mb-2">Cancellation Timeline</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Cancellations made 7 days or more before check-in: Full refund minus booking fee (5% of the total amount)</li>
                    <li>Cancellations made 3-6 days before check-in: 70% refund of the total amount</li>
                    <li>Cancellations made 1-2 days before check-in: 50% refund of the total amount</li>
                    <li>Cancellations made less than 24 hours before check-in: No refund</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#A31C44]">No-Show Policy</h2>
              <p className="mb-4">
                If you do not check in on your scheduled arrival date without prior notification, you will be considered a "no-show" 
                and no refund will be provided for your booking.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#A31C44]">Early Departure</h2>
              <p className="mb-4">
                If you decide to shorten your stay after check-in, we regret to inform that no refund will be provided for the unused portion of your booking.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#A31C44]">Special Circumstances</h2>
              <p className="mb-4">
                In case of unexpected events such as medical emergencies, family emergencies, or natural disasters affecting your travel plans, 
                please contact our customer support team immediately. We may consider refunds on a case-by-case basis with appropriate documentation.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#A31C44]">Refund Processing</h2>
              <p className="mb-4">
                All approved refunds will be processed within 7-10 business days. The refund will be credited back to the original payment method used during booking.
              </p>
              <p className="mb-4">
                Please note that bank processing times may vary, and it may take an additional 2-5 business days for the refund to reflect in your account.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-[#A31C44]">Contact Information</h2>
              <p className="mb-4">
                For any questions or concerns regarding our refund policy or to request a cancellation, please contact our customer support team:
              </p>
              <ul className="space-y-2">
                <li>Email: <a href="mailto:booking@hsquareliving.com" className="text-[#A31C44] hover:underline">booking@hsquareliving.com</a></li>
                <li>Phone: <a href="tel:+917400455087" className="text-[#A31C44] hover:underline">+91 7400455087</a></li>
              </ul>
            </div>
            
            <div className="mt-8 text-sm text-gray-600">
              <p>Last Updated: July 15, 2023</p>
              <p>HSquare Living reserves the right to modify this refund policy at any time. Any changes will be effective immediately upon posting on our website.</p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <Footer sectionType="hotels" />
    </div>
  )
} 