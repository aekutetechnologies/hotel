"use client"

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CgDetailsMore } from "react-icons/cg";
import { RxCross2 } from "react-icons/rx";
import { ArrowRight, Facebook, Instagram, Linkedin, PhoneCall } from "lucide-react";
import Image from "next/image";
import { ProfileDropdown } from "./profile-dropdown";
import { NewButton } from "./ui/new-button";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { fetchCityArea } from "@/lib/api/fetchCityArea";
import { fetchOffers } from "@/lib/api/fetchOffers";
import { toast } from "react-toastify";

interface NavbarProps {
  isLoggedIn: boolean;
  userName: string;
  handleLogout: () => void;
  handleLoginClick: () => void;
  setShowDetailSection: (section: string) => void;
  isClosed: boolean;
  currentSection?: "hotel" | "hostel";
  onNavModalChange?: (isOpen: boolean) => void;
  isDetailPage?: boolean;
}

const phoneNumber = "+91-9090151524"

const Navbar: React.FC<NavbarProps> = ({
  isLoggedIn,
  userName,
  handleLogout,
  handleLoginClick,
  setShowDetailSection,
  isClosed,
  currentSection = "hotel",
  onNavModalChange,
  isDetailPage,
}) => {
  const [navModal, setNavModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);

  // Handle navModal state change and notify parent
  const handleNavModalToggle = (isOpen: boolean) => {
    setNavModal(isOpen);
    if (onNavModalChange) {
      onNavModalChange(isOpen);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowSearch(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // This effect resets the active submenu when the modal is closed
  useEffect(() => {
    if (!navModal) {
      setActiveSubmenu(null);
    }
  }, [navModal]);

  const handleSwitchSection = () => {
    const sectionToSwitch = currentSection === "hotel" ? "hostels" : "hotels";
    setShowDetailSection(sectionToSwitch);
    handleNavModalToggle(false);
  };

  const handleToggleSubmenu = async (menuId: string) => {
    // If the same menu is clicked, close it
    if (activeSubmenu === menuId) {
      setActiveSubmenu(null);
      return;
    }

    // Otherwise, activate the new submenu
    setActiveSubmenu(menuId);

    // Handle specific submenu loading
    if (menuId === 'locations') {
      handleLoadLocations();
    } else if (menuId === 'offers') {
      handleLoadOffers();
    }
  };

  const handleLoadLocations = async () => {
    try {
      setIsLoadingLocations(true);
      const data = await fetchCityArea("Mumbai");
      setLocations((data as any).unique_areas || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const handleLoadOffers = async () => {
    try {
      setIsLoadingOffers(true);
      const data = await fetchOffers();
      setOffers(data);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to load offers");
    } finally {
      setIsLoadingOffers(false);
    }
  };

  // Background color based on section and state
  const getBackgroundStyle = () => {
    if (!navModal) return "bg-white";

    return currentSection === "hotel" 
      ? "bg-gradient-to-b from-[#7A1633] via-[#A31C44] to-[#C93A5E] backdrop-blur-sm" 
      : "bg-gradient-to-b from-[#232A39] via-[#343F52] to-[#4E5D79] backdrop-blur-sm";
  };

  // Text color for menu items
  const getMenuTextColor = () => {
    if (!navModal) return "text-black";
    return "text-white";
  };

  return (
    <motion.div
      className={`w-full shadow-lg max-w-[100vw] overflow-x-hidden
      ${getBackgroundStyle()}`}
      initial={{ height: "70px" }}
      animate={{ 
        height: navModal ? "100vh" : "70px"
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="flex justify-between items-center px-4 md:px-6 py-2 max-w-screen-2xl mx-auto w-full h-[70px]">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => handleNavModalToggle(!navModal)}
            animate={{ rotate: navModal ? 90 : 0 }}
            transition={{ duration: 0.3 }}
            className={getMenuTextColor()}
          >
            {navModal ? <RxCross2 size={24} /> : <CgDetailsMore size={24} />}
          </motion.button>
          {/* Logo with conditional redirect logic */}
          <Link 
            href="/"
          >
            <Image
              src={navModal ? "/white-logo.png" : "/logo.png"}
              alt="Hsquare Logo"
              width={140}
              height={40}
              className="md:w-40 md:h-[calc(40*40/140)] w-24 h-[calc(24*40/140)]"
              priority
            />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href={`tel:${phoneNumber.replace(/-/g, '')}`} className="hidden md:flex items-center gap-3">
            <PhoneCall className="h-10 w-10 text-gray-600" />
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold text-[#000F24]">{phoneNumber}</span>
              <span className="text-sm text-gray-500">Call us to Book now</span>
            </div>
          </Link>
          
          {isLoggedIn ? (
            <ProfileDropdown userName={userName} onLogout={handleLogout} />
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
        </div>
      </div>

      <AnimatePresence>
        {navModal && (
          <motion.div
            className="w-full h-[calc(100vh-70px)] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >

            <div className="flex h-full mt-6 flex-col md:flex-row">
              {/* Left Nav Panel */}
              <div className="w-full md:w-1/2 flex flex-col justify-start pt-8 md:pt-16 items-start pl-8 md:pl-16 lg:pl-24 gap-7">
                {/* Switch to Hotel/Hostel */}
                <div 
                  onClick={handleSwitchSection}
                  className={`flex items-center justify-between w-full md:w-3/4 cursor-pointer group transition-all duration-300 text-white
                    hover:translate-x-2`}
                >
                  <span className="text-3xl md:text-4xl lg:text-5xl font-bold">
                    Switch to {currentSection === "hotel" ? "Hostel" : "Hotel"}
                  </span>
                  <ArrowRight className="h-7 w-7 md:h-8 md:w-8 lg:h-9 lg:w-9 transition-transform group-hover:translate-x-1" />
                </div>
                
                {/* Locations */}
                <div 
                  onClick={() => handleToggleSubmenu('locations')}
                  className={`flex items-center justify-between w-full md:w-3/4 cursor-pointer group transition-all duration-300 text-white
                    hover:translate-x-2 ${activeSubmenu === 'locations' ? 'translate-x-2' : ''}`}
                >
                  <span className="text-2xl md:text-3xl lg:text-4xl font-bold">Locations</span>
                  <motion.div
                    animate={{ rotate: activeSubmenu === 'locations' ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 transition-transform group-hover:translate-x-1" />
                  </motion.div>
                </div>
                
                {/* Offers */}
                <div 
                  onClick={() => handleToggleSubmenu('offers')}
                  className={`flex items-center justify-between w-full md:w-3/4 cursor-pointer group transition-all duration-300 text-white
                    hover:translate-x-2 ${activeSubmenu === 'offers' ? 'translate-x-2' : ''}`}
                >
                  <span className="text-2xl md:text-3xl lg:text-4xl font-bold">Offers</span>
                  <motion.div
                    animate={{ rotate: activeSubmenu === 'offers' ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 transition-transform group-hover:translate-x-1" />
                  </motion.div>
                </div>
                
                {/* About hsquare */}
                <div 
                  onClick={() => handleToggleSubmenu('about')}
                  className={`flex items-center justify-between w-full md:w-3/4 cursor-pointer group transition-all duration-300 text-white
                    hover:translate-x-2 ${activeSubmenu === 'about' ? 'translate-x-2' : ''}`}
                >
                  <span className="text-2xl md:text-3xl lg:text-4xl font-bold">About hsquare</span>
                  <motion.div
                    animate={{ rotate: activeSubmenu === 'about' ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 transition-transform group-hover:translate-x-1" />
                  </motion.div>
                </div>
              </div>
              
              {/* Right Content Panel - Desktop */}
              <AnimatePresence mode="wait">
                {activeSubmenu ? (
                  <motion.div
                    key={activeSubmenu}
                    className="hidden md:block md:w-1/2 h-full pt-10 pb-10 pr-10 overflow-y-auto"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Locations Content */}
                    {activeSubmenu === 'locations' && (
                      <div className="p-6 text-white">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Destinations</h2>
                        {isLoadingLocations ? (
                          <div className="flex items-center justify-center py-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                            <span className="ml-3 text-xl">Loading locations...</span>
                          </div>
                        ) : locations && locations.length > 0 ? (
                          <div className="grid grid-cols-1 gap-1">
                            {locations.map((location, index) => (
                              <div 
                                key={index} 
                                className="text-xl md:text-2xl py-3 px-4 hover:bg-white/10 rounded-lg cursor-pointer transition-all duration-300 hover:translate-x-2"
                              >
                                {location}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-4 text-xl">
                            No locations found. Please try again later.
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Offers Content */}
                    {activeSubmenu === 'offers' && (
                      <div className="p-6 text-white">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6">Special Offers</h2>
                        {isLoadingOffers ? (
                          <div className="flex items-center justify-center py-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                            <span className="ml-3 text-xl">Loading offers...</span>
                          </div>
                        ) : offers && offers.length > 0 ? (
                          <div className="grid grid-cols-1 gap-6">
                            {offers.map((offer, index) => (
                              <div 
                                key={index} 
                                className="bg-white/10 rounded-lg p-5 hover:translate-y-[-5px] transition-all duration-300"
                              >
                                <h3 className="text-xl md:text-2xl font-bold mb-2">{offer.title}</h3>
                                <p className="text-lg opacity-90">{offer.description}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-4 text-xl">
                            No special offers available at the moment.
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* About hsquare Content */}
                    {activeSubmenu === 'about' && (
                      <div className="p-6 text-white">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6">About hsquare</h2>
                        <div className="grid grid-cols-1 gap-1">
                          <Link 
                            href="/careers"
                            className="text-xl md:text-2xl py-3 px-4 hover:bg-white/10 rounded-lg cursor-pointer transition-all duration-300 hover:translate-x-2"
                            onClick={() => setNavModal(false)}
                          >
                            Careers
                          </Link>
                          <a 
                            href="mailto:booking@hsquareliving.com"
                            className="text-xl md:text-2xl py-3 px-4 hover:bg-white/10 rounded-lg cursor-pointer transition-all duration-300 hover:translate-x-2"
                          >
                            Contact Us
                          </a>
                          <Link 
                            href="/terms-and-conditions"
                            className="text-xl md:text-2xl py-3 px-4 hover:bg-white/10 rounded-lg cursor-pointer transition-all duration-300 hover:translate-x-2"
                            onClick={() => setNavModal(false)}
                          >
                            Terms & Conditions
                          </Link>
                          <Link 
                            href="/cancellation-policy"
                            className="text-xl md:text-2xl py-3 px-4 hover:bg-white/10 rounded-lg cursor-pointer transition-all duration-300 hover:translate-x-2"
                            onClick={() => setNavModal(false)}
                          >
                            Cancellation Policy
                          </Link>
                          <Link 
                            href="/privacy-policy"
                            className="text-xl md:text-2xl py-3 px-4 hover:bg-white/10 rounded-lg cursor-pointer transition-all duration-300 hover:translate-x-2"
                            onClick={() => setNavModal(false)}
                          >
                            Privacy Policy
                          </Link>
                          <div className="mt-6">
                            <p className="text-xl mb-4">Connect with us:</p>
                            <div className="flex space-x-4">
                              <a href="https://www.facebook.com/profile.php?id=100093746289256&mibextid=LQQJ4d" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/40 p-3 rounded-full cursor-pointer transition-all">
                                <Facebook className="h-6 w-6" />
                              </a>
                              <a href="https://www.instagram.com/hsquareliving/" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/40 p-3 rounded-full cursor-pointer transition-all">
                                <Instagram className="h-6 w-6" />
                              </a>
                              <a href="https://www.linkedin.com/company/hsquare-living/" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/40 p-3 rounded-full cursor-pointer transition-all">
                                <Linkedin className="h-6 w-6" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="logo"
                    className="hidden md:flex md:w-1/2 h-full items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Image
                      src="/white-travel.png"
                      alt="Hsquare White travel"
                      width={576}
                      height={166}
                      className="w-[min(95%,576px)] h-auto"
                      priority
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Mobile Content Panel */}
              <AnimatePresence>
                {activeSubmenu && (
                  <motion.div
                    key={`mobile-${activeSubmenu}`}
                    className="md:hidden w-full px-8 mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Locations Content */}
                    {activeSubmenu === 'locations' && (
                      <div className="text-white">
                        <h3 className="text-xl font-bold mb-4 border-b border-white/20 pb-2">Our Destinations</h3>
                        {isLoadingLocations ? (
                          <div className="flex items-center justify-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                            <span className="ml-3">Loading locations...</span>
                          </div>
                        ) : locations && locations.length > 0 ? (
                          <div className="grid grid-cols-1 gap-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                            {locations.map((location, index) => (
                              <div 
                                key={index} 
                                className="text-lg py-2 px-2 hover:bg-white/10 rounded-lg cursor-pointer transition-all duration-300"
                              >
                                {location}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-4">
                            No locations found. Please try again later.
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Offers Content */}
                    {activeSubmenu === 'offers' && (
                      <div className="text-white">
                        <h3 className="text-xl font-bold mb-4 border-b border-white/20 pb-2">Special Offers</h3>
                        {isLoadingOffers ? (
                          <div className="flex items-center justify-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                            <span className="ml-3">Loading offers...</span>
                          </div>
                        ) : offers && offers.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                            {offers.map((offer, index) => (
                              <div 
                                key={index} 
                                className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all duration-300"
                              >
                                <h3 className="text-lg font-bold mb-1">{offer.title}</h3>
                                <p className="text-sm opacity-90">{offer.description}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-4">
                            No special offers available at the moment.
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* About hsquare Content */}
                    {activeSubmenu === 'about' && (
                      <div className="text-white">
                        <h3 className="text-xl font-bold mb-4 border-b border-white/20 pb-2">About hsquare</h3>
                        <div className="grid grid-cols-1 gap-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                          <Link 
                            href="/careers"
                            className="text-lg py-2 px-2 hover:bg-white/10 rounded-lg cursor-pointer transition-all duration-300"
                            onClick={() => setNavModal(false)}
                          >
                            Careers
                          </Link>
                          <a 
                            href="mailto:booking@hsquareliving.com"
                            className="text-lg py-2 px-2 hover:bg-white/10 rounded-lg cursor-pointer transition-all duration-300"
                          >
                            Contact Us
                          </a>
                          <Link 
                            href="/terms-and-conditions"
                            className="text-lg py-2 px-2 hover:bg-white/10 rounded-lg cursor-pointer transition-all duration-300"
                            onClick={() => setNavModal(false)}
                          >
                            Terms & Conditions
                          </Link>
                          <Link 
                            href="/cancellation-policy"
                            className="text-lg py-2 px-2 hover:bg-white/10 rounded-lg cursor-pointer transition-all duration-300"
                            onClick={() => setNavModal(false)}
                          >
                            Cancellation Policy
                          </Link>
                          <Link 
                            href="/privacy-policy"
                            className="text-lg py-2 px-2 hover:bg-white/10 rounded-lg cursor-pointer transition-all duration-300"
                            onClick={() => setNavModal(false)}
                          >
                            Privacy Policy
                          </Link>
                          <div className="mt-4 py-2">
                            <p className="text-base mb-3">Connect with us:</p>
                            <div className="flex space-x-3">
                              <a href="https://www.facebook.com/profile.php?id=100093746289256&mibextid=LQQJ4d" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/40 p-2 rounded-full cursor-pointer transition-all">
                                <Facebook className="h-5 w-5" />
                              </a>
                              <a href="https://www.instagram.com/hsquareliving/" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/40 p-2 rounded-full cursor-pointer transition-all">
                                <Instagram className="h-5 w-5" />
                              </a>
                              <a href="https://www.linkedin.com/company/hsquare-living/" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/40 p-2 rounded-full cursor-pointer transition-all">
                                <Linkedin className="h-5 w-5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Mobile Logo (when no submenu is active) */}
              {!activeSubmenu && (
                <div className="md:hidden mt-auto mb-12 flex justify-center w-full">
                  <Image
                    src="/white-travel.png"
                    alt="Hsquare White travel"
                    width={300}
                    height={87}
                    className="w-[min(75%,300px)] h-auto"
                    priority
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Navbar;

