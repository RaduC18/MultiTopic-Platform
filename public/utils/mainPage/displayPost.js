import post from "./post.js";
import addButtonPattern from "./addButtonPattern.js";
import { subjectState } from "./subjectState.js";

export default function displayPost(ol) {
  console.trace();
  let lastButtonPressed = "";
  ol.addEventListener("click", async (e) => {
    const storage = JSON.parse(localStorage.getItem("user_data"));
    const currentUserName = storage.currentUserName;
    
    if(storage.isPosting === 1){
      localStorage.setItem('user_data', JSON.stringify({
        ...storage,
        isPosting: 0
      }))
    }
    
    const dashboard = document.querySelector("#dashboard");
    const button = e.target.closest("button");
    if (!button) return;

    if (lastButtonPressed === button.textContent) return;
    const addButtonOld = document.querySelector("#addContent");
    if (addButtonOld) addButtonOld.remove();

    if (!button.querySelector("input")) {
      subjectState.subject = button.textContent;

      try {
        if (dashboard.firstElementChild) {
          dashboard.innerHTML = "";
        }
        const response = await axios.get(
          `http://localhost:4000/create-table?subject=${button.textContent}`,
        );
        const result = response.data;

        result.forEach((postElement) => {
          const userPost = post(
            postElement.content,
            postElement.name,
            postElement.id,
            false,
            false,
            'true'
          );
          dashboard.append(userPost);
        });
      } catch (err) {
        console.log(err.message);
      }
     addButtonPattern();
    }
    lastButtonPressed = button.textContent;
  });
}
