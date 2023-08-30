// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract LoveChain is ERC721URIStorage {
    // uint256 public folderId;
    // uint256 public fileId;
    address payable owner;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;
    uint256 public userCount = 0;
    uint256 listingPrice = 0.025 ether;

    // uint256 public platformCount = 0;

    mapping(uint256 => MarketItem) private idToMarketItem;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        string name;
        string description;
        string image;
    }

    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold,
        string name,
        string description,
        string image
    );


    struct User {
        uint256 id;
        address payable _address;
        string image;
        string profile;
        string gender;
        string year;
        string country;
        uint256 balance;
    }
    event UserCreated(
        uint256 id,
        address payable _address,
        string image,
        string profile,
        string gender,
        string year,
        string country,
        uint256 balance
    );

    mapping(address => bool) public registeredUsers;

    mapping(uint256 => User) users;
    mapping(address => User) userProfile;

    constructor() ERC721("LoveChain Tokens", "LCHA") {
        owner = payable(msg.sender);
    }

function createProfile(string memory _image, string memory _profile, string memory _gender, string memory _year, string memory _country)
        public
    {
        if (registeredUsers[msg.sender] == false) {
            userCount++;
            User storage _users = users[userCount];
            User storage _userprofile = userProfile[msg.sender];

            _users.id = userCount;
            _users._address = payable(address(msg.sender));
            _users.image = _image;
            _users.profile = _profile;
            _users.gender = _gender;
            _users.year = _year;
            _users.country = _country;
            _users.balance = 0;
            registeredUsers[msg.sender] = true;

            //userProfile
            _userprofile.id = userCount;
            _userprofile.image = _image;
            _userprofile.profile = _profile;
            _userprofile._address = payable(address(msg.sender));

            userProfile[msg.sender] = _userprofile;
            users[userCount] = _users;

            emit UserCreated(
                _users.id,
                payable(address(msg.sender)),
                _image,
                _profile,
                _gender,
                _year,
                _country,
                _users.balance
            );
        }
    }

    //get users
    function fetchAllUsers() public view returns (User[] memory) {
        uint256 itemCount = userCount;
        uint256 currentIndex = 0;
        User[] memory items = new User[](itemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            uint256 currentId = i + 1;
            User storage currentItem = users[currentId];
            items[currentIndex] = currentItem;
            currentIndex += 1;
        }
        return items;
    }

    //get registered user
    function isRegistered() public view returns (bool) {
        if (registeredUsers[msg.sender] == true) {
            return true;
        } else {
            return false;
        }
    }

    //get user
    function getSingleUser() public view returns (User memory) {
        return userProfile[msg.sender];
    }

    //tipUser
    function tipUser(uint256 id) public payable {
        User storage _users = users[id];
        _users._address.transfer(msg.value);
        _users.balance = _users.balance + msg.value;
        users[id] = _users;
    }

    //NFT functions

    /* Updates the listing price of the contract */
    function updateListingPrice(uint256 _listingPrice) public payable {
        require(
            owner == msg.sender,
            "Only marketplace owner can update listing price."
        );
        listingPrice = _listingPrice;
    }

    /* Returns the listing price of the contract */
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    /* Mints a token and lists it in the marketplace */
    function createToken(
        string memory tokenURI,
        uint256 price,
        string memory _name,
        string memory _description,
        string memory _image
    ) public payable returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        createMarketItem(newTokenId, price, _name, _description, _image);
        return newTokenId;
    }

    function createMarketItem(
        uint256 tokenId,
        uint256 price,
        string memory _name,
        string memory _description,
        string memory _image
    ) private {
        require(price > 0, "Price must be at least 1 wei");
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false,
            _name,
            _description,
            _image
        );

        _transfer(msg.sender, address(this), tokenId);
        emit MarketItemCreated(
            tokenId,
            msg.sender,
            address(this),
            price,
            false,
            _name,
            _description,
            _image
        );
    }

    /* allows someone to resell a token they have purchased */
    function resellToken(uint256 tokenId, uint256 price) public payable {
        require(
            idToMarketItem[tokenId].owner == msg.sender,
            "Only item owner can perform this operation"
        );
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );
        idToMarketItem[tokenId].sold = false;
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].seller = payable(msg.sender);
        idToMarketItem[tokenId].owner = payable(address(this));
        _itemsSold.decrement();

        _transfer(msg.sender, address(this), tokenId);
    }

    /* Creates the sale of a marketplace item */
    /* Transfers ownership of the item, as well as funds between parties */
    function createMarketSale(uint256 tokenId) public payable {
        uint256 price = idToMarketItem[tokenId].price;
        address seller = idToMarketItem[tokenId].seller;
        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );
        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].sold = true;
        idToMarketItem[tokenId].seller = payable(address(0));
        _itemsSold.increment();
        _transfer(address(this), msg.sender, tokenId);
        payable(owner).transfer(listingPrice);
        payable(seller).transfer(msg.value);
    }

    /* Returns all unsold market items */
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _tokenIds.current();
        uint256 unsoldItemCount = _tokenIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(this)) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Returns only items that a user has purchased */
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Returns only items a user has listed */
    function fetchItemsListed() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
}