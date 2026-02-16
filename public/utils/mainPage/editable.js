export default function editable(editButton, pre, buttonsContainer, id, isComment) {
  editButton.addEventListener("click", () => {
    buttonsContainer.style.display = "none";

    const input = document.createElement("textarea");
    input.value = pre.textContent;
    pre.replaceWith(input);

    input.addEventListener("keydown", async (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        pre.textContent = input.value;
        input.replaceWith(pre);
        buttonsContainer.style.display = "flex";
        console.log(pre.textContent);
        try {
          if(isComment){
            await axios.post("http://localhost:4000/comment-to-edit", {
            id: id,
            content: input.value,
          });
          } else{
            await axios.post("http://localhost:4000/post-to-edit", {
            id: id,
            content: input.value,
          });
          }
          
        } catch (err) {
          console.log(err.message);
        }
      }
    });
  });
}
