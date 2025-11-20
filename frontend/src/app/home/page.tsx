"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { DetailSection } from '@/components/DetailSection';
import { LoginDialog } from '@/components/LoginDialog';

// Create a client component that uses useSearchParams
function HomeContent() {
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
    const storedAccessToken = localStorage.getItem("accessToken");
    
    if (storedName && storedAccessToken) {
      setIsLoggedIn(true);
      setUserName(storedName);
    }
  }, []);
  
  const handleLoginClick = () => {
    setIsLoginDialogOpen(true);
  };

  const handleLoginSuccess = (name: string) => {
    setIsLoggedIn(true);
    setUserName(name);
    setIsLoginDialogOpen(false);
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
    <>
      <DetailSection
        sectionType={sectionType}
        isLoggedIn={isLoggedIn}
        userName={userName}
        onClose={handleClose}
        setShowDetailSection={setShowDetailSection}
        handleLoginClick={handleLoginClick}
      />
      
      <LoginDialog 
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

// Create a loading fallback for Suspense
function HomeLoading() {
  return <div className="flex justify-center items-center h-screen">Loading...</div>;
}

// Main page component that wraps HomeContent in Suspense
export default function HomePage() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}
