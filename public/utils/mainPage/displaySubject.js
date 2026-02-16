export default async function displaySubject(ol) {
  try {
    const response = await axios.get("http://localhost:4000/subject");
    const result = response.data;

    result.forEach((item) => {
      const li = document.createElement("li");
      const button = document.createElement("button");

      button.textContent = item.subject;
      li.prepend(button);
      ol.append(li);
    });
  } catch (err) {
    console.log(err.message);
  }
}
