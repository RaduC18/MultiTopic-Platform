import chanHrefProfileButton from "../changeHrefProfileButton.js";

export default function modifyName() {
  const storage = JSON.parse(localStorage.getItem("user_data"));
  const name = document.querySelector('input[name="name"]');
  const form = document.querySelectorAll(".formEditProfile")[2];
  const nameButton = document.querySelector(".nameButton");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (e.submitter === nameButton) {
        console.log(storage.email);
      if (form.querySelector("p")) form.querySelector("p").remove();
      try {
        const response = await axios.post("http://localhost:4000/modify-name", {
          name: name.value,
          email: storage.email,
        });
        if (response.data) {
          console.log("aaa");
          const p = document.createElement("p");
          p.textContent = response.data.message;
          p.style.color = "green";
          p.style.display = "inline";
          document.querySelector(".containterForModifyNameButton").append(p);
          localStorage.setItem("user_data", JSON.stringify({...storage, currentUserName: name.value}));
          chanHrefProfileButton();
        }
      } catch (err) {
        if (err.response) {
          const p = document.createElement("p");
          p.textContent = err.response.data.message;
          p.style.color = "red";
          p.style.display = "inline";
          document.querySelector(".containterForModifyNameButton").append(p);
        }
      }
    };
    form.reset();
  });
}
