let context = {
    selectedChat : null,
    chatImg : null,
    chatName : null,
}

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("Connected to the websocket server");
});

window.onload = function(){
    if(localStorage.getItem("accessToken")){
        // Remove the login button and show the logout button
        document.querySelector("#login").remove();
        document.querySelector("#g_id_onload").remove();
        document.querySelector("#logout_div").style.display = "block";
        const user = JSON.parse(localStorage.getItem("user"));
        document.querySelector("#profileImg").src = user.picture;
    }
}

function handleCredentialResponse(response){

    socket.emit("login", response.credential);

    socket.on("login", (data) => {
        console.log(data.user);
        document.querySelector("#profileImg").src = data.user.picture;
        document.querySelector("#login").style.display = "none";
        document.querySelector("#logout_div").style.display = "block";

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
    });

    socket.on("login-error", (error) => {
        alert("Error logging in")
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

const menuItems = document.querySelectorAll('.menu-item');

// Loop through each menu item and add an event listener
menuItems.forEach((item) => {
    item.addEventListener('click', () => {
        // Get the img src and span text content
        const imgUrl = item.querySelector('img').src;
        const chatName = item.querySelector('#userName').textContent;

        // Log or use the values as needed
        console.log('Image URL:', imgUrl);
        console.log('Chat Name:', chatName);

        context.selectedChat = item.querySelector('#userId').textContent;
        context.chatImg = imgUrl;
        context.chatName = chatName;
        updateChatHeader();
    });
});

function updateChatHeader(){
    document.querySelector("#chat-image").querySelector("img").src = context.chatImg;
    document.querySelector("#chat-head").textContent = context.chatName;
}

document.querySelector("#send").addEventListener("click", () => {
    const message = document.querySelector("#message").value;
    const chat = context.selectedChat;

    // Check if it is AI context
    if(context.selectedChat == "AI"){
        socket.emit("AI-message", message);
    }

    // Clear the input field
    document.querySelector("#message").value = "";

});

socket.on("AI-message-started", () => {
    console.log("AI message started");
    let receiveDiv = document.createElement("div");
    receiveDiv.classList.add("receiveDiv");
    receiveDiv.id = "current";
    document.querySelector("#chat").appendChild(receiveDiv);
});

socket.on("AI-message", (message) => {
    let currentDiv = document.querySelector("#current");
    currentDiv.textContent += message;
});

socket.on("AI-message-done", () => {
    console.log("AI message ended");
    document.querySelector("#current").id = "";
});

socket.on("Error", (error) => {
    console.error(error);
});