"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Building, Home, Clock, CalendarDays, CreditCard } from "lucide-react"
import Link from "next/link"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import { LoginDialog } from '@/components/LoginDialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function RefundPolicyPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const [isNavModalOpen, setIsNavModalOpen] = useState(false)

  useEffect(() => {
    const storedName = localStorage.getItem("name")
    const storedAccessToken = localStorage.getItem("accessToken")
    
    if (storedName && storedAccessToken) {
      setIsLoggedIn(true)
      setUserName(storedName)
    }
  }, [])

  const handleLoginClick = () => {
    setIsLoginDialogOpen(true)
  }

  const handleLoginSuccess = (name: string) => {
    setIsLoggedIn(true)
    setUserName(name)
    setIsLoginDialogOpen(false)
  }

  const handleLogout = () => {
    localStorage.clear()
    setIsLoggedIn(false)
    setUserName("")
    router.push("/")
  }

  const setShowDetailSection = (section: string) => {
    window.location.href = `/home?type=${section}`
  }

  const handleNavModalChange = (isOpen: boolean) => {
    setIsNavModalOpen(isOpen)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* header */}
      <Navbar
        isLoggedIn={isLoggedIn}
        userName={userName}
        handleLogout={handleLogout}
        handleLoginClick={handleLoginClick}
        setShowDetailSection={setShowDetailSection}
        isClosed={isClosed}
        currentSection="hotels"
        onNavModalChange={handleNavModalChange}
      />
      
      {/* Main content */}
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Link href="/home?section=hotels" className="flex items-center text-gray-600 hover:text-[#A31C44] mb-6">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl font-bold mb-4 text-[#A31C44]">Cancellation & Refund Policy</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl">
            At HSquare, we understand that plans can change. Our refund policies are designed to be fair and transparent,
            while providing flexibility based on your booking type.
          </p>
          
          <Tabs defaultValue="hotel" className="max-w-4xl">
            <TabsList className="mb-6">
              <TabsTrigger value="hotel" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Hotel Bookings
              </TabsTrigger>
              <TabsTrigger value="hostel" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Hostel Bookings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="hotel" className="bg-white p-8 rounded-lg shadow-md">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-[#A31C44] flex items-center">
                  <Building className="h-5 w-5 mr-2 text-[#A31C44]" />
                  Hotel Cancellation Policy
                </h2>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                      <h3 className="font-semibold text-lg mb-3 flex items-center text-[#A31C44]">
                        <CalendarDays className="h-4 w-4 mr-2 text-[#A31C44]" />
                        Standard Bookings
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-green-500 mr-2 font-bold">•</span>
                          <span>7+ days before check-in: <span className="font-medium">Full refund</span> (minus 5% booking fee)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-yellow-500 mr-2 font-bold">•</span>
                          <span>4-6 days before: <span className="font-medium">90% refund</span></span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-orange-500 mr-2 font-bold">•</span>
                          <span>2-3 days before: <span className="font-medium">50% refund</span></span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-red-500 mr-2 font-bold">•</span>
                          <span>Less than 48 hours: <span className="font-medium">No refund</span></span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                      <h3 className="font-semibold text-lg mb-3 flex items-center text-[#A31C44]">
                        <Clock className="h-4 w-4 mr-2 text-[#A31C44]" />
                        Hourly Bookings
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-green-500 mr-2 font-bold">•</span>
                          <span>12+ hours before: <span className="font-medium">Full refund</span></span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-yellow-500 mr-2 font-bold">•</span>
                          <span>6-12 hours before: <span className="font-medium">50% refund</span></span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-red-500 mr-2 font-bold">•</span>
                          <span>Less than 6 hours: <span className="font-medium">No refund</span></span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-blue-500 mr-2 font-bold">•</span>
                          <span>Rescheduling once with 6+ hours notice: <span className="font-medium">No fee</span></span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                      <h3 className="font-semibold text-lg mb-3 flex items-center text-[#A31C44]">
                        <CreditCard className="h-4 w-4 mr-2 text-[#A31C44]" />
                        Group Bookings (5+ rooms)
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-green-500 mr-2 font-bold">•</span>
                          <span>14+ days before: <span className="font-medium">Full refund</span></span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-yellow-500 mr-2 font-bold">•</span>
                          <span>7-13 days before: <span className="font-medium">75% refund</span></span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-orange-500 mr-2 font-bold">•</span>
                          <span>3-6 days before: <span className="font-medium">50% refund</span></span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-red-500 mr-2 font-bold">•</span>
                          <span>Less than 3 days: <span className="font-medium">No refund</span></span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6 mt-6">
                    <h3 className="font-semibold text-lg mb-3">Premium & Luxury Hotels</h3>
                    <p className="text-gray-600 mb-3">
                      For premium and luxury category hotels, a non-refundable deposit of 25% may be required at the time of booking.
                      This deposit is non-refundable regardless of when the cancellation is made.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-[#A31C44]">No-Show & Early Check-out</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                    <p className="font-medium mb-2">No-Show:</p>
                    <p className="text-gray-600 mb-2">
                      If you do not check in on your scheduled arrival date without prior notification,
                      you will be considered a "no-show" and charged for the first night (for standard bookings)
                      or the full booking amount (for non-refundable rates).
                    </p>
                    
                    <p className="font-medium mt-4 mb-2">Early Check-out:</p>
                    <p className="text-gray-600">
                      If you check out earlier than your scheduled departure date, you may be charged for the
                      entire original reservation period or be subject to an early departure fee.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="hostel" className="bg-white p-8 rounded-lg shadow-md">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-[#A31C44] flex items-center">
                  <Home className="h-5 w-5 mr-2 text-[#A31C44]" />
                  Hostel Cancellation Policy
                </h2>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                      <h3 className="font-semibold text-lg mb-3 flex items-center text-[#A31C44]">
                        <CalendarDays className="h-4 w-4 mr-2 text-[#A31C44]" />
                        Short-term Stays (1-14 days)
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-green-500 mr-2 font-bold">•</span>
                          <span>3+ days before check-in: <span className="font-medium">Full refund</span></span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-yellow-500 mr-2 font-bold">•</span>
                          <span>1-2 days before: <span className="font-medium">75% refund</span></span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-orange-500 mr-2 font-bold">•</span>
                          <span>Within 24 hours: <span className="font-medium">50% refund</span></span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-blue-500 mr-2 font-bold">•</span>
                          <span>Date changes: <span className="font-medium">Free up to 48 hours before</span></span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                      <h3 className="font-semibold text-lg mb-3 flex items-center text-[#A31C44]">
                        <CalendarDays className="h-4 w-4 mr-2 text-[#A31C44]" />
                        Monthly Stays (15+ days)
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-green-500 mr-2 font-bold">•</span>
                          <span>14+ days before: <span className="font-medium">Full refund</span></span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-yellow-500 mr-2 font-bold">•</span>
                          <span>7-13 days before: <span className="font-medium">80% refund</span></span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-orange-500 mr-2 font-bold">•</span>
                          <span>1-6 days before: <span className="font-medium">50% refund</span></span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-red-500 mr-2 font-bold">•</span>
                          <span>After check-in: <span className="font-medium">30-day notice required</span> for move-out</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                      <h3 className="font-semibold text-lg mb-3 flex items-center text-[#A31C44]">
                        <CreditCard className="h-4 w-4 mr-2 text-[#A31C44]" />
                        Deposits & Security
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-green-500 mr-2 font-bold">•</span>
                          <span>Security deposit: <span className="font-medium">Fully refundable</span> after inspection</span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-yellow-500 mr-2 font-bold">•</span>
                          <span>Processing time: <span className="font-medium">7-10 business days</span></span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-red-500 mr-2 font-bold">•</span>
                          <span>Deductions: <span className="font-medium">For damages or violations</span> of house rules</span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-blue-500 mr-2 font-bold">•</span>
                          <span>Monthly booking fee: <span className="font-medium">Non-refundable</span></span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6 mt-6">
                    <h3 className="font-semibold text-lg mb-3">Early Termination (Monthly Stays)</h3>
                    <p className="text-gray-600 mb-3">
                      For early termination of monthly stays, a 30-day written notice is required. The following conditions apply:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      <li>First month's payment is non-refundable once checked in</li>
                      <li>Rent for remaining days will be refunded minus a 15% service fee</li>
                      <li>Security deposit will be refunded after inspection within 7-10 business days</li>
                      <li>Booking fee is non-refundable regardless of the length of stay</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-[#A31C44]">Hostel Code of Conduct</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                    <p className="text-gray-600 mb-3">
                      All guests must adhere to hostel rules and code of conduct. Violations may result in:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      <li>Immediate termination of stay without refund</li>
                      <li>Forfeiture of security deposit</li>
                      <li>Possible ban from future bookings at any HSquare property</li>
                    </ul>
                    <p className="text-gray-600 mt-3">
                      A complete copy of the hostel rules will be provided at check-in and is available on request.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="max-w-4xl bg-white p-8 rounded-lg shadow-md mt-8">
            <h2 className="text-2xl font-bold mb-4 text-[#A31C44]">Special Circumstances</h2>
            <p className="mb-4">
              In case of unexpected events such as medical emergencies, family emergencies, or natural disasters affecting your travel plans, 
              please contact our customer support team immediately. We may consider refunds on a case-by-case basis with appropriate documentation.
            </p>
            
            <div className="my-6">
              <h3 className="text-xl font-bold mb-3 text-[#A31C44]">Force Majeure</h3>
              <p className="mb-4">
                In the event of force majeure circumstances (such as natural disasters, pandemics, government travel restrictions, etc.) 
                that prevent us from providing accommodation or you from traveling, we may offer:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Free rebooking for alternative dates within 12 months</li>
                <li>Credit vouchers valid for 24 months</li>
                <li>Full or partial refunds depending on the specific circumstances</li>
              </ul>
            </div>
            
            <div className="my-6">
              <h3 className="text-xl font-bold mb-3 text-[#A31C44]">Refund Processing</h3>
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
              <p>Last Updated: August 1, 2023</p>
              <p>HSquare Living reserves the right to modify this refund policy at any time. Any changes will be effective immediately upon posting on our website.</p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <Footer sectionType="hotels" />
      
      <LoginDialog 
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  )
} 