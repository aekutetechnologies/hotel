'use client'

import { PropertyForm } from "@/components/admin/PropertyForm"
import { PermissionGuard } from "@/components/PermissionGuard"

export default function NewProperty() {
  console.log("Rendering NewProperty page")
  
  return (
    <PermissionGuard permission="property:create">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <h1 className="text-2xl font-bold mb-8">Add New Property</h1>
        <PropertyForm />
      </div>
    </PermissionGuard>
  )
}

