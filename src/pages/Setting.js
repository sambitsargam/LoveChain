/* eslint-disable no-unused-vars */
import React, { useState, useContext } from "react";
import { WindmillContext } from "@windmill/react-ui";
import PageTitle from "../components/Typography/PageTitle";
import { SidebarContext } from "../context/SidebarContext";
import { MoonIcon, SunIcon } from "../icons";
import { Input } from "@windmill/react-ui";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

function Settings() {
 

  const { mode, toggleMode } = useContext(WindmillContext);
  const { toggleSidebar } = useContext(SidebarContext);
  
  return (
    <>
      <PageTitle>Settings</PageTitle>

      <p className="dark:text-white pb-2">Display</p>
      <hr />
      <div
        className="flex py-4 mb-6 cursor-pointer rounded-md focus:outline-none focus:shadow-outline-blue"
        onClick={toggleMode}
        aria-label="Toggle color mode"
      >
        {mode === "dark" ? (
          <div className="flex flex-row items-center space-x-2">
            <p className="dark:text-white text-lg">Dark Mode</p>
            <SunIcon className="w-6 h-6 text-white" />
          </div>
        ) : (
          <div className="flex flex-row items-center space-x-2">
            <p className="dark:text-white text-lg">Light Mode</p>
            <MoonIcon className="w-6 h-6" />
          </div>
        )}
      </div>
      <p className="dark:text-white pb-2">Connected Wallet</p>
      <hr />
Todo : Add wallet connect
    </>
  );
}

export default Settings;
