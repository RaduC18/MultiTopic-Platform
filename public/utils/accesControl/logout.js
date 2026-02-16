export default function logout(){
    const logOutButton = document.querySelector('.logOut');

    logOutButton.addEventListener('click', async () => {
        try {
      await axios.post('http://localhost:4000/logout', {}, {
        withCredentials: true
      });

      localStorage.removeItem("user_data");
      sessionStorage.clear();

      window.location.href = "/";
      
    } catch (err) {
      console.error(err.message);
      
      localStorage.removeItem("user_data");
      sessionStorage.clear();
      window.location.href = "/";
    }
    })
}