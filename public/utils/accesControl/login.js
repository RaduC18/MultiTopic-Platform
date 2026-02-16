export default function login() {
  const form = document.querySelector("#formLogin");
  const button = document.querySelector("button")
  const line = document.querySelector(".line")
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const checkErr = form.querySelector("p");

    if (checkErr) checkErr.remove();

    try {
      const response = await axios.post(
        "http://localhost:4000/login",
        {
          email: email,
          password: password,
        },
        {
          withCredentials: true,
        },
      );
      if (response.data.redirectUrl) {
        localStorage.setItem(
          "user_data",
          JSON.stringify({
            email: email,
            currentUserName: response.data.name,
            idCurerntUser: response.data.id,
            userName: "",
            isPosting: 0
          }),
        );
        window.location.href = response.data.redirectUrl;
      }
    } catch (err) {
      if (err.response) {
        const p = document.createElement("p");
        p.style.color = "red";
        p.style.textAlign = "center";
        p.style.margin = '0px'
        p.textContent = err.response.data.message;
        button.style.marginTop = '22px'
        form.insertBefore(p, button);
      } else {
        response.send(err.message);
      }
    }
  });
}
