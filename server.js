import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

async function checkAuth(req, res, next) {
  try {
    const response = await axios.get("http://localhost:4000/secrets", {
      headers: {
        cookie: req.headers.cookie,
      },
    });

    req.user = response.data;
    return next();
  } catch (err) {
    if (err.response?.status === 401) {
      return res.redirect(err.response.data.redirectUrl);
    }
    return res.send("Server error");
  }
}

app.use(express.static("public"));


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/Login.html");
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/public/register.html");
});

app.get("/main", checkAuth, (req, res) => {
  res.sendFile(__dirname + "/protected/main.html");
});

app.get("/profile", checkAuth, (req, res) => {
  res.sendFile(__dirname + "/protected/profile.html");
});

app.get("/editProfile", checkAuth, (req, res) => {
  res.sendFile(__dirname + "/protected/editProfile.html");
});

app.get("/:name", checkAuth, (req, res) => {
  res.sendFile(__dirname + "/protected/userProfile.html");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
