import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaFacebook,
  FaLinkedin,
} from "react-icons/fa";
import Image from "next/image";
// import img1 from "/public/images/social/img1.jpeg";
import img2 from "/public/images/social/img2.jpeg";
import img3 from "/public/images/social/img3.jpeg";
import img4 from "/public/images/social/img4.jpeg";
import img5 from "/public/images/social/img5.jpeg";
// import img6 from "/public/images/social/img6.jpeg";
import esc from "/public/images/social/esc.jpg";
import hsqure from "/public/images/social/hsqure.jpg";
import hoteldayss from "/public/images/social/hotel_dayss.png";
import hosteldayss from "/public/images/social/hostel_dayss.png";

import socialh1 from "/public/images/social/socialh1.jpg";
import socialh2 from "/public/images/social/socialh2.jpg";
import socialh3 from "/public/images/social/socialh3.jpg";
import socialh4 from "/public/images/social/socialh4.jpg";
import socialh5 from "/public/images/social/socialh5.jpg";
import socialh6 from "/public/images/social/socialh6.jpg";

const hostelImg = [hsqure, esc, img3, img4, img5, img2];

const hotelImg = [socialh1, socialh2, socialh3, socialh4, socialh5, socialh6];

interface socialSectionProps {
  type: "hotel" | "hostel";
}

const SocialSection = ({ type = "hotel" }: socialSectionProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const images = type === "hotel" ? hotelImg : hostelImg;
  return (
    // <div className=" w-full text-black flex flex-col gap-10 py-1 my-20 bg-gradient-to-r from-[#bfa8af] via-[#b95372] to-[#7A1533]">
    <div
      className={` w-full text-white flex flex-col gap-10 py-5 my-20  ${
        type === "hotel" ? "bg-[#A31C44]" : "bg-[#2A2B2E]"
      }`}
    >
      {/* Title */}
      <div className="p-4">
        {/* {type === "hostel" && (
          <h1
            className={`text-center text-8xl font-bold ${
              isHovered ? "text-[#A31C44]" : "text-white"
            }`}
          >
            Explore, Share, Connect
          </h1>
        )} */}
      </div>

      {/* Image Grid & Subscribe Section */}
      <div className="flex justify-evenly items-center  gap-10 mx-20 ">
        {/* Image Grid */}
        <div className="w-2/3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ">
          {images.map((img, index) => (
            <motion.div
              key={index}
              className="w-[250px] h-[250px] overflow-hidden rounded-lg border-2 border-[#A31C44]"
              whileHover={{
                filter: "grayscale(0%)",
                transition: { duration: 0.5 },
              }}
              initial={{ filter: "grayscale(100%)" }}
              onMouseEnter={() => img === esc && setIsHovered(true)}
              onMouseLeave={() => img === esc && setIsHovered(false)}
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
        <div className="w-1/3 flex flex-col mt-0 items-center gap-5 justify-evenly">
          {/* Subscribe Button */}
          {/* <button
            className={`px-6 py-3 ] text-white font-bold rounded-lg hover:bg-y[#A31C44] transition ${
              type === "hotel" ? "bg-[#2A2B2E]" : "bg-[#A31C44]"
            }`}
          >
            Subscribe
          </button> */}

          {/* Social Media Icons */}
          {/* <div className="flex gap-4 text-3xl">
            <FaInstagram
              className={` transition cursor-pointer ${
                type == "hotel" ? "hover:text-black" : "hover:text-[#A31C44] "
              }`}
            />
            <FaTiktok
              className={` transition cursor-pointer ${
                type == "hotel" ? "hover:text-black" : "hover:[#A31C44] "
              }`}
            />
            <FaYoutube
              className={` transition cursor-pointer ${
                type == "hotel" ? "hover:text-black" : "hover:[#A31C44] "
              }`}
            />
            <FaFacebook
              className={` transition cursor-pointer ${
                type == "hotel" ? "hover:text-black" : "hover:text-[#A31C44] "
              }`}
            />
            <FaLinkedin
              className={` transition cursor-pointer ${
                type == "hotel" ? "hover:text-black" : "hover:text-[#A31C44] "
              }`}
            />
          </div> */}

          {type === "hostel" ? (
            <Image
              src={hosteldayss}
              alt="hostel image"
              className="w-full h-full object-cover "
            />
          ) : (
            <Image
              src={hoteldayss}
              alt="hostel image"
              className="w-full h-full object-cover "
            />
          )}

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
