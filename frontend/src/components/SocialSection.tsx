import React from "react";
import { motion } from "framer-motion";
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaFacebook,
  FaLinkedin,
} from "react-icons/fa";
import Image from "next/image";
import img1 from "/public/images/social/img1.jpeg";
import img2 from "/public/images/social/img2.jpeg";
import img3 from "/public/images/social/img3.jpeg";
import img4 from "/public/images/social/img4.jpeg";
import img5 from "/public/images/social/img5.jpeg";
import img6 from "/public/images/social/img6.jpeg";

const imgData = [img1, img2, img3, img4, img5, img6];

const SocialSection = () => {
  return (
    <div className="bg-black w-full text-white flex flex-col gap-24 py-20 my-20">
      {/* Title */}
      <div className="p-4">
        <h1 className="text-center text-8xl font-bold">
          Explore, Share, Connect
        </h1>
      </div>

      {/* Image Grid & Subscribe Section */}
      <div className="flex justify-evenly">
        {/* Image Grid */}
        <div className="w-2/3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-14">
          {imgData.map((img, index) => (
            <motion.div
              key={index}
              className="w-[300px] h-[300px] overflow-hidden rounded-lg border-2 border-[#A31C44]"
              whileHover={{
                filter: "grayscale(0%)",
                transition: { duration: 0.5 },
              }}
              initial={{ filter: "grayscale(100%)" }}
            >
              <Image
                src={img}
                alt="Social Image"
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>

        {/* Subscribe & Social Media Section */}
        <div className="w-1/3 flex flex-col mt-40 items-center gap-10">
          {/* Subscribe Button */}
          <button className="px-6 py-3 bg-[#A31C44] text-white font-bold rounded-lg hover:bg-y[#A31C44] transition">
            Subscribe
          </button>

          {/* Social Media Icons */}
          <div className="flex gap-4 text-3xl">
            <FaInstagram className="hover:text-[#A31C44] transition cursor-pointer" />
            <FaTiktok className="hover:text-[#A31C44] transition cursor-pointer" />
            <FaYoutube className="hover:text-[#A31C44] transition cursor-pointer" />
            <FaFacebook className="hover:text-[#A31C44] transition cursor-pointer" />
            <FaLinkedin className="hover:text-[#A31C44] transition cursor-pointer" />
          </div>

          <p className="text-xl text-center max-w-md leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla
            dolorum necessitatibus quas rerum tempore dolore corrupti velit
            incidunt harum iste minus molestias ipsa fuga facere, nostrum eius
            blanditiis omnis doloribus aspernatur sapiente aperiam ratione
            voluptatibus, illum nam. Nihil, ex. Dolorem?
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialSection;
