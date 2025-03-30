import { motion } from "framer-motion";
import PropTypes from "prop-types";
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaFacebook,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";

interface FooterProps {
  sectionType: "hotels" | "hostels";
}

const Footer = ({ sectionType }: FooterProps) => {
  return (
    <footer
      className={`text-white py-12 ${
        sectionType === "hotels" ? "bg-[#A31C44]" : "bg-[#2A2B2E]"
      }`}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center"
        >
          {/* About Us */}
          <div className="max-w-xs">
            <h4 className="font-bold text-xl mb-4 border-b border-white/20 pb-2">About Us</h4>
            <p className="text-gray-200 leading-relaxed">
              {sectionType === "hotels"
                ? "Discover luxury and comfort with our carefully curated selection of premium hotels across India."
                : "Experience vibrant and affordable stays with our network of social hostels designed for modern travelers."}
            </p>
            
            {/* Social Media Icons */}
            <div className="flex flex-wrap gap-5 mt-6 text-2xl">
              <motion.div whileHover={{ y: -3, scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <FaInstagram
                  className={`cursor-pointer transition-all duration-300 ${
                    sectionType === "hotels" ? "hover:text-pink-300" : "hover:text-white"
                  }`}
                />
              </motion.div>
              <motion.div whileHover={{ y: -3, scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <FaTiktok
                  className={`cursor-pointer transition-all duration-300 ${
                    sectionType === "hotels" ? "hover:text-pink-300" : "hover:text-white"
                  }`}
                />
              </motion.div>
              <motion.div whileHover={{ y: -3, scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <FaYoutube
                  className={`cursor-pointer transition-all duration-300 ${
                    sectionType === "hotels" ? "hover:text-pink-300" : "hover:text-white"
                  }`}
                />
              </motion.div>
              <motion.div whileHover={{ y: -3, scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <FaFacebook
                  className={`cursor-pointer transition-all duration-300 ${
                    sectionType === "hotels" ? "hover:text-pink-300" : "hover:text-white"
                  }`}
                />
              </motion.div>
              <motion.div whileHover={{ y: -3, scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <FaTwitter
                  className={`cursor-pointer transition-all duration-300 ${
                    sectionType === "hotels" ? "hover:text-pink-300" : "hover:text-white"
                  }`}
                />
              </motion.div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-xl mb-4 border-b border-white/20 pb-2">Quick Links</h4>
            <ul className="space-y-3 text-gray-200">
              <motion.li 
                whileHover={{ x: 5 }}
                className="cursor-pointer hover:text-white transition-all duration-200"
              >
                {sectionType === "hotels" ? "Hotels" : "Hostels"}
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                className="cursor-pointer hover:text-white transition-all duration-200"
              >
                Locations
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                className="cursor-pointer hover:text-white transition-all duration-200"
              >
                Special Offers
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                className="cursor-pointer hover:text-white transition-all duration-200"
              >
                Contact Us
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                className="cursor-pointer hover:text-white transition-all duration-200"
              >
                Terms & Conditions
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                className="cursor-pointer hover:text-white transition-all duration-200"
              >
                Privacy Policy
              </motion.li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-bold text-xl mb-4 border-b border-white/20 pb-2">Contact</h4>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-center gap-2 hover:text-white transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@hsquare.com</span>
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+91 9876543210</span>
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>123 Travel Street, Mumbai, India</span>
              </li>
            </ul>
          </div>
        </motion.div>
        
        {/* Footer Bottom */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-300"
        >
          <p className="text-sm">&copy; 2024 HSquare. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  sectionType: PropTypes.string.isRequired,
};

export default Footer;
