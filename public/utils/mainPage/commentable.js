import { commentState } from "./commentState.js";
import post from "./post.js";

export default async function commentable(commentButton) {
  const storage = JSON.parse(localStorage.getItem("user_data"));
  const currentUserName = storage.currentUserName;

  commentButton.addEventListener("click", async (e) => {
    const dialog = document.createElement("dialog");
    console.log(commentState.postId);
    dialog.classList.add("modal");
    dialog.addEventListener("close", () => {
      commentState.postId = "";
      dialog.remove();
    });
    console.log(commentState.postId);

    const content = e.target.closest(".content");
    const postId = content.getAttribute("data-key");
    commentState.postId = postId;
    const postText = content.querySelector("pre");

    const p = document.createElement("pre");
    p.textContent = postText.textContent;
    const textPostContainer = document.createElement("div");
    textPostContainer.classList.add("textPostContainer");
    textPostContainer.append(p);

    const line = document.createElement("div");
    line.classList.add("line");

    const commentsContainer = document.createElement("div");
    commentsContainer.classList.add("commentsContainer");
    commentsContainer.append(textPostContainer, line);

    try {
      const response = await axios.get(
        `http://localhost:4000/display-comment?post-id=${postId}`,
      );
      const result = response.data;

      result.forEach((commentElement) => {
        const userName = commentElement.username;
        const postId = commentElement.id;
        const commentText = commentElement.commenttext;
        const userComment = post(
          commentText,
          userName,
          postId,
          true,
          false,
          false,
        );
        commentsContainer.append(userComment);
      });
    } catch (err) {
      console.log(err.message);
    }

    const form = document.createElement("form");
    form.method = "dialog";
    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    form.append(closeButton);

    const input = document.createElement("textarea");
    input.classList.add("inputForPostingComments");
    input.addEventListener("keydown", async (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        try {
          const result = await axios.post(
            "http://localhost:4000/create-comment",
            {
              postId: commentState.postId,
              content: input.value,
              userName: currentUserName,
            },
          );
          if (result.status === 200) {
            commentsContainer.append(
              post(
                input.value,
                currentUserName,
                commentState.postId,
                true,
                false,
                "false",
              ),
            );
            input.value = "";
          }
        } catch (err) {
          console.log(err.message);
        }
      }
    });
    const footerContainer = document.createElement("div");
    footerContainer.classList.add("footerContainer");
    footerContainer.append(input, form);

    dialog.append(commentsContainer, footerContainer);
    const dashboard = document.querySelector("#dashboard");
    dashboard.appendChild(dialog);
    dialog.showModal();
  });
}
