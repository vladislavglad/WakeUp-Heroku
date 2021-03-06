const form = document.querySelector("form");
const API = "https://wakeup-heroku.herokuapp.com/request";

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const URL = new FormData(form).get("url");
    console.log(URL);

    const res = await fetch(API, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({URL})
    });

    const jsonData = await res.json();
    console.log(jsonData);
});