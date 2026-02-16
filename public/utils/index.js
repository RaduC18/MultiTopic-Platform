import { createSubject } from "./mainPage/createSubject.js";
import searchButton from "./mainPage/searchButton.js";
import displayPost from "./mainPage/displayPost.js";
import displaySubject from "./mainPage/displaySubject.js";
import modifyEmail from "./editProfile/modifyEmail.js";
import modifyPassword from "./editProfile/modifyPassword.js";
import modifyName from "./editProfile/modifyName.js";
import profile from "./userProfile/profile.js";
import login from "./accesControl/login.js";
import register from "./accesControl/register.js";
import logout from "./accesControl/logout.js";
import chanHrefProfileButton from "./changeHrefProfileButton.js";


if(document.querySelector('#bodyMain')){
  const addButtonSubject = document.querySelector("#addSubject");
  const ol = document.querySelector("main ol");  

  logout();

  chanHrefProfileButton();

  displaySubject(ol);
  displayPost(ol);

  searchButton();

  addButtonSubject.addEventListener("click", () => {
    const subject = createSubject();
    ol.prepend(subject);
  });
}

if(document.querySelector('#bodyProfile')){
  logout();
  chanHrefProfileButton();
  profile();
}

if(document.querySelector('#bodyEditProfile')){
  logout();
  chanHrefProfileButton();
  modifyEmail();
  modifyPassword();
  modifyName();
  
}

if(document.querySelector('.formLoginAndRegister')){
  register();
  login();
}





