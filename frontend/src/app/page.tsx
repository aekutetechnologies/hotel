"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn } from "lucide-react";
import { LoginDialog } from "@/components/LoginDialog";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { NewButton } from "@/components/ui/new-button";
import { HomeHero } from "@/components/HomeHero";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Logo } from "@/components/Logo";
import WhatsApp from "@/components/WhatsApp";

// Define static data
const hotelImages = [
  "/images/hotels/nhotel1.jpg",
  "/images/hotels/nhotel2.jpg",
  "/images/hotels/nhotel3.jpg",
];

const hostelImages = [
  "/hostel/hostel5.jpeg",
  "/hostel/hostel6.jpg",
  "/hostel/hostel7.jpg",
];

// Image preloader hook
const useImagePreloader = (imageSources: string[]) => {
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const preloadImages = async () => {
      try {
        const totalImages = imageSources.length;
        let loadedImages = 0;

        const imagePromises = imageSources.map((src) => {
          return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => {
              loadedImages++;
              setLoadingProgress(
                Math.round((loadedImages / totalImages) * 100)
              );
              resolve(src);
            };
            img.onerror = () => {
              loadedImages++;
              setLoadingProgress(
                Math.round((loadedImages / totalImages) * 100)
              );
              reject(`Failed to load image: ${src}`);
            };
            img.src = src;
          });
        });

        await Promise.all(imagePromises);
        setTimeout(() => setImagesPreloaded(true), 500);
      } catch (error) {
        console.error("Error preloading images:", error);
        setTimeout(() => setImagesPreloaded(true), 500);
      }
    };

    preloadImages();
  }, [imageSources]);

  return { imagesPreloaded, loadingProgress };
};

export default function Home() {
  // State
  const [isLoaded, setIsLoaded] = useState(false);
  const [expandedSection, setExpandedSection] = useState<"hotels" | "hostels" | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [userName, setUserName] = useState("");

  const { imagesPreloaded, loadingProgress } = useImagePreloader([...hotelImages, ...hostelImages]);

  useEffect(() => {
    setIsLoaded(true);

    const storedName = localStorage.getItem("name");
    const storedAccessToken = localStorage.getItem("accessToken");
    console.log("storedName", storedName);
    console.log("storedAccessToken", storedAccessToken);
    if (storedName && storedAccessToken) {
      console.log("storedName", storedName);
      setIsLoggedIn(true);
      setUserName(storedName);
    }
  }, []);

  // Handlers
  const handleDiscover = (section: "hotels" | "hostels") => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Navigate to the detailed page instead of showing in the same page
    window.location.href = `/home?type=${section}`;
  };

  // Add a handler for expanded section click
  const handleExpandedSectionClick = (section: "hotels" | "hostels") => {
    handleDiscover(section);
  };

  const handleLoginClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsLoginDialogOpen(true);
  };

  const handleLoginSuccess = (userData: any) => {
    console.log("userData", userData);
    if (!userData) {
      console.error("Invalid user data:", userData);
      return;
    }

    setIsLoggedIn(true);
    setUserName(userData);
  };

  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.clear()
    
    // Set states
    setIsLoggedIn(false)
    setUserName("")
    
    // Reload home page
    window.location.href = "/"
  }

  if (!imagesPreloaded) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  return (
    <>
      <AnimatePresence>
        {!imagesPreloaded && <LoadingScreen progress={loadingProgress} />}
      </AnimatePresence>

      {imagesPreloaded && (
        <div className="flex flex-col min-h-screen overflow-hidden">
          {/* Navbar for web view */}
          <motion.div 
            className="hidden md:block fixed top-0 left-0 right-0 z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <nav
              className="mx-auto px-6 flex justify-between items-center bg-gradient-to-r from-slate-300 via-transparent to-slate-300 backdrop-blur-md shadow-lg max-w-full w-full"
              style={{
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="py-3">
                <Logo />
              </div>
                {isLoggedIn ? (
                  <ProfileDropdown 
                    userName={userName} 
                    onLogout={handleLogout} 
                  />
                ) : (
                <NewButton
                  variant="default"
                  onClick={handleLoginClick}
                  size="sm"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                    <span>Login</span>
                </NewButton>
                )}
            </nav>
          </motion.div>

          {/* Home Hero Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <HomeHero
              hotelImages={hotelImages}
              hostelImages={hostelImages}
              expandedSection={expandedSection}
              setExpandedSection={setExpandedSection}
              handleDiscover={handleDiscover}
              handleExpandedSectionClick={handleExpandedSectionClick}
            />
          </motion.div>
          
          {/* WhatsApp Widget */}
          <WhatsApp />
        </div>
      )}

      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
