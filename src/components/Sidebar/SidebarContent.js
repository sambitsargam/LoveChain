/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import routes from "../../routes/sidebar";
import { NavLink, Route, Link } from "react-router-dom";
import * as Icons from "../../icons";
import SidebarSubmenu from "./SidebarSubmenu";
import { Button } from "@windmill/react-ui";
import ens from "../../assets/ens.svg"
import WS from "../../assets/img/ws.png";
import union from "../../assets/union.png"
import Logo from "../../assets/logo.png";
import SP from "../../assets/spp.png";
import ava from "../../assets/ava.svg";
import arb from "../../assets/arb.png";
import xmtp from "../../assets/xmtp.png";
function Icon({ icon, ...props }) {
  const Icon = Icons[icon];
  return <Icon {...props} />;
}  

function SidebarContent() {
  return (
    <div className="py-4 text-gray-500 dark:text-gray-400">
      <a
        className="ml-6 text-lg font-bold flex flex-row items-center
        space-x-3 text-gray-800 dark:text-gray-200"
        href="#"
      >
        <img src={Logo} className="h-8 pr-3" />
        LoveChain
        {/* <button className="bg-green-500 text-white text-lg px-4 rounded-full ml-4 py-1 mt-2">
          Disconnect
        </button> */}
      </a>
      <ul className="mt-6">
        {routes.map((route) =>
          route.routes ? (
            <SidebarSubmenu route={route} key={route.name} />
          ) : (
            <li className="relative px-6 py-3" key={route.name}>
              <NavLink
                exact
                to={route.path}
                className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
                activeClassName="text-gray-800 dark:text-gray-100"
              >
                <Route path={route.path} exact={route.exact}>
                  <span
                    className="absolute inset-y-0 left-0 w-1 bg-blue-600 rounded-tr-lg rounded-br-lg"
                    aria-hidden="true"
                  ></span>
                </Route>
                {/* <Icon
                  className="w-5 h-5"
                  aria-hidden="true"
                  icon={route.icon}
                  /> */}
                {route.icon}
                <span className="ml-4">{route.name}</span>
              </NavLink>
            </li>
          )
        )}
      </ul>
      <div className="px-6 my-6">
        <Link to="/app/dashboard">
          <button className="bg-blue-500 text-white text-md px-5 rounded-md py-2">
            Create Profile
            <span className="ml-2" aria-hidden="true">
              +
            </span>
          </button>
        </Link>
      </div>

      <hr />

      <div className="space-y-6 ml-6  mt-3">
        <div className="flex flex-row items-center space-x-2">
          <img src={SP} className="w-10 rounded-lg" />
          <p className="">Spruce Id</p>
        </div>
        <div className="flex flex-row mb-4 items-center space-x-2">
          <img src={ens} className="w-8" />
          <p>ENS Domain</p>
        </div>

        <div className="flex flex-row items-center space-x-2">
          <img src={union} className="w-8 rounded-lg" />
          <p className="">Union Fianace</p>
        </div>
        <div className="flex flex-row items-center space-x-2">
          <img src={ava} className="w-8 rounded-lg" />
          <p className="">Avalanche</p>
        </div>
        <div className="flex flex-row items-center space-x-2">
          <img src={arb} className="w-8 rounded-lg" />
          <p className="">Arbitrum</p>
        </div>
        <div className="flex flex-row items-center space-x-2">
          <img src={WS} className="w-8 rounded-lg" />
          <p className="">web3 storage</p>
        </div>
        <div className="flex flex-row items-center space-x-2">
          <img src={xmtp} className="w-8 rounded-lg" />
          <p className="">XMTP Protocol</p>
        </div>
      </div>
    </div>
  );
}

export default SidebarContent;
