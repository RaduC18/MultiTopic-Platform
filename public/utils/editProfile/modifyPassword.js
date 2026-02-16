export default function modifyPassword() {
  const storage = JSON.parse(localStorage.getItem("user_data"));
  const oldPassword = document.querySelector('input[name="oldPassword"]');
  const newPassword = document.querySelector('input[name="newPassword"]');
  const confirmPassword = document.querySelector(
    'input[name="newPasswordConfirmation"]',
  );
  const form = document.querySelectorAll(".formEditProfile")[1];
  const passwordButton = document.querySelector(".passwordButton");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log(storage.email);

    if (form.querySelector("p")) form.querySelector("p").remove();

    if (e.submitter === passwordButton) {
      if (oldPassword.value === newPassword.value) {
        const p = document.createElement("p");
        p.textContent = "New password cannot be the same as the old one";
        p.style.color = "red";
        p.style.display = "inline";
        document.querySelector(".containerForModifyPasswordButton").append(p);
      } else if (newPassword.value !== confirmPassword.value) {
        const p = document.createElement("p");
        p.textContent = "Passwords do not match.";
        p.style.color = "red";
        p.style.display = "inline";
        document.querySelector(".containerForModifyPasswordButton").append(p);
      } else {
        try {
          const response = await axios.post(
            "http://localhost:4000/modify-password",
            {
              oldPassword: oldPassword.value,
              newPassword: newPassword.value,
              confirmPassword: confirmPassword.value,
              email: storage.email,
            },
          );
          if (response.status) {
            const p = document.createElement("p");
            p.textContent = response.data.message;
            p.style.color = "green";
            p.style.display = "inline";
            document
              .querySelector(".containerForModifyPasswordButton")
              .append(p);
          }
        } catch (err) {
          if (err.response) {
            const p = document.createElement("p");
            p.textContent = err.response.data.message;
            p.style.color = "red";
            p.style.display = "inline";
            document
              .querySelector(".containerForModifyPasswordButton")
              .append(p);
          }
        }
      }
    }
  });
}
