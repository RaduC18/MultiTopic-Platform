export default function modifyEmail() {
  const storage = JSON.parse(localStorage.getItem('user_data'))
  const currentEmail = document.querySelector('input[name="currentEmail"]');
  currentEmail.value = storage.email;
  const email = document.querySelector('input[name="email"]');
  const password = document.querySelector('input[name="password"]');
  const form = document.querySelectorAll(".formEditProfile")[0];
  const emailButton = document.querySelector(".emailButton");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (form.querySelector("p")) form.querySelector("p").remove();

    if (e.submitter === emailButton) {
      if (currentEmail.value === email.value) {
        const p = document.createElement("p");
        p.textContent = "Same email";
        p.style.color = "red";
        p.style.display = "inline";
        document.querySelector(".containerForModifyEmailButton").append(p);
      } else {
        try {
          const response = await axios.post(
            "http://localhost:4000/modify-email",
            {
              currentEmail: currentEmail.value,
              email: email.value,
              password: password.value,
            }
          );
          if (response.status) {
            const p = document.createElement("p");
            p.textContent = response.data.message;
            p.style.color = "green";
            p.style.display = "inline";
            document.querySelector(".containerForModifyEmailButton").append(p);
            storage.email = email.value;
            localStorage.setItem(
              "user_data",
              JSON.stringify({...storage, email: email.value })
            );
            currentEmail.value = storage.email;
          }
        } catch (err) {
          if(err.response){
             const p = document.createElement("p");
            p.textContent = err.response.data.message;
            p.style.color = "red";
            p.style.display = "inline";
            document.querySelector(".containerForModifyEmailButton").append(p);
          }
          console.log(err.message);
        }
      }
    }
  });
}
