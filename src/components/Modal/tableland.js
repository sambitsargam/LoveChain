const { Magic } = require("@magic-sdk/admin");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Creator = require("../models/Creator");
const uploadImage = require("./uploadImage");
const fs = require("fs");
const crypto = require("crypto");
const { recoverPersonalSignature } = require("eth-sig-util");
const rug = require("random-username-generator");

exports.getToken = (req, res) => {
  try {
    req.session.token = crypto.randomBytes(32).toString("hex");

    req.session.save((error) => {
      console.log(error);
    });

    // console.log("token",req.session.token)

    res.status(200).json({
      message:
        "Hey, Sign this message to prove you have access to this wallet, this is your token " +
        req.session.token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error,
    });
  }
};

exports.verifyToken = async (req, res) => {
  const nounce =
    "Hey, Sign this message to prove you have access to this wallet, this is your token " +
    req.session.token;

  console.log("TOKEN, VERIFY", req.body);

  const signature = recoverPersonalSignature({
    data: nounce,
    sig: req.body.signature,
  });

  console.log(signature);

  // if (signature.toLowerCase() != req.body.address.toLowerCase()) {
  if (false) {
    res.status(401).json({
      message: "Invalid signature",
    });
  } else {
    // save user in data base if not exist

    const userExist = await User.findOne({
      walletAddress: req.body.address,
    });
    if (!userExist) {
      var new_username = rug.generate();

      const newUser = await User.create({
        userName: `${new_username}`,
        fullName: `Full Name_${new_username}`,
        walletAddress: req.body.address,
        emailId: "",
      });
      // const newUser = await User.create({
      //     wallet_address: req.body.address,
      //     username: new_username,
      // });
    }

    const token = jwt.sign(
      { address: req.body.address },
      process.env.JWT_SECRET
    );

    res.status(200).json({
      message: "Token verified",
      token,
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    console.log(req.params);
    const user_instance = await User.findOne({
      walletAddress: req.params.address,
    });
    res.status(200).json(user_instance);
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};
const { ethers } = require("ethers");
const { Database } = require("@tableland/sdk");

const usersTable = "users_80001_6990";
const creatorsTable = "creators_80001_7029";
const projectsTable = "projects_80001_6992";
const membersTable = "members_80001_6993";

const privateKey =
  "0x7a62aa11fa06bc5f21ef8819674ce87876b678f7e288b9c8347fdd3eff7faf89";
const provider = new ethers.providers.JsonRpcProvider(
  "https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78"
);
const wallet = new ethers.Wallet(privateKey, provider);
console.log("ddddddddddbwallet", wallet);
const signer = wallet.connect(provider);
const db = new Database({ signer });
console.log("ddddddddddb", db);

exports.magicLoginUser = async (req, res) => {
  console.log(await db.prepare(`Select * from ${usersTable};`).all());
  console.log("magic login");
  try {
    const m = new Magic(process.env.MAGICLINK_PUBLISHABLE_KEY);
    const mAdmin = new Magic(process.env.MAGICLINK_SECRET_KEY);

    console.log("m", m, mAdmin);

    const DIDToken = req.body.didToken;
    const userInfo = req.body.userInfo;
    const userEmail = userInfo.email;
    const [proof, claim] = mAdmin.token.decode(DIDToken);

    const issuer = mAdmin.token.getIssuer(DIDToken);
    const publicAddress = mAdmin.token.getPublicAddress(DIDToken);

    const { results } = await db
      .prepare(`SELECT * FROM ${usersTable} WHERE emailId='${userEmail}';`)
      .all();
    let isUserNew = false;

    if (results.length === 0) {
      console.log("hello");
      const data = await db.prepare(`SELECT * FROM ${usersTable};`).all();

      console.log(data.results);
      const { meta: insert } = await db
        .prepare(
          `INSERT INTO ${usersTable} (id, userName, fullName, walletAddress, emailId) VALUES (?, ?, ?, ?, ?);`
        )
        .bind(
          data.results.length + 1,
          `username_${userEmail}`,
          `Full Name_${userEmail}`,
          publicAddress,
          userEmail
        )
        .run();

      await insert.txn.wait();
      isUserNew = true;
    }

    // const data = await db.prepare(`SELECT * FROM ${usersTable};`).all();
    const data = await db
      .prepare(`SELECT * FROM ${usersTable} where emailId='${userEmail}';`)
      .all();

    console.log(data);
    console.log(data.results);
    const userObj = data.results[0];
    console.log("CREATED USR", userObj);
    let message = "Loged in";

    const token = jwt.sign(
      { wallet_address: publicAddress },
      process.env.JWT_SECRET
    );

    return res.status(200).json({
      user_instance: userObj,
      message: message,
      token,
      isUserNew,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

exports.magicLoginCreator = async (req, res) => {
  console.log("magic login creator");
  try {
    const m = new Magic(process.env.MAGICLINK_PUBLISHABLE_KEY);
    const mAdmin = new Magic(process.env.MAGICLINK_SECRET_KEY);

    const DIDToken = req.body.didToken;
    const userInfo = req.body.userInfo;
    const userEmail = userInfo.email;
    const [proof, claim] = mAdmin.token.decode(DIDToken);

    const issuer = mAdmin.token.getIssuer(DIDToken);
    const publicAddress = mAdmin.token.getPublicAddress(DIDToken);

    const { results } = await db
      .prepare(`SELECT * FROM ${usersTable} WHERE emailId='${userEmail}';`)
      .all();
    let isUserNew = false;

    let creatorObj;

    if (results.length === 0) {
      const usersData = await db.prepare(`SELECT * FROM ${usersTable};`).all();
      const { meta: userInsert } = await db
        .prepare(
          `INSERT INTO ${usersTable} (id, userName, fullName, walletAddress, emailId, isCreator) VALUES (?, ?, ?, ?, ?, ?);`
        )
        .bind(
          usersData.results.length + 1,
          `username_${userEmail}`,
          `Full Name_${userEmail}`,
          publicAddress,
          userEmail,
          1
        )
        .run();
      await userInsert.txn.wait();

      const creatorsData = await db
        .prepare(`SELECT * FROM ${usersTable};`)
        .all();
      const { meta: creatorInsert } = await db
        .prepare(
          `INSERT INTO ${creatorsTable} (id, emailId, profilePic, description, isVotingLive) VALUES (?, ?, ?, ?, ?);`
        )
        .bind(
          creatorsData.results.length + 1,
          userEmail,
          "",
          "some temp description",
          0
        )
        .run();
      await creatorInsert.txn.wait();

      isUserNew = true;
    } else {
      //   console.log("Hello");
      //   const { results } = await db
      //     .prepare(`SELECT * FROM ${creatorsTable} WHERE emailId='${userEmail}';`)
      //     .all();
      //   if (results.length !== 0) {
      //     return res.status(409).json({
      //       message: "Email already registered as a User",
      //     });
      //   }
    }

    const userData = await db
      .prepare(`SELECT * FROM ${usersTable} WHERE emailId='${userEmail}';`)
      .all();

    const userObj = userData.results[0];
    console.log("CREATED USR", userObj);
    let message = "Loged in";

    const creatorData = await db
      .prepare(`SELECT * FROM ${creatorsTable} WHERE emailId='${userEmail}';`)
      .all();
    creatorObj = creatorData.results[0];

    creatorObj.projects = [];
    creatorObj.members = [];

    const token = jwt.sign(
      { wallet_address: publicAddress },
      process.env.JWT_SECRET
    );

    console.log(userObj, creatorObj);

    return res.status(200).json({
      user_instance: { ...userObj, ...creatorObj },
      message: message,
      token,
      isUserNew,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

exports.getAllCreators = async (req, res) => {
  try {
    const creatorsListData = await db
      .prepare(`SELECT * FROM ${creatorsTable}`)
      .all();
    const creatorsList = creatorsListData.results;

    const updatedCreatorList = [];
    for (let i = 0; i < creatorsList.length; i++) {
      console.log(creatorsList[i]);
      const creatorInfoData = await db
        .prepare(
          `SELECT * FROM ${creatorsTable} WHERE emailId='${creatorsList[i].emailId}';`
        )
        .all();

      const creatorInfo = creatorInfoData.results[0];

      console.log("-----------------------------");
      console.log(creatorInfoData);
      console.log("-----------------------------");

      const userData = await db
        .prepare(
          `SELECT * FROM ${usersTable} WHERE emailId='${creatorsList[i].emailId}';`
        )
        .all();
      const userInfo = userData.results[0];

      const projectData = await db
        .prepare(
          `SELECT * FROM ${projectsTable} WHERE creatorId = ${creatorsList[i].id};`
        )
        .all();

      const projectInfo = projectData.results;

      const memberData = await db
        .prepare(
          `SELECT * FROM ${membersTable} WHERE creatorId=${creatorInfo.id};`
        )
        .all();
      const membersInfo = memberData.results;

      if (creatorInfo.profilePic !== "") {
        updatedCreatorList.push({
          ...userInfo,
          ...creatorInfo,
          projects: projectInfo,
          members: membersInfo,
        });
      }
    }
    return res.send(updatedCreatorList);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

exports.getSubscriptionListOfUser = async (req, res) => {
  try {
    const { emailId } = req.query;
    console.log(emailId);

    const creatorsListData = await db
      .prepare(`SELECT * FROM ${creatorsTable};`)
      .all();
    const creatorsList = creatorsListData.results;

    const updatedCreatorList = [];
    for (let i = 0; i < creatorsList.length; i++) {
      const isUserSubscribedData = await db
        .prepare(
          `SELECT * FROM ${membersTable} where creatorId=${creatorsList[i].id} and memberEmail='${emailId}';`
        )
        .all();

      console.log(isUserSubscribedData);

      const isUserSubscribed = isUserSubscribedData.results;

      if (isUserSubscribed.length > 0) {
        const creatorUserInfoData = await db
          .prepare(
            `SELECT * FROM ${usersTable} WHERE emailId='${creatorsList[i].emailId}';`
          )
          .all();
        const creatorUserInfo = creatorUserInfoData.results[0];

        updatedCreatorList.push({
          ...creatorsList[i],
          ...creatorUserInfo,
        });
      }
    }
    return res.send(updatedCreatorList);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

exports.setCreatorInfo = async (req, res) => {
  try {
    const {
      emailId,
      name,
      description,
      benefits,
      profilePic,
      socialUrl,
      nftTemplate,
      chatId,
    } = req.body;
    const userInfoData = await db
      .prepare(
        `SELECT * FROM ${usersTable} WHERE emailId='${emailId}' LIMIT 1;`
      )
      .all();
    const userInfo = userInfoData.results;

    // const userInfo = await User.findOne({ emailId });
    if (!userInfo.length === 0) {
      return res.status(404).json({ message: "User does not exists" });
    }

    const { meta: updateUsers } = await db
      .prepare(
        `UPDATE ${usersTable} SET fullName='${name}', userName='${name}' WHERE emailId='${emailId}';`
      )
      .run();
    await updateUsers.txn.wait();

    const { meta: updateCreators } = await db
      .prepare(
        `UPDATE ${creatorsTable} SET description='${description}', benefits='${benefits}', profilePic='${profilePic}', socialUrl='${socialUrl}', nftTemplate='${nftTemplate}', chatId='${chatId}' WHERE emailId='${emailId}';`
      )
      .run();

    await updateCreators.txn.wait();

    const updatedUserInfoData = await db
      .prepare(`SELECT * FROM ${usersTable} where emailId = '${emailId}';`)
      .all();
    const updatedUserInfo = updatedUserInfoData.results[0];

    const updatedCreatorInfoData = await db
      .prepare(`SELECT * FROM ${creatorsTable} where emailId='${emailId}';`)
      .all();
    const updatedCreatorInfo = updatedCreatorInfoData.results[0];

    const projectsData = await db
      .prepare(
        `SELECT * FROM ${projectsTable} WHERE creatorId=${updatedCreatorInfo.id};`
      )
      .all();
    const projectsInfo = projectsData.results;

    const memberData = await db
      .prepare(
        `SELECT * FROM ${membersTable} WHERE creatorId=${updatedCreatorInfo.id};`
      )
      .all();
    const membersInfo = memberData.results;

    return res.send({
      ...updatedUserInfo,
      ...updatedCreatorInfo,
      projects: projectsInfo,
      members: membersInfo,
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

exports.getCreatorInfo = async (req, res) => {
  try {
    const { walletAddress } = req.query;
    const userData = await db
      .prepare(
        `SELECT * FROM ${usersTable} WHERE walletAddress='${walletAddress}';`
      )
      .all();
    const userInfo = userData.results[0];

    const creatorData = await db
      .prepare(
        `SELECT * FROM ${creatorsTable} WHERE emailId='${userInfo.emailId}';`
      )
      .all();
    const creatorInfo = creatorData.results[0];

    const projectsData = await db
      .prepare(
        `SELECT * FROM ${projectsTable} WHERE creatorId=${creatorInfo.id};`
      )
      .all();
    const projectsInfo = projectsData.results;

    const memberData = await db
      .prepare(
        `SELECT * FROM ${membersTable} WHERE creatorId=${creatorInfo.id};`
      )
      .all();
    const membersInfo = memberData.results;

    return res.send({
      ...userInfo,
      ...creatorInfo,
      projects: projectsInfo,
      members: membersInfo,
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

function search_array(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return true;
    }
  }
  return false;
}

exports.joinMembership = async (req, res) => {
  try {
    const { emailIdCreator, emailId } = req.body;
    const creatorData = await db
      .prepare(
        `SELECT * FROM ${creatorsTable} WHERE emailId='${emailIdCreator}';`
      )
      .all();
    const creatorInfo = creatorData.results[0];
    const memberData = await db
      .prepare(
        `SELECT * FROM ${membersTable} WHERE creatorId=${creatorInfo.id};`
      )
      .all();
    const membersInfo = memberData.results;

    // const creatorInfo = await Creator.findOne({ emailId: emailIdCreator });
    if (!search_array(membersInfo, "emailId", emailId)) {
      const { meta: memberInsert } = await db
        .prepare(
          `INSERT INTO ${membersTable} (memberEmail, creatorId) VALUES (?, ?);`
        )
        .bind(emailId, creatorInfo.id)
        .run();
      await memberInsert.txn.wait();

      //   await Creator.findOneAndUpdate(
      //     { emailId: emailIdCreator },
      //     { $push: { members: { emailId } } }
      //   ).exec();
    }
    return res.send({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

exports.updateVotingInfo = async (req, res) => {
  try {
    const { emailId, votingName, votingDesc } = req.body;

    const { meta: updateCreatorVotes } = await db
      .prepare(
        `UPDATE ${creatorsTable} SET votingName='${votingName}', votingDesc='${votingDesc}' where emailId='${emailId}';`
      )
      .run();
    await updateCreatorVotes.txn.wait();

    return res.send({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

exports.uploadImageController = async (req, res) => {
  try {
    const { file } = req;
    console.log(file);
    const resImg = await uploadImage(file.path);
    fs.unlink(file.path, (err) => {
      console.log(err);
    });
    res.send(resImg.secure_url);
  } catch (e) {
    res.status(500).send(e);
  }
};

//DONE
//Tumhare me save hua haina? Dekhna ek baar. Mere paas unsaved dikha raha hai
