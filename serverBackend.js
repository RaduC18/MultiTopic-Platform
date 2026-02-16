import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import env from "dotenv";

const app = express();
const port = 4000;
const saltRounds = 10;
env.config();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    }
  }),
);

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
});

db.connect();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/profilePhotos");
  },
  filename: async function (req, file, cb) {
    try {
      const email = req.body.email;
      const response = await db.query("SELECT id FROM users WHERE email = $1", [
        email,
      ]);
      const id = response.rows[0].id;
      const directory = __dirname + "/profilePhotos";
      const extensions = [".jpeg", ".jpg", ".png"];

      extensions.forEach((ext) => {
        const filePath = path.join(directory, `${id}${ext}`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      cb(null, id + path.extname(file.originalname));
    } catch (err) {
      console.error(err.message);
      cb(err);
    }
  },
});

const upload = multer({ storage: storage });

passport.use(
  new Strategy(
    {
      usernameField: 'email', 
      passwordField: 'password'
    },
    async function verify(email, password, cb) {
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          email,
        ]);

        if (result.rows.length > 0) {
          const user = result.rows[0];
          const isMatch = await bcrypt.compare(password, user.password);
          
          if (isMatch) {
            return cb(null, user);
          }
          return cb(null, false);
        }
        return cb(null, false);
      } catch (err) {
        console.error(err.message);
        return cb(err);
      }
    }
  ),
);

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    cb(null, result.rows[0]);
  } catch (err) {
    console.error(err.message);
    cb(err);
  }
});

app.get("/", (req, res) => res.send("Server running"));

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error('[LOGIN ERROR]', err.message);
      return res.status(500).json({ message: "Server error" });
    }
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: "Login failed" });
      }
      return res.status(200).json({
        redirectUrl: "http://localhost:3000/main",
        name: req.user.name,
        email: req.user.email,
        id: req.user.id
      });
    });
  })(req, res, next);
});

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({
      name: req.user.name,
      email: req.user.email,
    });
  } else {
    res.status(401).json({
      redirectUrl: "/",
    });
  }
});

app.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.status(200).json({ message: "Logged out" });
  });
});


app.post("/create-subject", async (req, res) => {
  try {
    const subject = req.body.subject;
    await db.query(`INSERT INTO subjects(subject) VALUES ($1)`, [subject]);
    res.status(201).send("Created");
  } catch (err) {
    console.error(err.message);
    if (err.code === "23505") {
      return res.status(409).send({ message: "Duplicate" });
    }
    res.status(500).send({ message: "Server error" });
  }
});

app.get("/create-table", async (req, res) => {
  try {
    const subject = req.query.subject;
    const result = await db.query("SELECT * FROM posts WHERE subject = $1 ORDER BY id DESC", [
      subject,
    ]);
    res.send(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ message: "Server error" });
  }
});

app.get("/search-subject", async (req, res) => {
  try {
    const subject = req.query.subject;
    const result1 = await db.query(
      "SELECT subject FROM subjects WHERE subject = $1",
      [subject],
    );
    if (result1.rows.length === 0) {
      return res.sendStatus(404);
    }
    const result2 = await db.query(
      "SELECT * FROM posts WHERE subject = $1",
      [subject],
    );
    res.status(200).send(result2.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ message: "Server error" });
  }
});

app.get("/subject", async (req, res) => {
  try {
    const result = await db.query("SELECT subject FROM subjects ORDER BY id DESC LIMIT 20");
    res.send(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ message: "Server error" });
  }
});

app.post("/content-to-subject", async (req, res) => {
  const subject = req.body.subject;
  const content = req.body.content;
  const username = req.body.username;
  
  try {
    await db.query(
      "INSERT INTO posts (subject, content, name) VALUES ($1, $2, $3)",
      [subject, content, username],
    );
    res.status(201).send({ message: "Created" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ message: "Server error" });
  }
});

