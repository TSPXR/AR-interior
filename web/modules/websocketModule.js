class CatalogWebsocket {
    constructor(radioButtonId, buttonId, socketURL, socketPort) {
        this.radioButtonId = document.getElementsByName(radioButtonId);
        this.sendButtonId = document.getElementById(buttonId);
        this.socketURL = socketURL;
        this.socketPort = socketPort;
        this.selectRadioButton = undefined;
        console.log(this.socketURL);
        console.log(this.socketPort);
        this.init();
    }

    init() {
        this.sendButtonId.disabled = false;
    }

    async sendMessages() {
        for(let i = 0; i < this.radioButtonId.length; i++) {
            if(this.radioButtonId[i].checked) {
                this.selectRadioButton = this.radioButtonId[i].value;
                break;
            }
        }

        const wss = new WebSocket('ws://' + this.socketURL + ':'+ this.socketPort);
        
        wss.onopen = async () => {
            wss.send('<B1>:' + this.selectRadioButton);
        };
        
        wss.onmessage = async (event) => {
            let rcvData = event.data;
            
            // TCP 서버에서 카탈로그 생성이 완료되었을 때
            if (rcvData == 'end') {
                
            }
        }

        wss.onerror = function(error) {
            console.error('WebSocket connection error', error);
        };
          
        wss.onclose = function(event) {
            console.log('WebSocket connection closed');
        };
    }
}

export { CatalogWebsocket } 