'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What are the check-in and check-out timings?",
    answer: "Standard check-in time is 12:00 PM and check-out time is 11:00 AM. Early check-in or late check-out is subject to availability."
  },
  {
    question: "Is there a cancellation fee?",
    answer: "Free cancellation is available up to 24 hours before check-in. Cancellations made within 24 hours of check-in may incur a fee equivalent to one night's stay."
  },
  {
    question: "What documents are required for check-in?",
    answer: "Valid government-issued photo ID is required for all guests. For international guests, a passport is mandatory."
  },
  {
    question: "Is parking available?",
    answer: "Yes, we offer complimentary parking for all guests, subject to availability."
  }
]

export function HelpSection() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the contact form data to your backend
    console.log('Contact form submitted:', contactForm)
    setContactForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="space-y-8">
      {/* General FAQs */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Contact Form */}
      <div className="border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Need More Help?</h3>
        <form onSubmit={handleContactSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                value={contactForm.name}
                onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <Input
              value={contactForm.subject}
              onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <Textarea
              value={contactForm.message}
              onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              required
            />
          </div>
          <Button type="submit" className="bg-[#B11E43] hover:bg-[#8f1836] text-white">
            Send Message
          </Button>
        </form>
      </div>

      {/* Emergency Contact */}
      <div className="bg-gray-100 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">24/7 Support</h3>
        <div className="space-y-2">
          <p className="flex items-center">
            <span className="font-medium mr-2">Phone:</span>
            <a href="tel:+917400455087" className="text-[#B11E43]">+91 98765 43210</a>
          </p>
          <p className="flex items-center">
            <span className="font-medium mr-2">Email:</span>
            <a href="mailto:support@hsquare.com" className="text-[#B11E43]">support@hsquare.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}

