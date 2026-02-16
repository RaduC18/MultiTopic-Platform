import post from "./post.js";

export default function addButtonPattern() {
  const addButton = document.createElement("button");
  addButton.textContent = "Add";
  addButton.classList.add("add");
  addButton.id = "addContent";

  addButton.addEventListener("click", async () => {
    const storage = JSON.parse(localStorage.getItem("user_data"));
    const currentUserName = storage.currentUserName;

    if (storage.isPosting === 0) {
      try {
        localStorage.setItem(
          "user_data",
          JSON.stringify({ ...storage, isPosting: 1 }),
        );
        const response = await axios.get("http://localhost:4000/get-lastId");
        if (response.status === 200) {
          const lastId = response.data;
          const newPost = post("", currentUserName, lastId + 1, false, true);
          const dashboardFirstChild = dashboard.firstChild;
          dashboard.insertBefore(newPost, dashboardFirstChild);
        }
      } catch (err) {
        console.log(err.message);
      }
    } else {
      alert("You are already drafting a new post");
    }
  });
  const dashboardButtons = document.querySelector("#dashboardButtons");
  dashboardButtons.append(addButton);
}
