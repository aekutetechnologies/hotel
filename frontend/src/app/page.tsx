"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Hotel, HomeIcon, ChevronRight } from "lucide-react";
import { LoginDialog } from "@/components/LoginDialog";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { NewButton } from "@/components/ui/new-button";
import { HomeHero } from "@/components/HomeHero";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Logo } from "@/components/Logo";

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

          {/* Mobile navbar and selection */}
          <motion.div
            className="md:hidden fixed top-0 left-0 right-0 z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <nav
              className="mx-auto px-4 py-3 flex justify-between items-center bg-gradient-to-r from-slate-300 via-transparent to-slate-300 backdrop-blur-md shadow-lg w-full"
            >
              <div className="py-2">
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

          {/* Mobile View Selection Cards */}
          <div className="md:hidden flex flex-col items-center justify-center mt-24 px-4 py-8">
            <motion.h1 
              className="text-3xl font-bold text-center mb-8 text-[#A31C44]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Where would you like to stay?
            </motion.h1>
            
            <div className="w-full space-y-6">
              {/* Hotels Card */}
              <motion.div
                className="w-full rounded-xl overflow-hidden shadow-lg cursor-pointer"
                onClick={() => handleDiscover("hotels")}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative h-48 w-full">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent z-10" />
                  <img 
                    src={hotelImages[0]} 
                    alt="Hotel" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 left-0 right-0 bg-[#A31C44] text-white py-2 px-4 z-20">
                    <h3 className="text-lg font-bold">Hotels</h3>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-700 mb-2">Luxury stays with premium amenities</p>
                      <p className="text-xs text-gray-500">Perfect for business and leisure</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-[#A31C44]" />
                  </div>
                </div>
              </motion.div>
              
              {/* Hostels Card */}
              <motion.div
                className="w-full rounded-xl overflow-hidden shadow-lg cursor-pointer"
                onClick={() => handleDiscover("hostels")}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative h-48 w-full">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent z-10" />
                  <img 
                    src={hostelImages[0]} 
                    alt="Hostel" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 left-0 right-0 bg-[#454F61] text-white py-2 px-4 z-20">
                    <h3 className="text-lg font-bold">Hostels</h3>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-700 mb-2">Affordable community living</p>
                      <p className="text-xs text-gray-500">Ideal for students and backpackers</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-[#454F61]" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Home Hero Section - Only visible on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="hidden md:block"
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
