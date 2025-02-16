const db = require("./db");
const express = require("express");
const app = express();
const {
  createUser,
  createFavorite,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  destroyFavorite,
  createProduct,
} = require("./db");

app.use(express.json());

app.get("/api/users", async (req, res, next) => {
  const getUser = await fetchUsers();
  res.status(201).json(getUser);
});

app.get("/api/products", async (req, res, next) => {
  const getProducts = await fetchProducts();
  res.status(201).json(getProducts);
});

app.get("/api/users/:id/favorites", async (req, res, next) => {
  const { id } = req.params;
  const getFavorites = await fetchFavorites(id);
  res.status(201).json(getFavorites);
});

app.post("/api/users/:id/favorites", async (req, res, next) => {
  // id needs to be the product name
  const { userName } = req.body;
  const { id } = req.params;
  const getFavorites = await createFavorite(id, userName);
  res.status(201).json(getFavorites);
});

app.delete("/api/users/:userid/favorites/:id", async (req, res, next) => {
  // id needs to be the product name

  const { id } = req.params;

  const destroyFavorites = await destroyFavorite(id);
  res.status(201).json(destroyFavorites);
});

const init = async () => {
  console.log("init api");
  db.init();
  app.listen(3000, () => {
    console.log("listening on port 3000");
  });
};

init();
