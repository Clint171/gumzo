window.onload = function(){
    if(localStorage.getItem("accessToken")){
        // Remove the login button and show the logout button
        document.querySelector("#login").style.display = "none";
        document.querySelector(".g_id_onload").style.display = "none";
        document.querySelector("#logout").style.display = "block";
        const user = JSON.parse(localStorage.getItem("user"));
        document.querySelector("#profileImg").src = user.picture;
    }
}

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
        document.querySelector("#login").style.display = "none";
        document.querySelector("#logout").style.display = "block";

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));


    }).catch(error => {
        console.error(error);
    });
}

function handleLogout(){
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    document.querySelector("#login").style.display = "block";
    document.querySelector("#logout").style.display = "none";
    document.querySelector("#profileImg").src = "https://png.pngtree.com/png-clipart/20210915/ourmid/pngtree-user-avatar-placeholder-png-image_3918418.jpg";
    location.reload();
}

document.querySelector("#logout").addEventListener("click", () => {
    handleLogout();
});

function initiateSocket(){
    const socket = io("http://localhost:3000");
    socket.on("connect", () => {
        console.log("Connected to the websocket server");
    });

    socket.on("AI-message", (data) => {
        console.log(data);
        const message = document.createElement("div");
        message.innerHTML = `<strong>${data.user.name}</strong>: ${data.message}`;
        document.querySelector("#chat").appendChild(message);
    });

    document.querySelector("#send").addEventListener("click", () => {
        const message = document.querySelector("#message").value;
        socket.emit("message", message);
    });
}