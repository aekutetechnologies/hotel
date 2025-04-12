"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { DetailSection } from '@/components/DetailSection';

// Testimonial data - move from main page to here
const hostelTestimonials = [
  {
    author: {
      name: "Sarah Traveler",
      handle: "Backpacker",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "Great atmosphere and met so many cool people! The staff was super friendly and helpful. Will definitely stay again on my next trip.",
  },
  {
    author: {
      name: "Mike Johnson",
      handle: "Digital Nomad",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "Perfect for remote work with fast WiFi and comfortable common areas. The social events made it easy to connect with other travelers.",
  },
  {
    author: {
      name: "Lena Kim",
      handle: "Solo Traveler",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "As a solo female traveler, I felt very safe and welcomed. The location was perfect for exploring the city and the beds were surprisingly comfortable!",
  },
  {
    author: {
      name: "Carlos Rodriguez",
      handle: "Budget Explorer",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "Incredible value for money! Clean facilities, free breakfast, and the best location. This hostel chain never disappoints.",
  },
  {
    author: {
      name: "Emma Wilson",
      handle: "Gap Year Student",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "The pub crawls and city tours organized by the hostel made my stay unforgettable. Met lifelong friends here!",
  },
];

const hotelTestimonials = [
  {
    author: {
      name: "John Doe",
      handle: "Business Traveler",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "Amazing experience! The hotel exceeded all our expectations. The staff went above and beyond to make our stay perfect. Will definitely come back again.",
  },
  {
    author: {
      name: "Emily Parker",
      handle: "Luxury Seeker",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "The attention to detail was impeccable. From the welcome champagne to the turndown service, everything was perfect. The spa treatments were divine!",
  },
  {
    author: {
      name: "Robert Chen",
      handle: "Executive",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "Perfect for business travel. The meeting facilities were top-notch and the room service was prompt. The bed was the most comfortable I've ever slept in.",
  },
  {
    author: {
      name: "Sophia Martinez",
      handle: "Honeymoon",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "We chose this hotel for our honeymoon and it was magical. The romantic dinner on the terrace and the special touches made it unforgettable.",
  },
  {
    author: {
      name: "James Wilson",
      handle: "Family Vacation",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "Our family had an incredible stay. The kids loved the pool and activities while we enjoyed the relaxing atmosphere. Perfect balance for everyone.",
  },
];

export default function HomePage() {
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  
  // Get the section type from URL query parameters (hotels or hostels)
  const sectionType = searchParams.get('type') === 'hostels' ? 'hostels' : 'hotels';
  
  // Handle returning to main page
  const handleClose = () => {
    window.location.href = '/';
  };
  
  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedName = localStorage.getItem("name");
    const storedAccessToken = localStorage.getItem("access_token");
    
    if (storedName && storedAccessToken) {
      setIsLoggedIn(true);
      setUserName(storedName);
    }
  }, []);
  
  const handleLoginClick = () => {
    setIsLoginDialogOpen(true);
  };
  
  // Function to handle section changes within the DetailSection
  const setShowDetailSection = (section: "hotels" | "hostels" | null) => {
    if (section) {
      window.location.href = `/home?type=${section}`;
    } else {
      window.location.href = '/';
    }
  };

  return (
    <DetailSection
      sectionType={sectionType}
      isLoggedIn={isLoggedIn}
      userName={userName}
      onClose={handleClose}
      hotelTestimonials={hotelTestimonials}
      hostelTestimonials={hostelTestimonials}
      setShowDetailSection={setShowDetailSection}
      handleLoginClick={handleLoginClick}
    />
  );
}
