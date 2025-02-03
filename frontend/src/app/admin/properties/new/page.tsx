'use client'

import { PropertyForm } from "@/components/admin/PropertyForm"

export default function NewProperty() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Add New Property</h1>
      <PropertyForm />
    </div>
  )
}

