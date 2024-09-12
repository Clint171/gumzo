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
        console.log(data);
    }).catch(error => {
        console.error(error);
    });
}