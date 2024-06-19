const asyncHandler = require("express-async-handler");
const db = require("../firebaseConfig");

// get items by user
const getItemsUser = asyncHandler(async (req, res) => {
  const owner = req.user.userId;
  const itemsRef = db.ref("items");
  const itemsSnapshot = await itemsRef
    .orderByChild("owner")
    .equalTo(owner)
    .once("value");

  const items = itemsSnapshot.exists()
    ? Object.values(itemsSnapshot.val())
    : [];

  res.status(200).json(items);
});

// get all items
const getItems = asyncHandler(async (req, res) => {
  const itemsRef = db.ref("items");
  const itemsSnapshot = await itemsRef.once("value");

  const items = itemsSnapshot.exists()
    ? Object.values(itemsSnapshot.val())
    : [];

  res.status(200).json(items);
});

// get a single item
const getItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const itemRef = db.ref(`items/${id}`);
  const itemSnapshot = await itemRef.once("value");

  if (!itemSnapshot.exists()) {
    return res.status(404).json({ error: "No such item" });
  }

  res.status(200).json(itemSnapshot.val());
});

// create an item
const createItem = asyncHandler(async (req, res) => {
  const { category, name, options, price, cost, stock, image } = req.body;
  const owner = req.user.userId;

  console.log("Request Body:", req.body);

  // Map options to ensure they have the correct structure
  const optionsArray = options.map((option) => ({
    name: option.name,
    subcategories: [option.subcategory],
  }));

  console.log("Options Array:", optionsArray);

  // Map the image data to match the frontend format
  const imageUrls = image.map(({ public_id }) => ({
    public_id,
  }));

  console.log("Image URLs:", imageUrls);

  // Create a new item reference with a unique ID
  const newItemRef = db.ref("items").push();

  // Set the new item data in the database
  await newItemRef.set({
    id: newItemRef.key,
    category,
    name,
    options: optionsArray,
    price,
    cost,
    stock,
    image: imageUrls,
    owner,
  });

  // Send the response
  res.status(200).json({
    id: newItemRef.key,
    category,
    name,
    options: optionsArray,
    price,
    cost,
    stock,
    image: imageUrls,
    owner,
  });
});

// delete an item
const deleteItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const itemRef = db.ref(`items/${id}`);
  const itemSnapshot = await itemRef.once("value");

  if (!itemSnapshot.exists()) {
    res.status(404).json({ error: "No such item" });
    return;
  }

  await itemRef.remove();
  res.status(200).json({ message: "Item deleted successfully" });
});

// update an item
const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const itemRef = db.ref(`items/${id}`);
  const itemSnapshot = await itemRef.once("value");

  if (!itemSnapshot.exists()) {
    res.status(404).json({ error: "No such item" });
    return;
  }

  await itemRef.update({ ...req.body });

  const updatedItemSnapshot = await itemRef.once("value");

  res.status(200).json(updatedItemSnapshot.val());
});

module.exports = {
  getItemsUser,
  getItems,
  getItem,
  createItem,
  deleteItem,
  updateItem,
};
