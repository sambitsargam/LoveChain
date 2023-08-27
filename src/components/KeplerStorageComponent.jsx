/* eslint-disable no-useless-escape */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { SSX } from "@spruceid/ssx";
import React, { useState, useEffect, useContext } from "react";
import { FolderOpenIcon } from "@heroicons/react/24/solid";
import { useParams, useHistory, Link } from "react-router-dom";
import PageTitle from "../components/Typography/PageTitle";
// import { NFTStorage } from "https://cdn.jsdelivr.net/npm/nft.storage/dist/bundle.esm.min.js";
import { Web3Storage } from "web3.storage";
import axios from "axios";
import { Progress } from "@nextui-org/react";

// import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js.map";
import response from "../utils/demo/tableData";
import Modals from "../components/Modal/Modal";
import { Input, HelperText, Label, Select, Textarea } from "@windmill/react-ui";
import FileDetail from "../components/Modal/FileDetail";
import FileViewer from "react-file-viewer";
// import { CustomErrorComponent } from "custom-error";
import { AuthContext } from "../utils/AuthProvider";
// import { create as ipfsHttpClient } from "ipfs-http-client";
import prettyBytes from "pretty-bytes";
import DownloadLink from "react-download-link";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  TableBody,
  TableContainer,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TableFooter,
  Avatar,
  Badge,
  Pagination,
  Button,
} from "@windmill/react-ui";

