"use client"

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CgDetailsMore } from "react-icons/cg";
import { RxCross2 } from "react-icons/rx";
import Image from "next/image";
import { ProfileDropdown } from "./profile-dropdown";
import { NewButton } from "./ui/new-button";
import { LogIn } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  isLoggedIn: boolean;
  userName: string;
  handleLogout: () => void;
  handleLoginClick: () => void;
  setShowDetailSection: (section: string) => void;
  isClosed: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  isLoggedIn,
  userName,
  handleLogout,
  handleLoginClick,
  setShowDetailSection,
  isClosed,
}) => {
  const [navModal, setNavModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowSearch(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <motion.div
      className={`fixed left-0 right-0 w-full z-50 shadow-lg text-black 
      ${
        navModal ? "bg-gradient-to-r from-violet-200 to-pink-200" : "bg-white"
      }`}
      initial={{ height: "70px" }}
      animate={{ height: navModal ? "100vh" : "70px", top: isClosed ? "10" : '0' }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="flex justify-between items-center px-4 md:px-10 py-3 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => setNavModal(!navModal)}
            animate={{ rotate: navModal ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {navModal ? <RxCross2 size={24} /> : <CgDetailsMore size={24} />}
          </motion.button>
          <Link href="/" onClick={() => window.location.reload()}>
            <Image
              src="/logo.png"
              alt="Hsquare Logo"
              width={140}
              height={40}
              className="md:w-40 md:h-[calc(40*40/140)] w-24 h-[calc(24*40/140)]"
              priority
            />
          </Link>
        </div>

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

      <AnimatePresence>
        {navModal && (
          <motion.div
            className="flex flex-col items-center gap-5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-full h-[650px] bg-opacity-90 p-6 rounded-lg flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 flex flex-col justify-center gap-4">
                <p className="px-5 py-2 md:w-1/2 hover:bg-gradient-to-b from-[#A31C44] to-[#7A1533] hover:text-white text-3xl md:text-5xl rounded-3xl cursor-pointer">
                  <Link href="/" onClick={() => window.location.reload()}>
                    {" "}
                    Home
                  </Link>
                </p>
                <p className="px-5 py-2 md:w-1/2 hover:bg-gradient-to-b from-[#A31C44] to-[#7A1533] hover:text-white text-3xl md:text-5xl rounded-3xl cursor-pointer">
                  <Link href="/"> Blog</Link>
                </p>
                <p className="px-5 py-2 md:w-1/2 hover:bg-gradient-to-b from-[#A31C44] to-[#7A1533] hover:text-white text-3xl md:text-5xl rounded-3xl cursor-pointer">
                  <Link href="/"> Hotel</Link>
                </p>
                <p className="px-5 py-2 md:w-1/2 hover:bg-gradient-to-b from-[#A31C44] to-[#7A1533] hover:text-white text-3xl md:text-5xl rounded-3xl cursor-pointer">
                  <Link href="/"> Contact Us</Link>
                </p>
              </div>
              <div className="w-full md:w-1/2 flex justify-center items-center mt-8 md:mt-0">
                <Image
                  src="/logo.png"
                  alt="Hsquare Logo"
                  width={140}
                  height={40}
                  className="md:w-60 md:h-[calc(60*40/140)] w-40 h-[calc(40*40/140)]"
                  priority
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Navbar;
