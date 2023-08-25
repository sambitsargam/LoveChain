import React, { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import {
  Modal,
  Input,
  Row,
  Checkbox,
  Button,
  Text,
  Loading,
  Textarea,
} from "@nextui-org/react";

import { AuthContext } from "../utils/AuthProvider";
import PageTitle from "../components/Typography/PageTitle";
import SectionTitle from "../components/Typography/SectionTitle";
import CTA from "../components/CTA";
import {} from "@windmill/react-ui";
import PONK from "../assets/img/irupus.png";
import { ellipseAddress } from "../lib/utilities";
function Buttons() {
  const { address, signer, connect } = useContext(AuthContext);
  const [visible, setVisible] = React.useState(false);
  const [visible2, setVisible2] = React.useState(false);
  const [userstatus, setuserstatus] = useState("");
  const [imageurl, setimageurl] = useState("");
  const [name, setname] = useState("");
  const [gender, setgender] = useState("");
  const [year, setyear] = useState("");
  const [country, setcountry] = useState("");
  const [profile, setprofile] = useState("");
  const [isloading, setisloading] = useState(false);
  const [amount, setamount] = useState("");
  const [users, setusers] = useState([]);
  const [userid, setuserid] = useState("");
  const handler = () => setVisible(true);
  const closeHandler = () => {
    setVisible(false);
    console.log("closed");
  };
  const closeHandler2 = () => {
    setVisible2(false);
    console.log("closed");
  };

  async function fetchUsersWithENSNames() {
    const data = await signer?.fetchAllUsers();
    if (data) {
      // Check if data is defined
      const usersWithENSNames = await Promise.all(
        data.map(async (user) => {
          const ensName = await getENSName(user._address);
          return {
            ...user,
            ensName: ensName,
          };
        })
      );
      setusers(usersWithENSNames);
    }
  }

  async function isUserRegistered() {
    const data = await signer?.isRegistered();
    setuserstatus(data);
  }

  async function allUsers() {
    const data = await signer?.fetchAllUsers();
    setusers(data);
    console.log(data);
    // setuserstatus(data);
  }
  useEffect(() => {
    isUserRegistered();
        fetchUsersWithENSNames();
    allUsers();
  }, [signer]);

  //let create a function to fetch any address's ens name
  async function getENSName(addrs) {
          const apiUrl = `https://ensdata.net/${addrs}`;
          const response = await fetch(apiUrl);
          const data = await response.json();
          console.log(data.ens);
          return data.ens;
  }

  const onAddProfile = async () => {
    let transaction = await signer.createProfile(
      imageurl,
      name,
      profile,
      gender,
      year,
      country
    );
    setisloading(true);
    let txReceipt = await transaction.wait();
    setisloading(false);
    setVisible(false);
  };

  const onTipUser = async () => {
    const amount_ = ethers.utils.parseUnits(amount, "ether");
    let transaction = await signer.tipUser(userid, {
      value: amount_,
    });
    setisloading(true);
    let txReceipt = await transaction.wait();
    setisloading(false);
    setVisible(false);
  };
  return (
    <>
      {/* {isUserRegistered() == false ? setVisible(true) : setVisible(false)} */}
      {/* <Button onClick={handler}>Open modal</Button> */}
      {userstatus == false ? (
        <Button color="gradient" onClick={handler} className="mt-6">
          Add Profile
        </Button>
      ) : (
        ""
      )}

      <Modal
        closeButton
        blur
        aria-labelledby="modal-title"
        open={visible}
        onClose={closeHandler}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Add a profile <Text b size={18}></Text>
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Input
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            required
            value={name}
            onChange={(e) => {
              setname(e.target.value);
            }}
            placeholder="Enter your name"
          />
          <Input
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            required
            value={imageurl}
            onChange={(e) => {
              setimageurl(e.target.value);
            }}
            placeholder="place image url here"
          />
          <select
            fullWidth
            color="primary"
            size="xl"
            value={gender} // Assuming you have a 'gender' state for the selected value
            required
            onChange={(e) => {
              setgender(e.target.value); // Assuming you have a 'setGender' function
            }}
            placeholder=""
          >
            <option value="U">Select your Gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="Other">Other</option>
          </select>

          <Input
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            value={year}
            required
            onChange={(e) => {
              setyear(e.target.value);
            }}
            placeholder="How Old are you?"
          />
          <Input
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            required
            value={country}
            onChange={(e) => {
              setcountry(e.target.value);
            }}
            placeholder="Where are you from?"
          />
          <Textarea
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            value={profile}
            required
            onChange={(e) => {
              setprofile(e.target.value);
            }}
            placeholder="tell us something interesting about yourself"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onClick={closeHandler}>
            Close
          </Button>
          <Button
            auto
            onClick={() => {
              onAddProfile();
            }}
          >
            {isloading ? (
              <Loading size="xs" color="white" className="pr-4" />
            ) : (
              ""
            )}
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        closeButton
        blur
        aria-labelledby="modal-title"
        open={visible2}
        onClose={closeHandler2}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Enter an amount <Text b size={18}></Text>
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Input
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            required
            value={amount}
            onChange={(e) => {
              setamount(e.target.value);
            }}
            placeholder="Enter amount(avax)"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onClick={closeHandler2}>
            Close
          </Button>
          <Button
            auto
            onClick={() => {
              onTipUser();
            }}
          >
            {isloading ? (
              <Loading size="xs" color="white" className="pr-4" />
            ) : (
              ""
            )}
            Add
          </Button>
        </Modal.Footer>
      </Modal>
      <PageTitle>Available Profiles</PageTitle>

      <form className="mb-4">
        <label
          for="default-search"
          class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300"
        >
          Search
        </label>
        <div class="relative">
          <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
            <svg
              aria-hidden="true"
              class="w-5 h-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            class="block p-3 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none"
            placeholder="Search Users"
            required=""
          />
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {users?.map((user) => (
          <div
            key={user.id} // Make sure to use a unique key for each mapped element
            className="overflow-hidden border border-gray-200 rounded-lg grid grid-cols-1 group sm:grid-cols-3"
          >
            <div className="relative">
              <img
                className="absolute inset-0 object-cover w-full h-full"
                src={user.image}
                alt=""
              />
            </div>

            <div className="p-8 sm:col-span-1 lg:col-span-2">
              {" "}
              {/* adding a emoji to the right corner */}
             

              {/* Use lg:col-span-2 to span both columns on larger screens */}
              <h5 className="mt-1 font-bold text-2xl dark:text-gray-300">
                {user.name} ({user.gender})
              </h5>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-200">
                {user.ensName ? user.ensName : ".."}
              </p>
              <p className="mt-3 text-xl text-gray-500 dark:text-gray-200">
                📍 {user.country} {user.year} Years Old
              </p>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-200">
                {user.profile}
              </p>
              <br></br>
              <ul className="flex space-x-2">
                <li
                  onClick={() => {
                    setVisible2(true);
                    setuserid(user.id.toString());
                  }}
                  className="inline-block px-3 py-1 text-xxl font-semibold text-white bg-blue-600 rounded-full"
                >
                  Tip
                </li>
              </ul>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-200">
                {ethers.utils.formatEther(user.balance.toString())} AVAX
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Buttons;
