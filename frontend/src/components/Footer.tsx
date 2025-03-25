import { motion } from "framer-motion";
import PropTypes from "prop-types";

const Footer = ({ sectionType }) => {
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
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
        >
          {/* About Us */}
          <div>
            <h4 className="font-bold mb-4">About Us</h4>
            <p className="text-gray-300">
              {sectionType === "hotels"
                ? "Discover luxury and comfort with our carefully curated selection of premium hotels."
                : "Experience vibrant and affordable stays with our network of social hostels."}
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li>{sectionType === "hotels" ? "Hotels" : "Hostels"}</li>
              <li>Locations</li>
              <li>Special Offers</li>
              <li>Contact Us</li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Email: info@hsquare.com</li>
              <li>Phone: +1 234 567 890</li>
              <li>Address: 123 Travel Street</li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h4 className="font-bold mb-4">Newsletter</h4>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 rounded-l-md flex-1 text-gray-900"
              />
              <button
                className={`px-4 py-2 rounded-r-md transition-colors ${
                  sectionType === "hotels"
                    ? "bg-[#7A1533] hover:bg-[#5A0F23]"
                    : "bg-[#1A1B1E] hover:bg-[#0A0B0E]"
                }`}
              >
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* Footer Bottom */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 HSquare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  sectionType: PropTypes.string.isRequired,
};

export default Footer;
