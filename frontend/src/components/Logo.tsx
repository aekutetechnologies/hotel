import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  destination?: string;
  preserveSection?: boolean;
  currentSection?: 'hotel' | 'hostel';
}

export function Logo({ destination = '/', preserveSection = false, currentSection = 'hotel' }: LogoProps) {
  // If preserveSection is true, append section parameter to destination
  const finalDestination = preserveSection && currentSection 
    ? `${destination}${destination.includes('?') ? '&' : '?'}section=${currentSection === 'hotel' ? 'hotels' : 'hostels'}`
    : destination;
    
  return (
    <Link href={finalDestination} className="logo-container flex items-center opacity-100">
      <Image
        src="/logo.png"
        alt="Hsquare Logo"
        width={140}  // Original width
        height={40}  // Original height
        className="md:w-40 md:h-[calc(40*40/140)] w-24 h-[calc(24*40/140)]" // Maintain aspect ratio
        priority // Add priority since this is above the fold
      />
    </Link>
  )
} 