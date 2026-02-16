import loadImage from "../imageHandler/loadImage.js";

export default async function profile() {
  const img = document.querySelector("img");
  const uploadButton = document.querySelector(".uploadButton");
  const repliesNumber = document.querySelector(".repliesNumber");
  const signedFrom = document.querySelector(".signedFrom");

  const storage = JSON.parse(localStorage.getItem("user_data"));
  const currentUserName = storage.currentUserName;
  const isOwnProfile = window.location.pathname === `/${currentUserName.replace(" ", "")}`;
  const name = isOwnProfile ? storage.currentUserName : storage.userName;

  loadImage(null, null, isOwnProfile, name, storage);

  try{
    const response = await axios.get(`http://localhost:4000/user-information/${name}`);
  const result = response.data;
  const {totalReplies, creationDate} = result;
  repliesNumber.textContent += totalReplies;
  signedFrom.textContent += creationDate;
  } catch(err){
    const message = document.createElement('p');
    message.textContent = err.response.data.message;
    message.insertAdjacentElement("afterend", signedFrom);
  }

  
}
