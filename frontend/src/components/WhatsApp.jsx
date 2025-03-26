"use client";

import React,{useState} from "react";
import whatsapp from '/public/whatsapp.png'
import Image from "next/image";
import { motion } from "framer-motion";

const WhatsApp = () => {
  const [hovered,setHovered] = useState(false)

  return (
    <motion.div
      className="fixed bottom-0 mb-12 flex justify-center items-center gap-2 right-8 p-3 bg-white shadow-black shadow-2xl rounded-full  z-50  text-black cursor-pointer"
      initial={{ width: "4rem" }}
      animate={{ width: hovered ? "12rem" : "4rem" }}
      transition={{ type: "spring", stiffness: 200, damping: 10 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)} 
    >
      <Image src={whatsapp} alt="WhatsApp" width={40} height={40} className="w-10 h-10" />
       {hovered && (
        <motion.span
          className="whitespace-nowrap text-black text-lg font-semibold"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          Chat with us
        </motion.span>
      )}
    </motion.div>
  );
};

export default WhatsApp;


//   return (
//     <motion.div
//       className="fixed bottom-12 right-8 flex items-center gap-2 bg-yellow-400 shadow-lg rounded-full p-3 z-50 cursor-pointer overflow-hidden"
//       initial={{ width: "3rem" }}
//       animate={{ width: hovered ? "12rem" : "3rem" }}
//       transition={{ type: "spring", stiffness: 200, damping: 10 }}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//     >
//       <Image src={whatsapp} alt="WhatsApp" width={40} height={40} className="w-10 h-10" />
//       {hovered && (
//         <motion.span
//           className="whitespace-nowrap text-black text-lg font-semibold"
//           initial={{ opacity: 0, x: -10 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.2 }}
//         >
//           Chat with us
//         </motion.span>
//       )}
//     </motion.div>
//   );
// };

// export default WhatsApp;
