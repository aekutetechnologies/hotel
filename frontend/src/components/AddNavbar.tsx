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
      className={`w-full px-4 max-w-[100vw] overflow-x-hidden h-[40px] z-[60] ${
        type === "hotel"
          ? "bg-[#B21D46]"
          : "bg-[#A31C44]"
      }`}
      initial={{ x: -2 }}
      animate={{ x: [0, -3, 3, -3, 3, 0] }}
      transition={{ duration: 0.5, ease: "easeInOut", repeat: 1 }}
    >
      <div className="max-w-screen-2xl mx-auto w-full h-full">
        <section className="flex justify-center items-center text-white font-semibold text-sm md:text-base lg:text-lg gap-2 font-sans h-full">
          <motion.div
            animate={{ rotate: [-5, 5, -5, 5, 0] }}
            transition={{ duration: 0.5, repeat: 1, ease: "easeInOut" }}
          >
            <MdLocalOffer className="text-yellow-300 text-xl md:text-2xl lg:text-3xl" />
          </motion.div>
          <span className="font-medium tracking-wide">Best Rate available on our website</span>
        </section>
      </div>
    </motion.div>
  );
};

export default AddNavbar;
