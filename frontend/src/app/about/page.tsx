'use client'

import { useState, useEffect } from 'react'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { LoginDialog } from '@/components/LoginDialog'

const ABOUT_TEXT = "At HSquare Living, we are more than just a team; we are a closely-knit family of handpicked individuals, each possessing exceptional expertise and a shared passion for excellence. Discover luxury and comfort with our carefully curated selection of premium hotels across India."

export default function AboutPage() {
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
    window.location.href = "/"
  }

  const setShowDetailSection = (section: string) => {
    window.location.href = `/home?type=${section}`
  }

  const handleNavModalChange = (isOpen: boolean) => {
    setIsNavModalOpen(isOpen)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
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

      <main className="flex-1">
        <section className="bg-gradient-to-br from-[#A31C44] via-[#b11e43] to-[#8f1836] text-white">
          <div className="container mx-auto px-4 py-16 md:px-6 lg:px-8">
            <div className="max-w-3xl space-y-6">
              <p className="text-sm uppercase tracking-[0.35em] text-white/70">
                About HSquare Living
              </p>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                Crafting exceptional stays for modern travellers
              </h1>
              <p className="text-lg leading-relaxed text-white/80">
                {ABOUT_TEXT}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">
                  Our story
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Founded with a vision to elevate hospitality experiences, HSquare Living blends boutique design with warm, personalised service. Every space we curate is thoughtfully crafted to help guests feel inspired, connected, and completely at ease.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  From premium hotel escapes to vibrant hostel communities, we build destinations that make every stay memorable. Our team is committed to innovation, detail, and a relentless pursuit of excellence across every touchpoint.
                </p>
              </div>

              <div className="space-y-6">
                <div className="rounded-xl bg-gray-900 p-8 text-white shadow-lg">
                  <h3 className="text-2xl font-semibold mb-4">
                    What sets us apart
                  </h3>
                  <ul className="space-y-4 text-sm leading-relaxed text-gray-200">
                    <li className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#F4B914]" />
                      <span>
                        <strong>Curated Experiences:</strong> Each property is hand-selected for style, comfort, and a genuine sense of place.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#F4B914]" />
                      <span>
                        <strong>People First:</strong> We believe hospitality begins with talent. Our people-first culture empowers teams to delight guests at every step.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#F4B914]" />
                      <span>
                        <strong>Adaptive Design:</strong> Spaces that cater to leisure, business, and long-stay travellers with equal grace.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-100 py-16">
          <div className="container mx-auto grid gap-10 px-4 md:grid-cols-3 md:px-6 lg:px-8">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-[#A31C44]">Our Mission</h3>
              <p className="mt-4 text-gray-700 leading-relaxed">
                To design elevated stays that honour local culture and modern comforts while offering guests a warm, personalised experience.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-[#A31C44]">Our Vision</h3>
              <p className="mt-4 text-gray-700 leading-relaxed">
                To be India&apos;s most trusted hospitality partner—delivering lifestyle-driven hotels and hostels that feel like home across every city.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-[#A31C44]">Our Promise</h3>
              <p className="mt-4 text-gray-700 leading-relaxed">
                Consistent quality, thoughtful amenities, and an unwavering commitment to guest satisfaction—wherever the journey leads.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer sectionType="hotels" />
      
      <LoginDialog 
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  )
}

