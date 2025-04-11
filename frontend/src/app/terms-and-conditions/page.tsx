"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import Footer from "@/components/Footer"
import { Header } from "@/components/Header"

export default function TermsAndConditionsPage() {
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
          <h1 className="text-4xl font-bold mb-8 text-[#A31C44]">Terms and Conditions</h1>
          
          <div className="max-w-4xl bg-white p-8 rounded-lg shadow-md">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-600 italic mb-6">
                Last Updated: July 15, 2023
              </p>
              
              <p className="mb-6">
                Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using the HSquare Living website 
                or any of our hotel and hostel properties operated by HSquare Living ("us", "we", or "our").
              </p>
              
              <p className="mb-6">
                Your access to and use of our services is conditioned on your acceptance of and compliance with these Terms. 
                These Terms apply to all visitors, users, and others who access or use our services.
              </p>
              
              <p className="mb-8">
                By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, 
                you may not access our services.
              </p>

              <h2 className="text-2xl font-bold mb-4 text-[#343F52]">1. Booking and Reservations</h2>
              <div className="mb-6 pl-4">
                <p className="mb-4">
                  1.1. All reservations are subject to availability and confirmation.
                </p>
                <p className="mb-4">
                  1.2. To confirm a reservation, a valid credit/debit card or advance payment may be required.
                </p>
                <p className="mb-4">
                  1.3. The guest making the reservation must be at least 18 years of age.
                </p>
                <p className="mb-4">
                  1.4. Special requests are subject to availability and cannot be guaranteed.
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-[#343F52]">2. Check-in and Check-out</h2>
              <div className="mb-6 pl-4">
                <p className="mb-4">
                  2.1. Standard check-in time is 2:00 PM and check-out time is 11:00 AM local time, unless otherwise specified for specific properties.
                </p>
                <p className="mb-4">
                  2.2. Early check-in and late check-out are subject to availability and may incur additional charges.
                </p>
                <p className="mb-4">
                  2.3. Guests are required to present valid government-issued identification at check-in.
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-[#343F52]">3. Payment and Fees</h2>
              <div className="mb-6 pl-4">
                <p className="mb-4">
                  3.1. All rates are quoted in Indian Rupees (INR) unless otherwise specified.
                </p>
                <p className="mb-4">
                  3.2. Additional taxes and service charges may apply as per local regulations.
                </p>
                <p className="mb-4">
                  3.3. Any damages to property will be charged to the guest's account.
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-[#343F52]">4. Cancellation Policy</h2>
              <div className="mb-6 pl-4">
                <p className="mb-4">
                  4.1. Cancellation policies vary by property and rate plan. The specific policy will be communicated at the time of booking.
                </p>
                <p className="mb-4">
                  4.2. Please refer to our Refund Policy for detailed information on cancellations and refunds.
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-[#343F52]">5. Guest Conduct</h2>
              <div className="mb-6 pl-4">
                <p className="mb-4">
                  5.1. Guests are expected to conduct themselves in a respectful manner and to consider the comfort of other guests.
                </p>
                <p className="mb-4">
                  5.2. HSquare Living reserves the right to refuse service to anyone who violates our policies or engages in disruptive behavior.
                </p>
                <p className="mb-4">
                  5.3. Smoking is strictly prohibited in non-smoking rooms and designated non-smoking areas.
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-[#343F52]">6. Limitation of Liability</h2>
              <div className="mb-6 pl-4">
                <p className="mb-4">
                  6.1. HSquare Living is not responsible for any loss, damage, or theft of guest property on our premises.
                </p>
                <p className="mb-4">
                  6.2. Guests are advised to use in-room safes where available and take appropriate precautions with their valuables.
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-[#343F52]">7. Website Usage</h2>
              <div className="mb-6 pl-4">
                <p className="mb-4">
                  7.1. The content on our website is for general information purposes only.
                </p>
                <p className="mb-4">
                  7.2. We strive to keep the information up to date and accurate, but we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information.
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-[#343F52]">8. Modifications</h2>
              <div className="mb-6 pl-4">
                <p className="mb-4">
                  8.1. We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website.
                </p>
                <p className="mb-4">
                  8.2. Continued use of our services after any modifications constitutes your acceptance of the revised Terms.
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-[#343F52]">9. Governing Law</h2>
              <div className="mb-6 pl-4">
                <p className="mb-4">
                  9.1. These Terms shall be governed by and construed in accordance with the laws of India.
                </p>
                <p className="mb-4">
                  9.2. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra, India.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mt-8">
                <h2 className="text-2xl font-bold mb-4 text-[#343F52]">Contact Information</h2>
                <p className="mb-4">
                  If you have any questions about these Terms and Conditions, please contact us:
                </p>
                <ul className="space-y-2">
                  <li>Email: <a href="mailto:booking@hsquareliving.com" className="text-[#A31C44] hover:underline">booking@hsquareliving.com</a></li>
                  <li>Phone: <a href="tel:+919090151524" className="text-[#A31C44] hover:underline">+91 9090151524</a></li>
                  <li>Address: 4R8P+FHV, Juhu Galli, above Tata Motors Showroom, Mahavi Darshan, Dhangar wadi, Andheri West, Mumbai, Maharashtra 400049</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <Footer sectionType="hotels" />
    </div>
  )
} 