export default function chanHrefProfileButton(){
  const storage = JSON.parse(localStorage.getItem("user_data"));
  const name = storage.currentUserName.replace(' ', '');
  const profileButton = document.querySelectorAll('nav a')[1];
  profileButton.href = `/${name}`;
}