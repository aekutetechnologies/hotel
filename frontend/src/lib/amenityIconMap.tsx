import React from 'react'
import {
    Wifi,
    Coffee,
    Tv,
    Car,
    Utensils,
    Building2,
    BatteryCharging,
    Dumbbell,
    BellRing,
    ShieldCheck,
    UserRoundCheck,
    Beer,
    Soup,
    Building,
    Heater,
    ChefHat,
    AirVent,
    CheckCircle2,
    MapPin,
    Newspaper,
    ConciergeBell
} from 'lucide-react'

const icon = (el: React.ReactElement) => {
    const props = { ...(el.props || {}), className: 'h-6 w-6 text-[#B11E43]' }
    return React.createElement(el.type, props)
}

const map: Record<string, React.ReactElement> = {
    // Connectivity
    'free wi-fi': icon(<Wifi />),
    'free wifi': icon(<Wifi />),
    'high-speed internet': icon(<Wifi />),
    'ethernet connection': icon(<Wifi />),

    // Pools
    'swimming pool': icon(<Building2 />),
    'outdoor pool': icon(<Building2 />),
    'indoor pool': icon(<Building2 />),
    'pool bar': icon(<Beer />),
    'poolside service': icon(<Beer />),
    'pool towels': icon(<Building2 />),

    // Wellness & fitness
    'gym': icon(<Dumbbell />),
    'fitness center': icon(<Dumbbell />),
    'spa': icon(<Heater />),
    'sauna': icon(<Heater />),
    'steam room': icon(<Heater />),
    'jacuzzi': icon(<Heater />),
    'hot tub': icon(<Heater />),

    // Food & drink
    'restaurant': icon(<Utensils />),
    'bar': icon(<Beer />),
    'room service': icon(<Utensils />),
    'breakfast included': icon(<Coffee />),
    'coffee/tea maker': icon(<Coffee />),
    'in-room breakfast': icon(<Coffee />),
    'mini bar': icon(<Beer />),

    // Convenience & services
    'parking': icon(<Car />),
    'valet parking': icon(<Car />),
    'car rental': icon(<Car />),
    'airport shuttle': icon(<Car />),
    'concierge service': icon(<UserRoundCheck />),
    'tour desk': icon(<MapPin />),
    'currency exchange': icon(<Building />),
    'atm': icon(<Building />),
    'laundry service': icon(<Building />),
    'dry cleaning': icon(<Building />),
    'daily housekeeping': icon(<BellRing />),
    'turndown service': icon(<BellRing />),
    'air conditioning': icon(<AirVent />),

    // Accessibility & safety
    'wheelchair accessible': icon(<Building />),
    'security': icon(<ShieldCheck />),
    'cctv': icon(<ShieldCheck />),
    'fire safety': icon(<ShieldCheck />),
    'first aid': icon(<ShieldCheck />),

    // Rooms & in-room facilities
    'flat screen tv': icon(<Tv />),
    'tv': icon(<Tv />),
    'satellite tv': icon(<Tv />),
    'cable tv': icon(<Tv />),
    'safe': icon(<CheckCircle2 />),
    'refrigerator': icon(<Building />),
    'hair dryer': icon(<Building />),
    'iron/ironing board': icon(<Building />),
    'balcony': icon(<Building />),
    'ocean view': icon(<Building />),
    'city view': icon(<Building />),
    'garden view': icon(<Building />),
    'kitchenette': icon(<ChefHat />),
    'microwave': icon(<ChefHat />),
    'dishwasher': icon(<ChefHat />),
    'washing machine': icon(<Building />),
    'dryer': icon(<Building />),
    'bathtub': icon(<Heater />),
    'shower': icon(<Heater />),
    'newspaper': icon(<Newspaper />),

    // Business & events
    'conference room': icon(<Building />),
    'meeting rooms': icon(<Building />),
    'business center': icon(<Building />),
    'event facilities': icon(<Building />),
    'wedding services': icon(<Building />),

    // Family & entertainment
    'kids club': icon(<Building />),
    'playground': icon(<Building />),
    'game room': icon(<Building />),
    'gift shop': icon(<Building />),

    // Sports & outdoors
    'tennis court': icon(<Building />),
    'golf course': icon(<Building />),
    'beach access': icon(<Building />),
    'bicycle rental': icon(<Building />),

    // Dietary options
    'vegetarian options': icon(<Utensils />),
    'gluten-free options': icon(<Utensils />),
    'kosher meals': icon(<Utensils />),
    'halal meals': icon(<Utensils />),

    // Misc common
    'elevator': icon(<Building2 />),
    'luggage storage': icon(<Building2 />),
    'lost and found': icon(<Building2 />),
    'wake-up service': icon(<BellRing />),
    '24-hour front desk': icon(<ConciergeBell />),
}

export function getAmenityIcon(name?: string) {
    if (!name) return icon(<CheckCircle2 />)
    const key = name.toLowerCase().trim()
    return map[key] || icon(<CheckCircle2 />)
}

export default getAmenityIcon
