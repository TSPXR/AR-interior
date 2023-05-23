class CatalogWebsocket {
    constructor(categoryButton, roomButton, catalogCanvas, buttonId, socketURL, socketPort) {
        this.categoryButton = document.getElementsByName(categoryButton);
        this.roomButton = document.getElementsByName(roomButton);
        this.catalogCanvasBase = catalogCanvas;
        this.sendButtonId = document.getElementById(buttonId);
        this.socketURL = socketURL;
        this.socketPort = socketPort;
        this.selectCategoryButton = undefined;
        this.selectRoomButton = undefined;
        console.log(this.socketURL);
        console.log(this.socketPort);
        this.init();
    }

    init() {
        this.sendButtonId.disabled = false;
    }

    async sendMessages() {

        for(let i = 0; i < this.categoryButton.length; i++) {
            if(this.categoryButton[i].checked) {
                this.selectCategoryButton = this.categoryButton[i].value;
                break;
            }
        }

        for(let i = 0; i < this.roomButton.length; i++) {
            if(this.roomButton[i].checked) {
                this.selectRoomButton = this.roomButton[i].value;
                break;
            }
        }

        const wss = new WebSocket('wss://' + this.socketURL + ':'+ this.socketPort);
        
        wss.onopen = async () => {
            wss.send(this.selectCategoryButton + ':' + this.selectRoomButton);
        };
        
        wss.onmessage = async (event) => {
            let [imageIndex, base64Data] = event.data.split(':');
            let img = new Image();
            
            img.onload = () => {
                let canvas = document.getElementById('catalogCanvas'+ imageIndex);
                let context = canvas.getContext('2d');
    
                context.clearRect(0, 0, canvas.width, canvas.height);
                console.log(canvas.width, canvas.height)
    
                context.drawImage(img, 0, 0, 512, 512);
            }
            img.src = 'data:image/jpeg;base64,' + base64Data;
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