import React from "react";
import { motion } from "framer-motion";

const AddNavbar = () => {
  return (
    <motion.div
      className="max-w-[95rem] w-full bg-gradient-to-r from-red-500 to-yellow-400 px-4"
      initial={{ x: -2 }} // Small horizontal shake effect
      animate={{ x: [0, -3, 3, -3, 3, 0] }} // Vibrating motion
      transition={{ duration: 0.5, ease: "easeInOut", repeat: 1 }} // Runs once on load
    >
      <section className="flex justify-center text-white font-semibold py-2 text-sm md:text-base lg:text-lg">
        Best Rate available on our website
      </section>
    </motion.div>
  );
};

export default AddNavbar;
