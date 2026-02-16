export function createSubject() {
  const li = document.createElement("li");
  const button = document.createElement("button");
  const input = document.createElement("input");
  const handleKeydown = async (e) => {
  if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
    const text = input.value.trim();
    if (!text){
      alert('Empty text!');
      li.remove();
      return;
    }

    try {
      await axios.post("http://localhost:4000/create-subject", { subject: text });
      
      button.textContent = text; 
    } catch (err) {
      if (err.response.status === 409) {
        alert('Duplicate');
        li.remove();
      };
      
    }
  } else if(e.key === 'Escape'){
      input.value = '';
      li.removeEventListener("keydown", handleKeydown);
      li.remove();
    }
};

  input.addEventListener("keydown", handleKeydown);
  button.append(input);
  li.append(button);

  return li;
}
