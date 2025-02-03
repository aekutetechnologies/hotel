import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function BookingConfirmation() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">Booking Confirmed!</h1>
          <p className="text-xl mb-8">Thank you for your booking. We've sent a confirmation email with all the details.</p>
          <Link href="/">
            <Button className="bg-[#B11E43] hover:bg-[#8f1836] text-white">
              Return to Home
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}