app.get("/get-lastId", async (req, res) => {
  try {
    const result = await db.query("SELECT MAX(id) AS id FROM posts");
    const lastId = result.rows[0].id || 0;
    res.status(200).json(lastId);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ message: "Server error" });
  }
});

app.get("/like/:id", async(req, res) => {
  const id = req.params.id
  const isLikeForPost = req.query.isLikeForPost;
  const table = isLikeForPost === 'true' ? 'post_likes' : 'comment_likes';
  try{
    const result = await db.query(`SELECT COUNT(post_id) FROM ${table} WHERE post_id = $1`, [id]);
    const likesNumber = result.rows[0].count;
    res.status(200).json(likesNumber)
  } catch(err){
    console.error(err.message);
    res.status(500).send({ message: "Server error" });
  }
})

app.patch("/like", async (req, res) => {
    const { id, idCurerntUser, isLikeForPost } = req.body;
    const table = isLikeForPost === 'true' ? 'post_likes' : 'comment_likes';
  try{
    const result = await db.query(`SELECT id FROM ${table} WHERE post_id = $1 AND user_id = $2`, [id, idCurerntUser]);
    if(result.rows.length > 0){
      await db.query(`DELETE FROM ${table} WHERE post_id = $1 AND user_id = $2`, [id, idCurerntUser]);
      const result = await db.query(`SELECT COUNT(post_id) FROM ${table} WHERE post_id = $1`, [id]);
      const likesNumber = result.rows[0].count;
      return res.status(200).json(likesNumber)
    } else{
      await db.query(`INSERT INTO ${table} (post_id, user_id) VALUES ($1, $2)`, [id, idCurerntUser]);
      const result = await db.query(`SELECT COUNT(post_id) FROM ${table} WHERE post_id = $1`, [id]);
      const likesNumber = result.rows[0].count;
      return res.status(200).json(likesNumber)
    }
  } catch (err){
    console.error(err.message);
    res.status(500).send({ message: "Server error" });
  }
    
});

app.post("/post-to-edit", async (req, res) => {
  try {
    const { id, content } = req.body;
    await db.query(
      "UPDATE posts SET content = $1 WHERE id = $2",
      [content, id],
    );
    res.status(200).send({ message: "Updated" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ message: "Server error" });
  }
});


app.post("/comment-to-edit", async (req, res) => {
  try {
    const { id, content } = req.body;
    await db.query(
      "UPDATE comments SET commenttext = $1 WHERE id = $2",
      [content, id],
    );
    res.status(200).send({ message: "Comment updated" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ message: "Server error" });
  }
});

app.delete("/delete-comment", async (req, res) => {
  const id = req.body.id;
  try {
    await db.query("DELETE FROM comments WHERE id = $1", [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ message: "Server error" });
  }
});

app.delete("/delete-post", async (req, res) => {
  const id = req.body.id;
  try {
    await db.query("DELETE FROM posts WHERE id = $1", [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ message: "Server error" });
  }
});

app.get("/display-comment", async (req, res) => {
  const postId = req.query["post-id"];
  try {
    const result = await db.query(
      "SELECT id, username, commenttext FROM comments WHERE postid = $1 ORDER BY id DESC",
      [postId],
    );
    res.status(200).send(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ message: "Server error" });
  }
});


