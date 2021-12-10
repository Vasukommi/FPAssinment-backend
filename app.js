const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");

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
    app.listen(process.env.PORT || 3000, () => {
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
  const checkUserQuery = `SELECT * FROM users WHERE user_id='${username} AND password='${password}'`;
  const dbUser = await dbPassword.get(checkUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Login Failed");
  } else {
    const payload = { username: username };
    const jwtToken = jwt.sign(payload, "magic");
    response.send(JSON.stringify{ jwtToken });
    console.log(jwtToken);
    response.status(200);
  }
});

// post users API
app.post("/", async (request, response) => {
  const authHeader = request.headers["authorization"];
  let jwtToken;
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }

  if (jwtToken === undefined) {
    response.send("Invalid jwt token");
    response.status(400);
  } else {
    jwt.verify(jwtToken, magic, async (error, user) => {
      if (error) {
        response.send("invalid access token");
        response.status(400);
      } else {
        const userDetails = request.body;
        const parsedData = JSON.parse(userDetails);
        if (parsedData !== undefined) {
          const values = parsedData.map(
            (eachBook) =>
              `('${eachBook.user_id}', ${eachBook.id}, ${eachBook.title}, ${eachBook.body})`
          );

          const valuesString = values.join(",");

          const addBookQuery = `
            INSERT INTO
            financepeer_data (user_id, id, title, body)
            VALUES
            ${valuesString};`;

          const dbResponse = await dbUsers.run(addBookQuery);
        } else {
          response.send("no data");
        }
      }
    });
  }
});

// get all user API
app.get("/users/", async (request, response) => {
  const authHeader = request.headers["authorization"];

  let jwtToken;

  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }

  if (jwtToken === undefined) {
    response.send("Invalid jwt token");
    response.status(400);
  } else {
    jwt.verify(jwtToken, magic, async (error, user) => {
      if (error) {
        response.send("invalid access token");
        response.status(400);
      } else {
        const getAllUsersQuery = `SELECT * FROM financepeer_data ORDER BY user_id;`;
        const userList = await dbUsers.all(getAllUsersQuery);
        respond.status(200);
        response.send(userList);
      }
    });
  }
});
