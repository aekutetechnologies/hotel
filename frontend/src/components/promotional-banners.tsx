import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function PromotionalBanners() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* QR Code Banner */}
      <Card className="relative overflow-hidden">
        <div className="flex items-center">
          <div className="p-8 w-1/3">
            <div className="text-lg font-semibold mb-4">Get ready for a ultimate staycation!</div>
            <Image
              src="/placeholder.svg"
              alt="QR Code"
              width={150}
              height={150}
              className="border border-gray-200 rounded-lg"
            />
            <Button variant="outline" className="mt-4">
              Book now
            </Button>
          </div>
          <div className="flex-1 relative h-[200px]">
            <Image src="/placeholder.svg" alt="Promotional Banner" fill className="object-cover" />
            <div className="absolute top-8 right-8 text-white text-4xl font-bold">
              Up to <br />
              75% off
            </div>
          </div>
        </div>
      </Card>

      {/* Premium Hotels Banner */}
      <Card className="relative overflow-hidden">
        <div className="flex items-center">
          <div className="p-8 space-y-4 w-1/2">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm">Company-Serviced</div>
            <h2 className="text-2xl font-bold">India's no 1 premium value hotels</h2>
            <ul className="space-y-2">
              <li>✓ Assured Check-in</li>
              <li>✓ Spacious clean Rooms</li>
              <li>✓ 1000+ new properties</li>
            </ul>
            <Button>Book now</Button>
          </div>
          <div className="flex-1 relative h-[300px]">
            <Image src="/placeholder.svg" alt="Premium Hotels" fill className="object-cover" />
            <div className="absolute bottom-8 right-8 text-white">
              <div className="text-sm">Starting from</div>
              <div className="text-4xl font-bold">₹999</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

