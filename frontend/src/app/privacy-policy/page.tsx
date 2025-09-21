"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import Footer from "@/components/Footer"
import { Header } from "@/components/Header"

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold mb-8 text-[#A31C44]">Privacy Policy</h1>
          
          <div className="max-w-4xl bg-white p-8 rounded-lg shadow-md">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-600 italic mb-6">
                Last Updated: July 15, 2023
              </p>
              
              <p className="mb-6">
                At HSquare Living, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
                and safeguard your information when you visit our website or stay at any of our properties.
              </p>
              
              <p className="mb-8">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
                please do not access our website or use our services.
              </p>

              <h2 className="text-2xl font-bold mb-4 text-[#A31C44]">1. Information We Collect</h2>
              <div className="mb-8 pl-4">
                <h3 className="text-xl font-semibold mb-3 text-[#A31C44]">1.1. Personal Information</h3>
                <p className="mb-4">
                  We may collect personal information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                  <li>Register on our website</li>
                  <li>Make a booking or reservation</li>
                  <li>Sign up for our newsletter</li>
                  <li>Participate in promotions or surveys</li>
                  <li>Contact our customer service</li>
                </ul>
                <p className="mb-4">
                  This information may include:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                  <li>Name, email address, phone number, and postal address</li>
                  <li>Date of birth</li>
                  <li>Payment information</li>
                  <li>Government-issued identification details</li>
                  <li>Travel itinerary and preferences</li>
                </ul>
                
                <h3 className="text-xl font-semibold mb-3 text-[#A31C44]">1.2. Automatically Collected Information</h3>
                <p className="mb-4">
                  When you visit our website, we may automatically collect certain information about your device, including:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Pages visited and time spent on those pages</li>
                  <li>Referral sources</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-[#A31C44]">2. How We Use Your Information</h2>
              <div className="mb-8 pl-4">
                <p className="mb-4">
                  We may use the information we collect for various purposes, including to:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                  <li>Process and manage your bookings and reservations</li>
                  <li>Provide customer service and support</li>
                  <li>Send you promotional communications and newsletters (with your consent)</li>
                  <li>Improve our website, services, and customer experience</li>
                  <li>Conduct research and analysis</li>
                  <li>Comply with legal obligations</li>
                  <li>Prevent fraudulent transactions and monitor against theft</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-[#A31C44]">3. Sharing of Your Information</h2>
              <div className="mb-8 pl-4">
                <p className="mb-4">
                  We may share your information with:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                  <li>Service providers who perform services on our behalf (payment processors, IT service providers)</li>
                  <li>Business partners with whom we jointly offer products or services</li>
                  <li>Law enforcement agencies, government authorities, or other third parties when required by law</li>
                </ul>
                <p className="mb-4">
                  We do not sell, rent, or trade your personal information to third parties for marketing purposes without your consent.
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-[#A31C44]">4. Security of Your Information</h2>
              <div className="mb-8 pl-4">
                <p className="mb-4">
                  We use administrative, technical, and physical security measures to protect your personal information. 
                  While we have taken reasonable steps to secure the information you provide to us, please be aware that 
                  no security measures are perfect or impenetrable, and we cannot guarantee the security of your information.
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-[#A31C44]">5. Cookies and Tracking Technologies</h2>
              <div className="mb-8 pl-4">
                <p className="mb-4">
                  We use cookies and similar tracking technologies to track activity on our website and hold certain information. 
                  Cookies are files with a small amount of data that may include an anonymous unique identifier. 
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-[#A31C44]">6. Your Rights</h2>
              <div className="mb-8 pl-4">
                <p className="mb-4">
                  Depending on your location, you may have certain rights regarding your personal information, including:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                  <li>Right to access the personal information we hold about you</li>
                  <li>Right to request correction of inaccurate information</li>
                  <li>Right to request deletion of your information</li>
                  <li>Right to opt-out of marketing communications</li>
                  <li>Right to lodge a complaint with a supervisory authority</li>
                </ul>
                <p className="mb-4">
                  To exercise these rights, please contact us using the information provided at the end of this policy.
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-[#A31C44]">7. Children's Privacy</h2>
              <div className="mb-8 pl-4">
                <p className="mb-4">
                  Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information 
                  from children. If you are a parent or guardian and believe that your child has provided us with personal information, 
                  please contact us immediately.
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-[#A31C44]">8. Changes to This Privacy Policy</h2>
              <div className="mb-8 pl-4">
                <p className="mb-4">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
                  on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mt-8">
                <h2 className="text-2xl font-bold mb-4 text-[#A31C44]">Contact Information</h2>
                <p className="mb-4">
                  If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
                </p>
                <ul className="space-y-2">
                  <li>Email: <a href="mailto:booking@hsquareliving.com" className="text-[#A31C44] hover:underline">booking@hsquareliving.com</a></li>
                  <li>Phone: <a href="tel:+917400455087" className="text-[#A31C44] hover:underline">+91 7400455087</a></li>
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