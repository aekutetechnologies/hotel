"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import { toast } from "react-toastify"

export default function CareersPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    resumeFile: null as File | null,
    message: ""
  })

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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({
      ...prev,
      resumeFile: file
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.position || !formData.resumeFile) {
      toast.error("Please fill all required fields and upload your resume")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Here you would typically send the form data to your API
      // For now, we'll just simulate a submission
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      toast.success("Your application has been submitted successfully!")
      
      // Reset the form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        position: "",
        experience: "",
        resumeFile: null,
        message: ""
      })
      
      // Reset the file input
      const fileInput = document.getElementById("resumeFile") as HTMLInputElement
      if (fileInput) fileInput.value = ""
      
    } catch (error) {
      toast.error("Failed to submit your application. Please try again later.")
      console.error("Error submitting application:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <div className="w-full relative">
        <div className="flex justify-between items-center px-4 md:px-6 py-3 bg-white shadow-sm max-w-[100vw] overflow-x-hidden">
          <div className="flex-1">
            <Navbar
              isLoggedIn={isLoggedIn}
              userName={userName}
              handleLogout={handleLogout}
              handleLoginClick={() => {}}
              setShowDetailSection={() => {}}
              isClosed={false}
              currentSection="hotel"
            />
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-[#A31C44]">Careers at HSquare Living</h1>
          
          <div className="max-w-4xl">
            <p className="text-lg mb-8">
              Join our passionate team at HSquare Living and be a part of a fast-growing hospitality brand that's 
              transforming the hotel and hostel experience across India. We're looking for talented individuals who 
              are dedicated to creating exceptional guest experiences.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 text-[#343F52]">Why Work With Us?</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-[#A31C44]">Growth Opportunities</h3>
                <p>As a rapidly expanding brand, we offer numerous opportunities for career advancement and professional development.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-[#A31C44]">Collaborative Environment</h3>
                <p>Work alongside passionate professionals in a supportive culture that encourages innovation and teamwork.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-[#A31C44]">Competitive Benefits</h3>
                <p>We offer competitive salaries, performance bonuses, and health benefits to ensure our team's wellbeing.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-[#A31C44]">Industry Experience</h3>
                <p>Gain valuable experience in the hospitality industry with exposure to both hotel and hostel operations.</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md mb-12">
              <h2 className="text-2xl font-bold mb-6 text-[#343F52]">Submit Your Application</h2>
              <p className="mb-6">
                We're always looking for talented individuals to join our team. Please fill out the form below to submit your application.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A31C44] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A31C44] focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A31C44] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                      Position Interested In <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A31C44] focus:border-transparent"
                    >
                      <option value="">Select a position</option>
                      <option value="Front Desk">Front Desk</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Management">Management</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Finance">Finance</option>
                      <option value="IT">IT</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A31C44] focus:border-transparent"
                  >
                    <option value="">Select experience</option>
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="resumeFile" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Resume <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    id="resumeFile"
                    name="resumeFile"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A31C44] focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, DOC, DOCX (Max 5MB)</p>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Information
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A31C44] focus:border-transparent"
                    placeholder="Tell us about yourself, why you're interested in working with us, or any other relevant information."
                  ></textarea>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-3 bg-[#A31C44] hover:bg-[#8a1838] text-white font-semibold rounded-md transition-colors ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="bg-gradient-to-r from-[#A31C44] to-[#FF3A5E] p-8 rounded-lg text-white mb-8">
              <h2 className="text-2xl font-bold mb-4">Have Questions?</h2>
              <p className="mb-6">If you have any questions about careers at HSquare Living, please feel free to reach out to our team.</p>
              <a href="mailto:careers@hsquareliving.com" className="bg-white text-[#A31C44] hover:bg-gray-100 font-bold py-2 px-6 rounded inline-block transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <Footer sectionType="hotels" />
    </div>
  )
} 