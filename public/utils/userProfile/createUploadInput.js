export default function createUploadInput(imageElement, storage) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.classList.add("profile-input");
  input.style.display = "block";
  input.style.paddingInlineStart = "30px";

  const container = document.querySelector("#imageProfileContainer");
  if (container) {
    container.append(input);

    input.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (file && imageElement && storage) {
        imageElement.src = URL.createObjectURL(file);

        const formData = new FormData();
        formData.append("email", storage.email);
        formData.append("image", file);
        

        try {
          await axios.post("http://localhost:4000/view-image", formData);
        } catch (err) {
          const message = document.createElement('p');
          message.textContent = 'Upload failed';
          message.insertAdjacentElement("afterend", input);
        }
      }
    });
  }
}