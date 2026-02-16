import post from "./post.js";
import addButtonPattern from "./addButtonPattern.js";

export default function searchButton() {
  const searchButton = document.querySelector("#searchButton");
  const dashboard = document.querySelector("#dashboard");
  const input = document.createElement("input");
  
  const handleKeydown = async (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
      if (input.value.trim() === "") {
        alert("Unavailable topic!");
        input.value = "";
        input.removeEventListener("keydown", handleKeydown);
        input.replaceWith(searchButton);
        return;
      }
      const existentAddButton = document.querySelector('#addContent');
      if(existentAddButton) existentAddButton.remove();
      try {
        const response = await axios.get(
          `http://localhost:4000/search-subject?subject=${input.value}`,
        );

        dashboard.innerHTML = "";

        const result = response.data;

        result.forEach((postElement) => {
          const userPost = post(
            postElement.content,
            postElement.name,
            postElement.id,
            false,
            false,
          );
          dashboard.append(userPost);
        });
        addButtonPattern()
      } catch (err) {
        if (err.status === 404) {
          alert("No topics with this title");
        }
        console.log(err.message);
      }
    } else if(e.key === 'Escape'){
      input.value = '';
      input.removeEventListener("keydown", handleKeydown);
      input.replaceWith(searchButton);
    }
  };

  searchButton.addEventListener("click", () => {
    searchButton.replaceWith(input);
    input.style.boxSizing = "border-box";
    input.style.height = "4rem";
    input.focus();
    
    input.addEventListener("keydown", handleKeydown);
  });
}