import * as THREE from './three.js/three.module.js';
import { OrbitControls } from './three.js/controls/OrbitControls.js';
import {OBJLoader} from './three.js/loaders/OBJLoader.js';

class VideoFrameExtractor {
    constructor(videoInputId, canvasId, buttonId, socketURL, socketPort) {
        this.videoInput = document.getElementById(videoInputId);
        this.renderCanvasId = document.getElementById(canvasId);
        this.sendButtonId = document.getElementById(buttonId);
        this.socketURL = socketURL;
        this.socketPort = socketPort;
        console.log(this.socketURL);
        console.log(this.socketPort);
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
        this.frames = [];
        this.rcvBufferArray = [];
        this.modelURL = undefined;
        
        this.loader = new OBJLoader();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({ canvas: this.renderCanvasId });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

          // Add lights to the scene
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 2);
        pointLight.position.set(50, 50, 50);
        this.scene.add(pointLight);

        this.init();
    }

    init() {
        this.videoInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);

        await new Promise((resolve) => {
            video.addEventListener('loadedmetadata', () => {
            this.canvas.width = video.videoWidth;
            this.canvas.height = video.videoHeight;
            resolve();
            });
        });
        
        await this.processVideo(video);
        console.log(`${this.videoInput.id}의 총 ${this.frames.length} 개의 프레임이 추출되었습니다.`);
        console.log('this is client')

        });
    }

    async processVideo(video) {
        const interval = 250;
        let currentTime = 0;
        
        console.log('프레임 추출 시작');
        while (currentTime < video.duration) {
            video.currentTime = currentTime;
            console.log('capture frames');
            await new Promise((resolve) => video.addEventListener('seeked', resolve, { once: true }));
            await this.captureFrame(video);
            currentTime += interval / 1000;
        }
        console.log('프레임 추출 종료');
        this.sendButtonId.disabled = false;
    }

    async captureFrame(video) {
        return new Promise((resolve) => {
            this.context.drawImage(video, 0, 0);
            this.canvas.toBlob((blob) => {
            this.frames.push(blob);
            resolve();
            });
        });
    }
    
    async sendImages() {
        // 이미지 전송을 눌렀을 때 중복 전송을 방지하기 위한 버튼 비활성화
        if (this.sendButtonId.disabled == false){
            this.sendButtonId.disabled = true;
        }

        const wss = new WebSocket('ws://' + this.socketURL + ':'+ this.socketPort);
        
        wss.onopen = async () => {
            wss.send('send');
            for (let i = 0; i < this.frames.length; i++) {
                let blob = this.frames[i];
    
                let base64Data = await this.blobToBase64(blob);
    
                wss.send(base64Data);
            }
            wss.send('end');

            console.log('send all images');
        };
        
        wss.onmessage = async (event) => {
            let rcvData = event.data;

            this.rcvBufferArray.push(rcvData);
            
            if (rcvData == 'end'){  
                this.rcvBufferArray.sort((a, b) => {
                    let indexA = parseInt(a.split(':')[0]);
                    let indexB = parseInt(b.split(':')[0]);
                    return indexA - indexB;
                });
                
                this.rcvBufferArray = this.rcvBufferArray.map(item => {
                    return item.split(':')[1];
                });
                
                this.rcvBufferArray = this.rcvBufferArray.join('');
                
                let binaryData = atob(this.rcvBufferArray);
            
                let len = binaryData.length;
                let array = new Uint8Array(len);
                
                for (let i = 0; i < len; i++) {
                    array[i] = binaryData.charCodeAt(i);
                }
                let blob = new Blob([array.buffer], {type: 'text/plain'});

                this.modelURL = URL.createObjectURL(blob);
        
                this.loadModelFromURL();

                this.rcvBufferArray = [];
            }   
        }

        wss.onerror = function(error) {
            console.error('WebSocket connection error', error);
        };
          
        wss.onclose = function(event) {
            console.log('WebSocket connection closed');
        };
    }
    
    loadModelFromURL() {
        console.log(this.modelURL)
        this.loader.load(this.modelURL, (object) => {
            
            this.scene.add(object);
        });
        this.renderViewer()
    }


    blobToBase64(blob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = function() {
                resolve(reader.result);
            }
            reader.readAsDataURL(blob);
        });
    }

    renderViewer() {
        requestAnimationFrame(this.renderViewer.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
}

export { VideoFrameExtractor } 