import {
  PhotoIcon,
  GifIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  MusicalNoteIcon,
  PlusIcon,
  ServerIcon,
  CalendarIcon,
  ShieldCheckIcon,
  UserIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import Image1 from "../assets/img/create-account-office-dark.jpeg";
import Image2 from "../assets/img/create-account-office.jpeg";
import Image3 from "../assets/img/forgot-password-office-dark.jpeg";
import Image4 from "../assets/img/forgot-password-office.jpeg";
import WS from "../assets/img/ws.png";
import FolderCard from "./Cards/FolderCard";
import { ellipseAddress, timeConverter } from "../lib/utilities";
import { Loading } from "@nextui-org/react";

const KeplerStorageComponent = ({ ssx }) => {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [contentList, setContentList] = useState([]);
  const [viewingContent, setViewingContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, settoken] = useState("");
  let { foldername, id } = useParams();
  const [fileinfo, setfileinfo] = useState({});
  const [copied, setcopied] = useState(false);
  const [isloading, setisloading] = useState(false);
  const [isfileuploading, setisfileuploading] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [file, setFile] = useState("");
  const [filetype, setfiletype] = useState("");
  const [filesize, setfilesize] = useState("");
  const [files, setfiles] = useState([]);
  const [fileready, setfileready] = useState(false);
  const [fileModal, setFileModal] = useState(false);
  const [filename, setfilename] = useState(false);
  // pagination setup
  const resultsPerPage = 10;
  const totalResults = files?.length;

  // get address from local storage
  const address = localStorage.getItem("address");
  useEffect(() => {
    getContentList();
  }, []);

  const getContentList = async () => {
    setLoading(true);
    try {
      const { data } = await ssx.storage.list();
      const filteredData = data.filter((d) => d.includes('/content/'));
      console.log("filteredData", data);
      // filterdata=filteredData.remove
      setContentList(data);
    } catch (error) {
      console.error('Error fetching content list:', error);
    }
    setLoading(false);
  };

  function getOnlyName(s) {
    return s.replace('my-app/content/', '');
  }

  function getAccessToken() {
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGIyMDE1N0IyODJiMkQ5ZThFMzY5MjBGMDhiY0EyZkVhMzRmRTBmYjQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NzYyMjU5MjQ3MTEsIm5hbWUiOiJtZW50bGUifQ.wjCD8ygNde_wiV95BPDJFe7KvKcysTTwvz4RcDMwJEw";
  }

  function makeStorageClient() {
    return new Web3Storage({ token: getAccessToken() });
  }

  const handlePostContent = async (key, value) => {
    if (!key || !value) {
      alert('Invalid key or value');
      return;
    }
    console.log("key", key);
    setLoading(true);
    await ssx.storage.put(key, value);
    const formatedKey = 'content/' + key.replace(/\ /g, '_');
    setContentList((prevList) => [...prevList, `my-app/${formatedKey}`]);
    console.log("contentList", contentList);
    setKey('');
    setValue('');
    setLoading(false);
  };

  // pagination change control
  function onPageChange(p) {
    setPage(p);
  }

  let isActive = localStorage.getItem("isActive");

  const fileFormatIcon = (type) => {
    if (type == "pdf") {
      return <DocumentTextIcon className="h-8 text-red-500 pr-2" />;
    } else if (type == "mp3") {
      return <MusicalNoteIcon className="h-8 text-green-500 pr-2" />;
    } else if (type == "mp4") {
      return <VideoCameraIcon className="h-8 text-yellow-400 pr-2" />;
    } else {
      return <PhotoIcon className="h-8 text-blue-400 pr-2" />;
    }
  };

  async function onChangeCoverImage(e) {
    setisloading(true);
    const files = e.target.files[0];
    const client = makeStorageClient();
    const cid = await client.put([files]);
    console.log("stored files with cid:", cid);

    const res = await client.get(cid);
    console.log(`Got a response! [${res.status}] ${res.statusText}`);
    if (!res.ok) {
      throw new Error(
        `failed to get ${cid} - [${res.status}] ${res.statusText}`
      );
    }
    const filess = await res.files();
    setFile(`https://${cid}.ipfs.dweb.link/${files.name}`);
    // console.log(file);
    console.log(files);
    setisloading(false);
    const values = (`https://${cid}.ipfs.dweb.link/${files.name}`);
    for (const file of filess) {
      setfiletype(file.name);
      setfilesize(file.size);
      await handlePostContent(file.name, values);
      console.log(
        `${file.cid} -- ${file.path} -- ${file.size} -- ${file.name}`
      );
    }
    return cid;
  }

  const onError = (err) => {
    console.log("Error:", err); // Write your own logic
  };

  const handleGetContent = async (content) => {
    setLoading(true);
    const contentName = content.replace('my-app/', '');
    const { data } = await ssx.storage.get(contentName);
    setViewingContent(`${content}:\n${data}`);
    setfilename(contentName)
    setfileinfo(data);
    setLoading(false);
  };

  console.log("Viewing content:", viewingContent);

  const handleDeleteContent = async (content) => {
    setLoading(true);
    const contentName = content.replace('my-app/', '');
    await ssx.storage.delete(contentName);
    setContentList((prevList) => prevList.filter((c) => c !== content));
    setLoading(false);
  };


  function getExtension(file) {
    const filename = String(file); // Convert to string if not already
    return filename.split(".").pop();
  }




  return (
    <>
      <FileDetail
        title={"Details"}
        state={fileModal}
        onClick={() => {
          setFileModal(false);
        }}
        actionButtonDesktop={
          <div className="hidden sm:block">
            {/* <Button>Download</Button> */}
          </div>
        }
        actionButtonMobile={
          <div className="block w-full sm:hidden">
            {/* <DownloadLink
              label="Save"
              filename="myfile.txt"
              exportFile={() => "My cached data"}
            /> */}
            <DownloadLink filename={fileinfo}>
              {/* <Button block size="large">
                Download
              </Button> */}
            </DownloadLink>
          </div>
        }
      >
        <div className="mb-4">
          <CopyToClipboard
            text={fileinfo}
            onCopy={() => {
              setcopied(true);
            }}
          >
            <Button block size="small" layout="outline">
              {copied ? "Copied" : "Copy URL"}
            </Button>
            {/* <span>Copy to clipboard with span</span> */}
          </CopyToClipboard>
        </div>
        {/* <img src={Image1} className="rounded-lg" /> */}
        <div className="h-48 rounded-lg w-full">
          <FileViewer
            filePath={fileinfo}
            fileType={getExtension(fileinfo)}
            // errorComponent={CustomErrorComponent}
            onError={onError}
          />
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm divide-y divide-gray-200">
            <thead>
              <tr className="">
                <th class="p-4 font-medium text-left text-gray-900 dark:text-gray-300 whitespace-nowrap">
                  <div class="flex items-center">Type</div>
                </th>
                <th class="p-4 font-medium text-left text-gray-900 dark:text-gray-300 whitespace-nowrap">
                  <div class="flex items-center">Platform</div>
                </th>
                <th class="p-4 font-medium text-left text-gray-900 dark:text-gray-300 whitespace-nowrap">
                  <div class="flex items-center">Owner</div>
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-100">
              <tr>
                <td class="p-4 font-medium text-gray-900 dark:text-gray-300 flex flex-col justify-start items-center whitespace-nowrap">
                  <DocumentTextIcon className="h-6 dark:text-gray-200" />{" "}
                  <span>Image</span>
                </td>
                <td class="p-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  <ShieldCheckIcon className="h-6  dark:text-gray-200" />{" "}
                  <span>Keepler</span>
                </td>
                <td class="p-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  <UserIcon className="h-6  dark:text-gray-200" />{" "}
                  <span>{ellipseAddress(address)}</span>
                </td>
                {/* <td class="p-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  <LockClosedIcon className="h-6  dark:text-gray-200" />{" "}
                  <span>Only You</span>
                </td> */}
              </tr>
            </tbody>
          </table>
        </div>
      </FileDetail>
      <div className="flex flex-row space-x-2  items-center">
        <FolderOpenIcon className="h-16 text-blue-500" />
        <PageTitle>{foldername}</PageTitle>
      </div>

      <div class="max-w-full mb-6">
        <label class="flex justify-center w-full h-32 px-4 transition bg-white dark:bg-gray-800 border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
          <span class="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span class="font-medium text-gray-600">
              Click here to select file
              {/* <span class="text-blue-600 underline">browse</span> */}
            </span>
          </span>
          <input
            type="file"
            name="file_upload"
            class="hidden"
            onChange={onChangeCoverImage}
          // onChange={onChange}
          // onChange={sendFileToIPFS}
          />
        </label>
      </div>

      {isloading ? (
        <Progress
          indeterminated
          value={50}
          color="secondary"
          status="secondary"
        />
      ) : (
        ""
      )}


      {/* <FilePreview type={"file"} file={file} onError={onError} /> */}
      {/* {file && <img className="rounded mt-4" width="full" src={file} />} */}
      <PageTitle>Files in your Drive</PageTitle>

      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableCell>Name</TableCell>
              <TableCell>GET</TableCell>
              <TableCell>DELETE</TableCell>
              <TableCell>Actions</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {contentList?.map((content, i) => (
              <TableRow key={i}> 
                <TableCell>
                  <div className="flex items-center text-sm">
                    {fileFormatIcon("png")}
                    <div>
                      <p className="font-semibold">{getOnlyName(content)}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span>
                    <Button onClick={() => {
                      handleGetContent(content)
                      setFileModal(true);
                    }}>
                      GET
                    </Button>
                  </span>
                </TableCell>
                <TableCell>
                  <span>
                    <Button onClick={() => handleDeleteContent(content)}>
                      DELETE
                    </Button>
                  </span>
                </TableCell>
                <TableCell>
                  {/* <p>
                      {String(
                        files?.fileType != "mp3" &&
                          files?.fileType != "mp4" &&
                          files?.fileType != "pdf"
                      )}
                    </p> */}
                    <Button
                      onClick={() => {
                      localStorage.setItem("nftstring", fileinfo );
                        localStorage.setItem("nftactive", true);
                      }}
                    >
                      <Link to="/app/nft">Use as NFT</Link>
                    </Button>
                </TableCell>
              </TableRow>
            ))
              .reverse()}
          </TableBody>
        </Table>
        <TableFooter>
          <Pagination
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
            label="Table navigation"
            onChange={onPageChange}
          />
        </TableFooter>
      </TableContainer>
    </>
  );
}

export default KeplerStorageComponent;