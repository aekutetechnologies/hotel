export const IMAGE_CATEGORIES = [
  { value: 'room', label: 'Room' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'waiting_room', label: 'Waiting Room' },
  { value: 'facade', label: 'Facade' },
  { value: 'parking', label: 'Parking' },
  { value: 'lobby', label: 'Lobby' },
  { value: 'dining', label: 'Dining' },
  { value: 'exterior', label: 'Exterior' },
  { value: 'other', label: 'Other' },
] as const

export type ImageCategory = typeof IMAGE_CATEGORIES[number]['value']

