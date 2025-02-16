const pg = require("pg");
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const client = new pg.Client(
  "postgres://shazeeda:Password111@localhost:5432/acme_store_db"
);

const createTables = async () => {
  const SQL = `
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS userinfo;
DROP TABLE IF EXISTS products;

CREATE TABLE userinfo (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(100)
);

CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(50) UNIQUE
);

CREATE TABLE favorites (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  user_id UUID NOT NULL REFERENCES userinfo(id),
  CONSTRAINT unique_product UNIQUE (product_id, user_id)
);`;

  await client.query(SQL);
};

const createUser = async (username, password) => {
  const SQL = `
INSERT INTO userinfo(id, username, password) VALUES($1, $2, $3) RETURNING *
`;
  const hashedPassword = await bcrypt.hash("password", 5);
  const result = await client.query(SQL, [uuid.v4(), username, hashedPassword]);
  console.log(result.rows); 
  return result.rows
};

// createProduct: A method that creates a product in the database and then returns the created record.
const createProduct = async (name) => {
  const SQL = `
INSERT INTO products (id, name) VALUES  ($1, $2)
RETURNING * 

`;
  const product = await client.query(SQL, [uuid.v4(), name]);
  console.log(product.rows);
  return product.rows
};


  
const createFavorite = async (productName, userName) => {
  const userId = `
SELECT id FROM userinfo WHERE username = $1`;

  const user = await client.query(userId, [userName]);
  console.log("user id", user.rows[0].id);
  const useruuid = user.rows[0].id;

  const productSQLcommand = `
SELECT id FROM products WHERE name = $1`;

  const product = await client.query(productSQLcommand, [productName]);
  console.log("product id", product.rows[0].id);
  const productuuid = product.rows[0].id;

  const SQL = `
INSERT INTO favorites (id, product_id, user_id)
VALUES ($1, $2, $3)
RETURNING *`;
  const database = await client.query(SQL, [uuid.v4(), productuuid, useruuid]);
  console.log(database.rows);
  return database.rows
};

const fetchFavorites = async (userName) => {
  const userId = `
  SELECT id FROM userinfo WHERE username = $1`;

  const user = await client.query(userId, [userName]);
  console.log("user id", user.rows[0].id);
  const useruuid = user.rows[0].id;
  const SQL = `
  SELECT * FROM favorites WHERE user_id = $1
  `;
  const database = await client.query(SQL, [useruuid]);
  console.log(database.rows);
  return database.rows

};

const fetchProducts = async () => {
  const SQL = `
  SELECT * FROM products`;
  const database = await client.query(SQL);
  console.log(database.rows);
  return database.rows

};

const fetchUsers = async () => {
  const SQL = `
  SELECT * FROM userinfo;`;
  const result = await client.query(SQL);
  return result.rows

};

const destroyFavorite = async (productName) => {
  const SQL = `
SELECT id FROM products WHERE name = $1`;
  const productuuid = await client.query(SQL, [productName]);
  const deleteSQL = `
DELETE FROM favorites WHERE product_id = $1`;
  const database = await client.query(deleteSQL, [productuuid.rows[0].id]);
  return "destory"
};

const init = async () => {
  console.log("init db layer");
  await client.connect();
  await createTables();
  await createUser("smilingjoe", "password");
  await createUser("frowningFrank", "password");
  await createProduct("pepsi");
  await createProduct("blue");
  await createFavorite("pepsi", "smilingjoe");
  await fetchProducts();
  await destroyFavorite("blue");
};

module.exports = {
  init,
  createUser,
  createFavorite,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  destroyFavorite,
  createProduct,
};
