A multi-page platform with dynamic single-page features built with vanilla JavaScript, Node.js, Express, and PostgreSQL featuring authentication, CRUD operations, and social interactions.

## Features

- User Authentication with Passport.js
- Posts (Create, Read, Update, Delete)
- Comments System
- Like System for Posts & Comments
- User Profiles with Statistics
- Profile Picture Upload
- Search by Topic

## Tech Stack

**Frontend:** Vanilla JavaScript (ES6), Axios, HTML5, CSS3  
**Backend API Server:** Node.js, Express.js, PostgreSQL, Passport.js, bcrypt, Multer  
**Frontend Server:** Express.js (static file serving + auth middleware)  
**Environment Config:** .env file for sensitive configuration, excluded from Git  
**Database:** PostgreSQL with CASCADE constraints


---

# Code Documentation

## Server Architecture

This application uses **two servers**:

1. **`server.js`** - Frontend server (Port 3000)
   - Serves static HTML/CSS/JS files from `/public` and `/protected`
   - Protects routes with authentication middleware

2. **`serverBackend.js`** - Backend API server (Port 4000)
   - Handles all database operations with PostgreSQL
   - Manages authentication with Passport.js

**Frontend Server:** `http://localhost:3000` (`server.js`)  
**Backend API Server:** `http://localhost:4000` (`serverBackend.js`)

---

## Frontend Server (`server.js` - Port 3000)

### Authentication Middleware

**`checkAuth(req, res, next)`**
- Intercepts requests to protected routes
- Forwards cookies to backend API server
- Calls `GET http://localhost:4000/secrets` to verify session
- Allows access if authenticated
- Redirects to login if not authenticated

---

### Route Handlers

**`GET /`**
- Serves login page (`Login.html`)
- Public route (no auth required)

**`GET /register`**
- Serves registration page (`register.html`)
- Public route (no auth required)

**`GET /main`** (Protected)
- Serves main dashboard page
- Requires authentication

**`GET /profile`** (Protected)
- Serves user's own profile page
- Requires authentication

**`GET /editProfile`** (Protected)
- Serves profile editing page
- Requires authentication

**`GET /:name`** (Protected)
- Serves other users' profile pages
- Dynamic route with username parameter
- Requires authentication

---

## Backend API Server (`serverBackend.js` - Port 4000)

### Authentication API Endpoints

**`POST /register`**
- Validates email format with regex
- Hashes password using bcrypt (10 salt rounds)
- Extracts username from email prefix
- Creates new user in database
- Returns 409 if email already exists

**`POST /login`**
- Uses Passport.js custom callback for JSON response
- Verifies credentials against database
- Compares hashed passwords with bcrypt
- Creates session on success
- Returns user data + redirect URL (not HTML redirect)

**`POST /logout`**
- Destroys user session
- Invalidates authentication cookie
- Returns success message

**`GET /secrets`**
- Checks if user is authenticated
- Returns user data if logged in
- Returns 401 redirect if not authenticated
- **Used by frontend server to verify sessions**

**Passport Configuration:**
- `passport.use(Strategy)` - Defines local authentication strategy with email/password
- `passport.serializeUser()` - Stores user ID in session (memory efficient)
- `passport.deserializeUser()` - Retrieves full user object on each request

---

### Posts Management API Endpoints

**`GET /create-table`**
- Retrieves all posts for a specific subject
- Orders by ID descending (newest first)
- Filters by subject query parameter
- Returns array of post objects

**`POST /content-to-subject`**
- Creates new post
- Stores author name and content

**`POST /post-to-edit`**
- Updates post content

**`DELETE /delete-post`**
- Deletes post by ID

**`GET /get-lastId`**
- Returns highest post ID in database
- Used for creating new posts with sequential IDs

**`GET /search-subject`**
- Searches subjects

---

### Comments System API Endpoints

**`GET /display-comment`**
- Retrieves all comments for a specific post
- Orders by ID descending (newest first)
- Returns comment array with username and text

**`POST /create-comment`**
- Creates new comment on a post

**`POST /comment-to-edit`**
- Updates comment text

**`DELETE /delete-comment`**
- Deletes comment by ID

---

### Like System API Endpoints

**`GET /like/:id`**
- Counts total likes for post or comment
- Distinguishes via `isLikeForPost` query parameter
- Returns integer count

**`PATCH /like`**
- Checks if user already liked (SELECT)
- If exists → DELETE (unlike)
- If not exists → INSERT (like)
- Returns updated like count

