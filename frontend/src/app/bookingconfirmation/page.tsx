'use client';

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

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
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-green-600">Booking Confirmed!</h2>
          <p className="mb-6 text-gray-700">
            Thank you for your booking. Your reservation details have been sent to your email address.
          </p>
          <Button variant="default" size="lg" onClick={handleGoHome}>
            Go to Homepage
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

