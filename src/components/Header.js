/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useContext, useEffect, useState } from "react";
import { SidebarContext } from "../context/SidebarContext";
import { AuthContext } from "../utils/AuthProvider";
import { Button } from "@nextui-org/react";
import { SearchIcon, MoonIcon, SunIcon, MenuIcon } from "../icons";
import { Input, WindmillContext } from "@windmill/react-ui";

function Header() {
  const { mode, toggleMode } = useContext(WindmillContext);
  const { toggleSidebar } = useContext(SidebarContext);
  const { address, connect, disconnect, web3Provider } =
    useContext(AuthContext);

  const [avatar, setAvatar] = useState('');
  const [ens, setENS] = useState('');

  //fetch the address from local storage
  const addr = localStorage.getItem("address");
  const apiUrl = `https://ensdata.net/${addr}`;

  useEffect(() => {
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        setAvatar(data.avatar);
        setENS(data.ens);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  console.log("avatar", avatar);
  console.log("ens", ens);

  return (
    <header className="z-30 w-full py-4 bg-white shadow-bottom dark:bg-gray-800">
      <div className="container flex items-center justify-between h-full px-6 mx-auto text-blue-600 dark:text-blue-300">
        {/* <!-- Mobile hamburger --> */}
        <button
          className="p-1 mr-5 -ml-1 rounded-md lg:hidden focus:outline-none focus:shadow-outline-blue"
          onClick={toggleSidebar}
          aria-label="Menu"
        >
          <MenuIcon className="w-6 h-6" aria-hidden="true" />
        </button>
        {/* <!-- Search input --> */}
        <div className="flex justify-center flex-1 lg:mr-32">
          <div className="relative w-full max-w-xl mr-6 rounded-lg focus-within:text-blue-500">
            <div className="absolute inset-y-0 flex items-center pl-2">
              <SearchIcon className="w-4 h-4" aria-hidden="true" />
            </div>
            <Input
              className="pl-8 text-gray-700"
              placeholder="Search for files"
              aria-label="Search"
            />
          </div>
        </div>
        <ul className="flex items-center flex-shrink-0 space-x-6">
          {/* <!-- Theme toggler --> */}
          <li className="flex">
            <button
              className="rounded-md focus:outline-none focus:shadow-outline-blue"
              onClick={toggleMode}
              aria-label="Toggle color mode"
            >
              {mode === "dark" ? (
                <SunIcon className="w-5 h-5" aria-hidden="true" />
              ) : (
                <MoonIcon className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </li>
          

          {avatar === undefined || !address ? (
              <img
                class=" hidden md:block  w-10 h-10 rounded-full shadow-lg"
                src={"https://api.dicebear.com/6.x/personas/svg?seed=Misty"}
                alt="Bonnie image"
              />
            ) : (
              <img
                class=" hidden md:block  w-10 h-10 rounded-full shadow-lg"
                src={avatar}
                alt="Bonnie image"
              />
            )}
          {ens === undefined || !address ? (<div className="text-gray-600 text-xl dark:text-gray-300">{address} </div>) :
              (<div className="text-gray-600 text-xl dark:text-gray-300">
                {ens}
              </div>)}

          <li className="flex flex-row items-center">
            {web3Provider ? (
             
              <Button
                onClick={() => {
                  disconnect();
                }}
                color="gradient"
                auto
                className="mr-2"
              >
                Disconnect
              </Button>
              
            ) : (
              <Button
                onClick={() => {
                  connect();
                }}
                color="gradient"
                auto
                className="mr-2"
              >
                Connect
              </Button>
            )}

            
          </li>
        </ul>
      </div>
    </header>
  );
}


export default Header;

