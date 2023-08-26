import React, { useContext } from "react";
import { AuthContext } from "../utils/AuthProvider";

const Finance = () => {
  const { address } = useContext(AuthContext);
  const webpageUrl = `https://union-lovechain.vercel.app/profile/eth:${address}`;

  const iframeStyles = {
    width: "100%",
    height: "100%",
    border: "none",
    margin: 0,
    padding: 0,
  };

  const containerStyles = {
    width: "117.4%",
    height: "100vh",
    overflow: "hidden",
  };

  return (
    <div style={containerStyles}>
      <iframe
        src={webpageUrl}
        title="Embedded Website"
        style={iframeStyles}
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default Finance;