app.post("/create-comment", async (req, res) => {
  const { postId, content, userName } = req.body;
  try {
    await db.query(
      "INSERT INTO comments (postid, username, commentText) VALUES ($1, $2, $3)",
      [postId, userName, content],
    );
    res.sendStatus(200);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const emailSuffix = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const name = email.split('@')[0];

  if (!emailSuffix.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    await db.query(
      "INSERT INTO users (email, password, name) VALUES ($1, $2, $3)",
      [email, hash, name],
    );
    res.status(200).send({ message: "Registered!" });
  } catch (err) {
    console.error(err.message);
    if (err.code === "23505") {
      res.status(409).send({ message: "An account with this email already exists" });
    } else {
      res.status(500).send({ message: "Server error" });
    }
  }
});

app.post("/modify-email", async (req, res) => {
  const { currentEmail, email, password } = req.body;
  
  try {
    const result = await db.query(
      "SELECT password FROM users WHERE email = $1",
      [currentEmail]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const checkPassword = result.rows[0].password;
    const isMatch = await bcrypt.compare(password, checkPassword);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    
    await db.query("UPDATE users SET email = $1 WHERE email = $2", [
      email,
      currentEmail
    ]);
    
    return res.status(200).json({ message: "Email changed successfully!" });
    
  } catch (err) {
    console.error('[MODIFY EMAIL ERROR]', err.message);

    if (err.code === "23505") {
      return res.status(409).json({ message: "Email already in use" });
    }
    
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/modify-password", async (req, res) => {
  const { oldPassword, newPassword, email } = req.body;
  try {
    const result = await db.query(
      "SELECT password FROM users WHERE email = $1",
      [email],
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const checkPassword = result.rows[0].password;
    const isMatch = await bcrypt.compare(oldPassword, checkPassword);

    if (isMatch) {
      const hash = await bcrypt.hash(newPassword, saltRounds);
      await db.query("UPDATE users SET password = $1 WHERE email = $2", [
        hash,
        email,
      ]);
      return res.status(200).json({ message: "Password updated!" });
    }
    res.status(401).json({ message: "Incorrect password" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/modify-name", async (req, res) => {
  const { name, email } = req.body;
  try {
    const currentName = await db.query(
      "SELECT name FROM users WHERE email = $1",
      [email],
    );
    
    if (currentName.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const checkName = currentName.rows[0].name;

    if (name !== checkName) {
      const result = await db.query("SELECT name FROM users WHERE name = $1", [
        name,
      ]);
      if (result.rows.length > 0) {
        return res.status(409).json({ message: "Name already in use" });
      }
      
      await db.query("UPDATE users SET name = $1 WHERE email = $2", [
        name,
        email,
      ]);
      await db.query("UPDATE posts SET name = $1 WHERE name = $2", [
        name,
        checkName,
      ]);

      return res.status(200).json({ message: "Changed!" });
    }
    res.status(400).json({ message: "You are using this name already" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/view-image", upload.single("image"), async (req, res) => {
  res.sendStatus(200);
});

app.post("/load-image", async (req, res) => {
  const name = req.body.name;
  const defaultPhoto = __dirname + "/profilePhotos/defaultAvatar.jpg";
  
  try {
    const result = await db.query("SELECT id FROM users WHERE name = $1", [
      name,
    ]);

    if (result.rows.length === 0) {
      return res.sendFile(defaultPhoto);
    }

    const id = result.rows[0].id;
    let photoPath = __dirname + `/profilePhotos/${id}.jpeg`;

    if (!fs.existsSync(photoPath)) {
      photoPath = __dirname + `/profilePhotos/${id}.jpg`;
      if (!fs.existsSync(photoPath)) {
        photoPath = __dirname + `/profilePhotos/${id}.png`;
        if (!fs.existsSync(photoPath)) {
          photoPath = defaultPhoto;
        }
      }
    }

    res.sendFile(photoPath);
  } catch (err) {
    console.error(err.message);
    res.sendFile(defaultPhoto);
  }
});

app.get('/user-information/:userName', async (req, res) => {
  const userName = req.params.userName
  try{
    const result1 = await db.query('SELECT COUNT(username) FROM comments WHERE username = $1', [userName]);
    const result2 = await db.query('SELECT creation_date FROM users WHERE name = $1', [userName])
    const totalReplies = result1.rows[0].count;
    const creationDate = new Date(result2.rows[0].creation_date).toLocaleDateString('ro-RO');
    res.status(200).json({
      totalReplies,
      creationDate
    })
  } catch(err){
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
  
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});