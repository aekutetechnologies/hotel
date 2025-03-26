import React, { useState } from "react";
import { motion } from "framer-motion";
import { MdLocalOffer } from "react-icons/md";
import { IoClose } from "react-icons/io5";

interface AddNavbarProps {
  type: "hotel" | "hostel";
  onClose: () => void;
}

const AddNavbar = ({ type, onClose }: AddNavbarProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null; // Hide the navbar when closed

  return (
    <motion.div
      className={`w-full relative px-4 ${
        type === "hotel"
          ? "bg-gradient-to-r from-[#b95372] via-[#7A1533] to-[#b95372]"
          : "bg-gradient-to-r from-slate-400 via-slate-700 to-slate-400"
      }`}
      initial={{ x: -2 }}
      animate={{ x: [0, -3, 3, -3, 3, 0] }}
      transition={{ duration: 0.5, ease: "easeInOut", repeat: 1 }}
    >
      <div className="max-w-screen-2xl mx-auto">
        <section className="flex justify-center items-center text-white font-semibold py-2 text-sm md:text-base lg:text-lg gap-2 font-sans">
          <motion.div
            animate={{ rotate: [-5, 5, -5, 5, 0] }}
            transition={{ duration: 0.5, repeat: 1, ease: "easeInOut" }}
          >
            <MdLocalOffer className="text-yellow-300 text-xl md:text-2xl lg:text-3xl" />
          </motion.div>
          <span className="font-medium tracking-wide">Best Rate available on our website</span>
        </section>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-xl md:text-2xl lg:text-3xl focus:outline-none hover:opacity-80 transition-opacity"
        >
          <IoClose />
        </button>
      </div>
    </motion.div>
  );
};

export default AddNavbar;
