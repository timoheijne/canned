const ipc = require('electron').ipcRenderer; 

// ipc.on()

function sendText(event) {
    console.log(event)
    if(event.keyCode == 13) {
        let reply = ipc.send('helloSync','a string', 10);
        console.log(reply)
    }
}

window.addEventListener('keyup', sendText, true)

