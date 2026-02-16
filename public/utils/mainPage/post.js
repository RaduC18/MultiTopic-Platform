import editable from "./editable.js";
import removable from "./removable.js";
import commentable from "./commentable.js";
import { subjectState } from "./subjectState.js";
import loadImage from "../imageHandler/loadImage.js";
import likes from "../mainPage/likes.js"

export default function post(
  postContent,
  name,
  id,
  isComment,
  isNew,
  isLikeForPost,
) {
  let storage = JSON.parse(localStorage.getItem("user_data"));

  const contentContainer = document.createElement("div");
  contentContainer.classList.add("content");
  contentContainer.setAttribute("data-key", id);

  const contentFooter = document.createElement("div");
  contentFooter.classList.add("contentFooter");

  const contentProfile = document.createElement("div");
  contentProfile.classList.add("contentProfile");

  const nameProfile = document.createElement("a");
  nameProfile.textContent = name;
  nameProfile.href = `/${name.replace(" ", "")}`;
  nameProfile.addEventListener("click", (e) => {
    localStorage.setItem(
      "user_data",
      JSON.stringify({ ...storage, userName: e.target.textContent }),
    );
  });

  const img = document.createElement("img");
  img.style.width = "30px";
  img.style.height = "30px";
  img.style.borderRadius = "50%";
  img.style.border = "1px solid #B6AE9F";
  img.style.objectFit = "cover";
  img.alt = "Profile Picture";

  loadImage(img, name);

  contentProfile.style.display = "flex";
  contentProfile.style.alignItems = "center";
  contentProfile.style.gap = "5px";
  contentProfile.append(img, nameProfile);

  const contentButtons = document.createElement("div");
  contentButtons.classList.add("contentButtons");
  contentFooter.append(contentProfile, contentButtons);

  const pre = document.createElement("pre");

  const isCurrentUser = name === storage.currentUserName;

  let likeButton;

  if (!isComment) {
    const commentButton = document.createElement("button");
    commentButton.textContent = "Comment";
    commentable(commentButton);
    contentButtons.append(commentButton);
  }

  if (!isCurrentUser) {
    likeButton = document.createElement("button");
    likeButton.textContent = "Like";
    contentButtons.prepend(likeButton);
  }

  if (isCurrentUser) {
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete");
    deleteButton.textContent = "Delete";

    editable(editButton, pre, contentButtons, id, isComment);
    removable(deleteButton, contentContainer, id, isComment);
    contentButtons.append(editButton, deleteButton);
  }

  if (isNew) {
    const input = document.createElement("textarea");
    setTimeout(() => {
      input.focus();
    }, 0);
    contentButtons.style.display = "none";

    input.addEventListener("keydown", async (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        if (input.value.trim() === "") {
          alert("Empty text");
          input.value = "";
          return;
        }
        pre.textContent = input.value;
        input.replaceWith(pre);
        contentButtons.style.display = "flex";

        try {
          await axios.post("http://localhost:4000/content-to-subject", {
            subject: subjectState.subject,
            content: input.value,
            username: nameProfile.textContent,
          });
        } catch (err) {
          console.log(err.message);
        }
      } else if (e.key === "Escape") {
        contentContainer.remove();
        localStorage.setItem(
      "user_data",
      JSON.stringify({ ...storage, isPosting: 0 }),
    );
      }
    });

    contentContainer.append(input, contentFooter);
  } else {
    pre.textContent = postContent;
    contentContainer.append(pre, contentFooter);
  }

  if (likeButton) {
    likes(likeButton, isLikeForPost);
  }

  return contentContainer;
}
