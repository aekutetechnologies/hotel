import Link from 'next/link'
import { Facebook, Twitter, Instagram, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-cyan-100 to-pink-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <img
              src="/logo.png"
              alt="hsquare"
              className="mb-4"
            />
            <p className="text-gray-600 mb-4">
              At HSquare Living, we are more than just a team; we are a closely-knit family of handpicked individuals,
              each possessing exceptional expertise and a shared passion for excellence. With unwavering ambition
              and a commitment to innovation, we are a dynamic force that...
              <Link href="#" className="text-[#B11E43]">Read More</Link>
            </p>
            <div className="flex gap-4 mb-4">
              <Link href="#" className="bg-[#B11E43] text-white p-2 rounded-full hover:bg-[#8f1836]">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="bg-[#B11E43] text-white p-2 rounded-full hover:bg-[#8f1836]">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="bg-[#B11E43] text-white p-2 rounded-full hover:bg-[#8f1836]">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="bg-[#B11E43] text-white p-2 rounded-full hover:bg-[#8f1836]">
                <MapPin size={20} />
              </Link>
            </div>
            <div className="flex gap-4">
              <Link href="#" className="bg-[#B11E43] text-white px-4 py-2 rounded-md hover:bg-[#8f1836]">
                PlayStore
              </Link>
              <Link href="#" className="bg-[#B11E43] text-white px-4 py-2 rounded-md hover:bg-[#8f1836]">
                AppStore
              </Link>
            </div>
          </div>

          {/* Our Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#B11E43]">Our Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-[#B11E43] transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-[#B11E43] transition-colors duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/stay" className="text-gray-600 hover:text-[#B11E43] transition-colors duration-300">
                  Stay
                </Link>
              </li>
              <li>
                <Link href="/why-join-us" className="text-gray-600 hover:text-[#B11E43] transition-colors duration-300">
                  Why Join Us
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-600 hover:text-[#B11E43] transition-colors duration-300">
                  Help & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#B11E43]">Our Services</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-[#B11E43] transition-colors duration-300">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-[#B11E43] transition-colors duration-300">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-gray-600 hover:text-[#B11E43] transition-colors duration-300">
                  Refund & Cancellation
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-[#B11E43] transition-colors duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-[#B11E43] transition-colors duration-300">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-gray-600 text-sm">
          <p>&copy; 2025 HSquare All rights reserved</p>
          <p>Created with love by Travel O Media</p>
        </div>
      </div>
    </footer>
  )
}

