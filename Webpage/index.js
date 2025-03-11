var ws = new WebSocket();

function connectToWebSocket(){
    console.log("Attempting to establish connection with socket...");
    document.getElementById("response").innerHTML = '<p>Attempting to establish connection with socket...</p>';

    ws = new WebSocket("ws://127.0.0.1:4001");

    ws.onmessage = (recievedMessage) => {
        console.log(recievedMessage);

        messageData = JSON.parse(recievedMessage.data);
        if(messageData.type == "URL"){
            URLMessage(messageData);
        } else {
            messageProcess(messageData);
        }        
    };

    ws.onerror = () => {
        console.log("WS has disconnected!");
    };
    
    document.getElementById("response").innerHTML += '<p class="onsuccess">Connection successful!</p>'
    console.log("Connection successful!");
}

function URLMessage(messageData){
    if(messageData.error == ""){
        message = `<p>${messageData.senderId}: <img class="gifimage" src="${messageData.content}" alt="gif"></p>`;
        
        document.getElementById("chatBox").innerHTML += message;
    } else if(messageData.error == "Invalid URL") {
        alert("The GIF URL must be from Tenor!");
    } else if(messageData.error == "Not a URL"){
        alert("Please insert a valid URL!");
    }
}

function messageProcess(messageData){
    message = `${messageData.senderId}: ${messageData.content}`;
    messageParagraph = document.createElement("p");
    messageParagraph.appendChild(document.createTextNode(message));

    document.getElementById("chatBox").appendChild(messageParagraph);
}

function disconnectFromWebSocket(){
    document.getElementById("response").innerHTML = '<p>Severing the connection to chat...</p>';

    ws.close();

    document.getElementById("response").innerHTML += '<p>Disconnected!</p>';
}

function sendMessage(){
    message = document.getElementById("messageInput").value;
    document.getElementById("messageInput").value = "";

    ws.send(JSON.stringify(message));
}