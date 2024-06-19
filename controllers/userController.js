// userController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const asyncHandler = require("express-async-handler");
const db = require("../firebaseConfig");

const generateToken = (tokenPayload) => {
  return jwt.sign(tokenPayload, process.env.SECRET, {
    expiresIn: "30d",
  });
};

const signupUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!email || !password) {
    res.status(409);
    throw new Error("Please add all fields");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Email not valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Password not strong enough");
  }

  const usersRef = db.ref("users");
  const userSnapshot = await usersRef
    .orderByChild("email")
    .equalTo(email)
    .once("value");
  if (userSnapshot.exists()) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUserRef = usersRef.push();
  const userId = newUserRef.key;

  await newUserRef.set({
    name,
    email,
    password: hashedPassword,
    role: role || "GUEST",
  });

  const tokenPayload = { userId, role: role || "GUEST" };

  res.status(201).json({
    message: "User registered successfully",
    name,
    email,
    token: generateToken(tokenPayload),
    role: role || "GUEST",
    userId,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, ...rest } = req.body;

  if (Object.keys(rest).length > 0) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  if (!email || !password) {
    res.status(409);
    throw new Error("Please add all fields");
  }

  const usersRef = db.ref("users");
  const userSnapshot = await usersRef
    .orderByChild("email")
    .equalTo(email)
    .once("value");
  if (!userSnapshot.exists()) {
    res.status(409);
    throw new Error("Incorrect email");
  }

  const userKey = Object.keys(userSnapshot.val())[0];
  const user = userSnapshot.val()[userKey];

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(403);
    throw new Error("Incorrect password");
  }

  const userId = userKey;
  const role = user.role;
  const name = user.name;
  const tokenPayload = { userId, role };

  res
    .status(200)
    .json({ name, email, userId, role, token: generateToken(tokenPayload) });
});

const currentUser = async (req, res) => {
  res.json({ message: "current user" });
};

module.exports = {
  signupUser,
  loginUser,
  currentUser,
};
