// functionality to be added bcrypt jwt_token

const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "financePeer.db");
const dbPathPassword = path.join(__dirname, "users.db");

let dbPassword = null;
let dbUsers = null;

const initializeDBAndServer = async () => {
  try {
    dbPassword = await open({
      filename: dbPathPassword,
      driver: sqlite3.Database,
    });
    dbUsers = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//Login API
app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const checkUserQuery = `SELECT * FROM users WHERE user_id='${username}' AND password='${password}'`;
  const dbUser = await dbPassword.get(checkUserQuery);
  response.send(dbUser);
  if (dbUser === undefined) {
    response.send("Login Failed");
  } else {
    response.status(200);
    // temporary(for login only) will be replaced by jwt_token library soon...
    const jwtToken = "1a2345b678910c";
    response.send(jwtToken);
    console.log("login successful");
  }
});

// post users API
app.post("/", async (request, response) => {
  const userDetails = request.body;
  const values = userDetails.map(
    (eachBook) =>
      `('${userDetails.user_id}', ${userDetails.id}, ${userDetails.title}, ${userDetails.body})`
  );

  const valuesString = values.join(",");

  const addBookQuery = `
    INSERT INTO
      financepeer_data (user_id, id, title, body)
    VALUES
       ${valuesString};`;

  const dbResponse = await dbUsers.run(addBookQuery);
});

// get all user API
app.get("/users/", async (request, response) => {
  const getAllUsersQuery = `SELECT * FROM financepeer_data ORDER BY user_id;`;
  const userList = await dbUsers.all(getAllUsersQuery);
  if (userList === undefined) {
    respond.status(404);
    response.send("no users data");
  } else {
    respond.status(200);
    response.send(userList);
  }
});
