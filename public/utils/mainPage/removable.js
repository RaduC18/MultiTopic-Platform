export default function removable(deleteButton, content, id, isComment) {
  deleteButton.addEventListener("click", async () => {
    console.log(isComment);
    try {
      if (isComment) {
        const response = await axios.delete("http://localhost:4000/delete-comment", {
          data: {
            id: id,
          },
        });
        if(response.status === 200){
          content.remove();
        }
      } else {
        const response = await axios.delete("http://localhost:4000/delete-post", {
          data: {
            id: id,
          },
        });
        if(response.status === 200){
          content.remove();
        }
        console.log(content);
      }
    } catch (err) {
      console.log(err.message);
    }
  });
}
