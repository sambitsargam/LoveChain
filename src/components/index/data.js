import React from "react";
import {
  ChartBarSquareIcon,
  CursorArrowRippleIcon,
  DevicePhoneMobileIcon,
  AdjustmentsVerticalIcon,
  SunIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import benefitTwoImg from "../../assets/2.svg";
import benefitOneImg from "../../assets/3.svg";

const benefitOne = {
  title: "Dating",
  image: benefitTwoImg,
  bullets: [
    {
      title: "Connect with Others",
      desc: "Find and connect with potential partners.",
      icon: <IdentificationIcon />,
    },
    {
      title: "Verified Profiles",
      desc: "Profiles linked through  Ens Domain for added authenticity.",
      icon: <ChartBarSquareIcon />,
    },
    {
      title: "Secure Chats",
      desc: "Enjoy private conversations with verified users.",
      icon: <CursorArrowRippleIcon />,
    },
  ],
};

const benefitTwo = {
  title: "And even more with LoveChain...",
  image: benefitOneImg,
  bullets: [
    {
      title: "NFT Token",
      desc: "Mint NFT directly from files saved on LoveChain ",
      icon: <DevicePhoneMobileIcon />,
    },
    {
      title: "Chat",
      desc: "Send messages with anyone you want using LoveChain but you have to pay for it.",
      icon: <AdjustmentsVerticalIcon />,
    },
    {
      title: "Hybrid Storage ",
      desc: "You can host Web3storage servers and Linked throgh Spruce id's Kepler for free. ",
      icon: <SunIcon />,
    },
  ],
};

export { benefitOne, benefitTwo };
