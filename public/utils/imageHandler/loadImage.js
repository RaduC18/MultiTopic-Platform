import createUploadInput from "../userProfile/createUploadInput.js";

export default async function loadImage(imgElement, userName, isOwnProfile, name, storage) {
  async function loadImageFromServer(name, image) {
    try {
      const response = await axios.post(
        "http://localhost:4000/load-image",
        { name: name },
        { responseType: "blob" },
      );
      const imageUrl = URL.createObjectURL(response.data);
      image.src = imageUrl;
    } catch (err) {
      console.log("Eroare load profile image:", err.message);
    }
  }

  if (imgElement && userName) {
    try {
      await loadImageFromServer(userName, imgElement)
    return;
  } catch(err){
    console.log(err.message);
  }
  }

  const image = document.querySelector("#imageProfileContainer img") || document.querySelector("img");
  const header = document.querySelector("#uploadContainer h1");

  if (header) header.textContent = name;

  if (isOwnProfile) {
    await loadImageFromServer(name, image);
    createUploadInput(image, storage);
  } else {
    await loadImageFromServer(name, image);
  }
}