export default function register() {
  const form = document.querySelector("#formRegister");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    console.log(email);

    const checkErr = form.querySelector("p");

    if (checkErr) checkErr.remove();

    try {
      const response = await axios.post("http://localhost:4000/register", {
        email: email,
        password: password,
      });
    } catch (err) {
      if (err.response) {
        const p = document.createElement("p");
        p.style.color = "red";
        p.style.textAlign = "center";
        p.textContent = err.response.data.message;
        form.append(p);
      }
      console.log(err.message);
    }
  });
}
