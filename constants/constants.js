const userRoles = {
  ADMIN: "admin",
  HOST: "host",
  GUEST: "guest",
};

// backend/constants.js
const availableOptions = [
  { name: "Size", subcategories: ["Small", "Medium", "Large"] },
  { name: "Pieces", subcategories: ["2 Pieces", "4 Pieces", "6 Pieces"] },
  { name: "Temperature", subcategories: ["Hot", "Cold"] },
  // Add other options here
];

module.exports = { userRoles, availableOptions };