---

### User Management API Endpoints

**`GET /user-information/:userName`**
- Counts total comments by user
- Gets account creation date
- Formats date in Romanian locale
- Returns JSON with total comments and account creation

**`POST /modify-email`**
- Checks if password is correct
- Updates user email
- Returns 409 if email already exists (UNIQUE)

**`POST /modify-password`**

- Verifies old password
- Hashes new password with bcrypt
- Changes user password

**`POST /modify-name`**
- Updates username
- Checks if new name is available
- Updates all posts with new name

---

### Profile Pictures API Endpoints

**Multer Configuration:**
- Saves uploaded images to `/profilePhotos`
- Names files as `{user_id}.{extension}`
- Deletes old profile pictures before saving new one
- Supports .jpeg, .jpg, .png formats

**`POST /view-image`**
- Uploads profile picture via Multer

**`POST /load-image`**
- Retrieves user current profile picture
- Checks for image with multiple extensions
- Falls back to default avatar if none found

---

### Subjects API Endpoints

**`GET /subject`**
- Returns all available subjects
- Ordered by ID descending
- Limited to 20 results
- Used for category selection

**`POST /create-subject`**
- Creates new subject
- Returns 409 if subject already exists (UNIQUE)

---

## Frontend Server Architecture

### Core Modules

**`login.js`**
- Handles login form submission
- Sends credentials to API server (`POST http://localhost:4000/login`)
- Stores user data in localStorage
- Redirects to main page on success
- Displays error messages on failure

**`register.js`**
- Handles registration form
- Sends data to API server (`POST http://localhost:4000/register`)
- Displays error messages on failure

**`logout.js`**
- Calls API endpoint (`POST http://localhost:4000/logout`)
- Clears localStorage
- Redirects to login page

**`dashboard.js`**
- Loads posts for selected subject
- Dynamically creates post elements
- Handles search functionality
- Manages subject navigation

**`post.js`**
- Creates DOM elements for posts
- Adds edit/delete buttons for own posts
- Initializes like button
- Handles comment button
- Manages post state (new vs existing)

**`commentable.js`**
- Creates comment DOM elements
- Loads comments for a post
- Handles comment submission

**`likes.js`**
- Initializes like buttons
- Loads initial like count from server
- Handles like/unlike clicks

**`profile.js`**
- Determines if viewing own profile vs others
- Displays user statistics
- Adds image upload input if it is own profile

**`loadImage.js`**
- Handles current profile picture loading
- Works for both avatars and profile pages

**`createUploadInput.js`**
- Manages image upload for own profile

**`editable.js`**
- Makes posts/comments editable
- Replaces pre with textarea on edit
- Reverts on cancel

**`removable.js`**
- Removes element from DOM
- Sends delete request to server


**`addButtonPattern.js`**
- Creates "Add Post" button
- Prevents multiple drafts with `isPosting` flag

**`searchButton.js`**
- Handles search functionality
- Loads posts for selected subject
- Alert with no topics if it is not such a subject title

---

## Database Schema
```
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) UNIQUE NOT NULL,
  creation_date TIMESTAMP DEFAULT NOW()
);

-- Subjects
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  subject VARCHAR(255) UNIQUE NOT NULL,
);

-- Posts
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,

  FOREIGN KEY (subject) REFERENCES subjects(subject) ON DELETE RESTRICT
);

-- Comments
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  postid INTEGER NOT NULL,
  username VARCHAR(255) NOT NULL,
  commenttext TEXT NOT NULL,
  
  FOREIGN KEY (postid) REFERENCES posts(id) ON DELETE CASCADE
);

-- Post Likes
CREATE TABLE post_likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  
  UNIQUE(post_id, user_id)
);

-- Comment Likes
CREATE TABLE comment_likes (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  
  UNIQUE(comment_id, user_id)
);
```

### CASCADE DELETE Behavior

**Delete Post →** Removes all comments, post likes, and comment likes  
**Delete Comment →** Removes all comment likes  

---

## Security Features

- **Password Hashing:** bcrypt with 10 salt rounds
- **Session Security:** httpOnly cookies, sameSite protection
- **Email Validation:** Regex pattern matching
- **CORS:** Configured for specific origin with credentials
- **UNIQUE Constraints:** Prevents duplicate emails, usernames, likes
- **Protected Routes:** Authentication middleware on frontend server

---
