function handleCredentialResponse(response){
    fetch("http://localhost:3000/login" , {
        method: 'POST',
        body: JSON.stringify({token: response.credential}),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if(response.status === 201){
            return response.json();
        } else {
            throw new Error("Invalid token");
        }
    }).then(data => {
        console.log(data.user);
        document.querySelector("#profileImg").src = data.user.picture;
        document.querySelector("#head").innerText += ` - ${data.user.name}`;
        document.querySelector("#login").style.display = "none";
        document.querySelector("#logout").style.display = "block";

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
    }).catch(error => {
        console.error(error);
    });
}