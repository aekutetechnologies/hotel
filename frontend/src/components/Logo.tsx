import Image from "next/image"

export function Logo() {
  return (
    <div className="logo-container flex items-center opacity-100">
      <Image
        src="/logo.png"
        alt="Hsquare Logo"
        width={140}  // Original width
        height={40}  // Original height
        className="md:w-40 md:h-[calc(40*40/140)] w-24 h-[calc(24*40/140)]" // Maintain aspect ratio
        priority // Add priority since this is above the fold
      />
    </div>
  )
} 