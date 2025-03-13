import { cn } from "@/lib/utils"
import { Avatar, AvatarImage } from "@/components/ui/avatar"

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar: string
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  className?: string
  theme?: "hotel" | "hostel"
}

export function TestimonialCard({ author, text, href, className, theme = "hotel" }: TestimonialCardProps) {
  const Card = href ? "a" : "div"

  return (
    <Card
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "flex flex-col rounded-lg border-t",
        theme === "hotel"
          ? "bg-gradient-to-b from-[#A31C44]/10 to-[#A31C44]/5 hover:from-[#A31C44]/20 hover:to-[#A31C44]/10"
          : "bg-gradient-to-b from-[#2A2B2E]/10 to-[#2A2B2E]/5 hover:from-[#2A2B2E]/20 hover:to-[#2A2B2E]/10",
        "p-4 text-start sm:p-6",
        "w-[280px] sm:w-[320px] flex-shrink-0 mx-4",
        "transition-colors duration-300",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={author.avatar} alt={author.name} />
        </Avatar>
        <div className="flex flex-col items-start">
          <h3 className="text-md font-semibold leading-none">{author.name}</h3>
          <p className="text-sm text-muted-foreground">{author.handle}</p>
        </div>
      </div>
      <p className="sm:text-md mt-4 text-sm text-muted-foreground">{text}</p>
    </Card>
  )
}

