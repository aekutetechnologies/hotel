// This file now re-exports the NewButton as Button
// This allows for a smooth transition without changing all imports

import { NewButton, buttonVariants as newButtonVariants } from "@/components/ui/new-button"

export const Button = NewButton
export const buttonVariants = newButtonVariants
