import { motion } from "framer-motion";
import PropTypes from "prop-types";
import {
  FaInstagram,
  FaFacebook,
  FaLinkedin,
} from "react-icons/fa";
import Link from "next/link";

interface FooterProps {
  sectionType: "hotels" | "hostels";
}

const Footer = ({ sectionType }: FooterProps) => {
  return (
    <footer
      className={`text-white py-6 ${
        sectionType === "hotels" ? "bg-[#A31C44]" : "bg-[#343F52]"
      }`}
    >
      <div className="container mx-auto px-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-items-center"
        >
          {/* About Us */}
          <div className="max-w-xs">
            <h4 className="font-bold text-base mb-2 border-b border-white/20 pb-1">About Us</h4>
            <p className="text-gray-200 text-xs leading-relaxed">
              {sectionType === "hotels"
                ? "At HSquare Living, we are more than just a team; we are a closely-knit family of handpicked individuals, each possessing exceptional expertise and a shared passion for excellence. Discover luxury and comfort with our carefully curated selection of premium hotels across India."
                : "At HSquare Living, we are more than just a team; we are a closely-knit family of handpicked individuals, each possessing exceptional expertise and a shared passion for excellence. Experience vibrant and affordable stays with our network of social hostels designed for modern travelers."}
            </p>
            
            {/* Social Media Icons */}
            <div className="flex flex-wrap gap-3 mt-3 text-lg">
              <motion.a 
                href="https://www.instagram.com/hsquareliving/" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ y: -3, scale: 1.1 }} 
                whileTap={{ scale: 0.9 }}
              >
                <FaInstagram
                  className={`cursor-pointer transition-all duration-300 ${
                    sectionType === "hotels" ? "hover:text-pink-300" : "hover:text-white"
                  }`}
                />
              </motion.a>
              <motion.a 
                href="https://www.facebook.com/profile.php?id=100093746289256&mibextid=LQQJ4d" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ y: -3, scale: 1.1 }} 
                whileTap={{ scale: 0.9 }}
              >
                <FaFacebook
                  className={`cursor-pointer transition-all duration-300 ${
                    sectionType === "hotels" ? "hover:text-pink-300" : "hover:text-white"
                  }`}
                />
              </motion.a>
              <motion.a 
                href="https://www.linkedin.com/company/hsquare-living/" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ y: -3, scale: 1.1 }} 
                whileTap={{ scale: 0.9 }}
              >
                <FaLinkedin
                  className={`cursor-pointer transition-all duration-300 ${
                    sectionType === "hotels" ? "hover:text-pink-300" : "hover:text-white"
                  }`}
                />
              </motion.a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-base mb-2 border-b border-white/20 pb-1">Quick Links</h4>
            <ul className="space-y-1 text-gray-200 text-xs">
              <motion.li 
                whileHover={{ x: 5 }}
                className="cursor-pointer hover:text-white transition-all duration-200"
              >
                <Link href="/careers">Careers</Link>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                className="cursor-pointer hover:text-white transition-all duration-200"
              >
                <Link href="/refund-policy">Refund Policy</Link>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                className="cursor-pointer hover:text-white transition-all duration-200"
              >
                <Link href="/cancellation-policy">Cancellation Policy</Link>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                className="cursor-pointer hover:text-white transition-all duration-200"
              >
                <Link href="/terms-and-conditions">Terms & Conditions</Link>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                className="cursor-pointer hover:text-white transition-all duration-200"
              >
                <Link href="/privacy-policy">Privacy Policy</Link>
              </motion.li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-bold text-base mb-2 border-b border-white/20 pb-1">Contact</h4>
            <ul className="space-y-1 text-gray-200 text-xs">
              <li className="flex items-center gap-2 hover:text-white transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>booking@hsquareliving.com</span>
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+919090151524</span>
              </li>
              <li className="flex items-start gap-2 hover:text-white transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="leading-tight">4R8P+FHV, Juhu Galli, above Tata Motors Showroom, Mahavi Darshan, Dhangar wadi, Andheri West, Mumbai, Maharashtra 400049</span>
              </li>
            </ul>
          </div>
        </motion.div>
        
        {/* Footer Bottom */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="border-t border-gray-700 mt-4 pt-3 text-center text-gray-300"
        >
          <p className="text-xs">&copy; {new Date().getFullYear()} HSquare Living. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  sectionType: PropTypes.string.isRequired,
};

export default Footer;
