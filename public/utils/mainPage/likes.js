export default function likes(likeButton, isLikeForPost) {
  const storage = JSON.parse(localStorage.getItem("user_data"));
  const idCurerntUser = storage.idCurerntUser;

  let liked = false;

  const contentButtons = likeButton.closest(".contentButtons");

  const contentContainer = likeButton.closest(".content");
  const contentId = contentContainer.dataset.key;

  const h2 = document.createElement("span");
  h2.style.alignContent = "center";
  contentButtons.insertBefore(h2, likeButton);

  (async () => {
    try {
      const result1 = await axios.get(
        `http://localhost:4000/like/${contentId}?isLikeForPost=${isLikeForPost}`,
      );
      const likesNumber = result1.data;
      if (likesNumber > 0) {
        h2.textContent = likesNumber;
      } else {
        h2.textContent = "";
      }
    } catch (err) {
      console.log(err.message);
    }
  })();

  likeButton.addEventListener("click", async () => {
    liked = !liked;

    try {
      const result2 = await axios.patch("http://localhost:4000/like", {
        id: contentId,
        idCurerntUser: idCurerntUser,
        isLikeForPost: isLikeForPost,
      });
      const response = result2.data;

      if (response > 0) {
        h2.textContent = response;
      } else {
        h2.textContent = "";
      }
    } catch (err) {
      console.log(err.message);
    }
  });
}
