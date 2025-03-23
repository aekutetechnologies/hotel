import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CgDetailsMore } from "react-icons/cg";
import { RxCross2 } from "react-icons/rx";
import Image from "next/image";
import { ProfileDropdown } from "./profile-dropdown";
import { NewButton } from "./ui/new-button";
import { LogIn } from "lucide-react";

const Navbar = ({ isLoggedIn, userName }) => {
  const [navModal, setNavModal] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("permissions");
  };

  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      console.log("Scroll event detected");
      console.log(window.scrollY);

      setShowSearch(window.scrollY > 600); // Show Nav2 after scrolling 600px
    };

    console.log("Adding scroll event listener");
    window.addEventListener("scroll", handleScroll);
    return () => {
      console.log("Removing scroll event listener");
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <motion.div
      className={`fixed top-10 left-0 max-w-[95rem] w-[170%] z-50 shadow-lg text-black 
      ${
        navModal ? "bg-gradient-to-r from-violet-200 to-pink-200" : "bg-white"
      }`}
      initial={{ height: "70px" }}
      animate={{ height: navModal ? "100vh" : "70px" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Navbar Top Section */}
      <div className="flex justify-between items-center mx-10 py-3">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => setNavModal(!navModal)}
            animate={{ rotate: navModal ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {navModal ? <RxCross2 size={24} /> : <CgDetailsMore size={24} />}
          </motion.button>
          <Image
            src="/logo.png"
            alt="Hsquare Logo"
            width={140}
            height={40}
            className="md:w-40 md:h-[calc(40*40/140)] w-24 h-[calc(24*40/140)]"
            priority
          />
        </div>

        <div className="hidden sm:flex items-center gap-5">
          {isLoggedIn ? (
            <ProfileDropdown userName={userName} onLogout={handleLogout} />
          ) : (
            <NewButton variant="default" size="sm">
              <LogIn className="w-5 h-5 mr-2" />
              <span>Login</span>
            </NewButton>
          )}
        </div>
      </div>

      {/* Expanding Navigation Links */}
      <AnimatePresence>
        {navModal && (
          <motion.div
            className="flex flex-col items-center gap-5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-full max-w-[1400px] h-[650px] bg-opacity-90 p-6 rounded-lg flex">
              {/* Left Section - Navigation Links */}
              <div className="w-full max-w-[1400px] h-[650px]  bg-opacity-90 p-6 flex">
                {/* Left Section - Navigation Links */}
                <div className="w-1/2 flex flex-col justify-center gap-4">
                  <p className="px-5 py-2 w-1/2 hover:bg-gradient-to-b from-[#A31C44] to-[#7A1533] hover:text-white text-5xl rounded-3xl">
                    Home
                  </p>
                  <p className="px-5 py-2 w-1/2 hover:bg-gradient-to-b from-[#A31C44] to-[#7A1533] hover:text-white text-5xl rounded-3xl">
                    About
                  </p>
                  <p className="px-5 py-2 w-1/2 hover:bg-gradient-to-b from-[#A31C44] to-[#7A1533] hover:text-white text-5xl rounded-3xl">
                    Blog
                  </p>
                  <p className="px-5 py-2 w-1/2 hover:bg-gradient-to-b from-[#A31C44] to-[#7A1533] hover:text-white text-5xl rounded-3xl">
                    Hotel
                  </p>
                  <p className="px-5 py-2 w-1/2 hover:bg-gradient-to-b from-[#A31C44] to-[#7A1533] hover:text-white text-5xl rounded-3xl">
                    Login
                  </p>
                  <p className="px-5 py-2 w-1/2 hover:bg-gradient-to-b from-[#A31C44] to-[#7A1533] hover:text-white text-5xl rounded-3xl">
                    Contact Us
                  </p>
                </div>

                {/* Right Section - Image */}
                <div className="w-1/2 flex justify-center items-center">
                  <Image
                    // src="/images/hotel3d2.jpg"
                    src="/logo.png"
                    alt="Hsquare Logo"
                    width={140}
                    height={40}
                    className="md:w-40 md:h-[calc(40*40/140)] w-24 h-[calc(24*40/140)]"
                    priority
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Navbar;