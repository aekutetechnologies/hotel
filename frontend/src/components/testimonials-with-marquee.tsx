import type React from "react"
import { cn } from "@/lib/utils"
import { TestimonialCard, type TestimonialAuthor } from "@/components/ui/testimonial-card"

interface TestimonialsSectionProps {
  title: string
  description: string
  testimonials: Array<{
    author: TestimonialAuthor
    text: string
    href?: string
  }>
  className?: string
  theme?: "hotel" | "hostel"
}

export function TestimonialsSection({
  title,
  description,
  testimonials,
  className,
  theme = "hotel",
}: TestimonialsSectionProps) {
  return (
    <section className={cn("bg-background text-foreground", "py-12 sm:py-24 px-0", className)}>
      <div className="mx-auto flex max-w-container flex-col items-center gap-4 text-center sm:gap-16">
        <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
          <h2
            className={cn(
              "max-w-[720px] text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight font-rock-salt",
              theme === "hotel" ? "text-[#A31C44]" : "text-[#A31C44]",
            )}
          >
            {title}
          </h2>
          <p className="text-md max-w-[600px] font-medium text-muted-foreground sm:text-xl">{description}</p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-8">
          <div
            className="marquee-container w-full overflow-hidden"
            style={{ transform: "rotate(1deg)", marginLeft: "-1%", marginRight: "-1%", width: "102%" }}
          >
            <div className="marquee flex gap-4" style={{ "--duration": "40s" } as React.CSSProperties}>
              {[...Array(2)].map((_, setIndex) =>
                testimonials.map((testimonial, i) => (
                  <TestimonialCard key={`${setIndex}-${i}`} {...testimonial} theme={theme} />
                )),
              )}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-background sm:block"
            style={{ transform: "rotate(1deg)" }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-background sm:block"
            style={{ transform: "rotate(1deg)" }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .marquee {
          display: flex;
          width: max-content;
          animation: marquee var(--duration) linear infinite;
        }

        .marquee-container:hover .marquee {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}

