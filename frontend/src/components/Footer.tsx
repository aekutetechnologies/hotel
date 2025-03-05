import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-white to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.png"
            alt="Hsquare Logo"
            width={140}
            height={48}
            className="h-12 w-auto mb-4"
          />
          <p className="text-sm text-gray-600">Your perfect stay at the best price</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4 text-gray-900">Download Hsquare app</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-sm text-gray-600 hover:text-red-600">
                App Store
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-red-600">
                Google Play
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-gray-900">About Us</h3>
            <div className="space-y-2">
              <Link href="#" className="block text-sm text-gray-600 hover:text-red-600">
                About Hsquare
              </Link>
              <Link href="#" className="block text-sm text-gray-600 hover:text-red-600">
                Teams / Careers
              </Link>
              <Link href="#" className="block text-sm text-gray-600 hover:text-red-600">
                Blogs
              </Link>
              <Link href="#" className="block text-sm text-gray-600 hover:text-red-600">
                Support
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-gray-900">Business</h3>
            <div className="space-y-2">
              <Link href="#" className="block text-sm text-gray-600 hover:text-red-600">
                List your property
              </Link>
              <Link href="#" className="block text-sm text-gray-600 hover:text-red-600">
                Become a Partner
              </Link>
              <Link href="#" className="block text-sm text-gray-600 hover:text-red-600">
                Corporate Travel
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-gray-900">Connect</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-600 hover:text-red-600">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-red-600">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-red-600">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-red-600">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">2024 © Hsquare Living Private Limited</p>
        </div>
      </div>
    </footer>
  )
}

