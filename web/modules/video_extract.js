import * as THREE from './three.js/three.module.js';
import { OrbitControls } from './three.js/controls/OrbitControls.js';
import {OBJLoader} from './three.js/loaders/OBJLoader.js';

class VideoFrameExtractor {
    constructor(videoInputId, canvasId) {
        this.videoInput = document.getElementById(videoInputId);
        this.renderCanvasId = document.getElementById(canvasId);
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

        while (currentTime < video.duration) {
            video.currentTime = currentTime;
            console.log('capture frames');
            await new Promise((resolve) => video.addEventListener('seeked', resolve, { once: true }));
            await this.captureFrame(video);
            currentTime += interval / 1000;
        }
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
        // const wss = new WebSocket('ws://127.0.0.1:7777');
        const wss = new WebSocket('wss://park-tdl.tsp-xr.com:7777');

        wss.onopen = async () => {
            wss.send('send');
    
            for (let i = 0; i < this.frames.length; i++) {
                let blob = this.frames[i];
    
                let base64Data = await this.blobToBase64(blob);
    
                wss.send(base64Data);
            }
            wss.send('end');
        };
        
        wss.onmessage = async (event) => {
            let rcvData = event.data;

            this.rcvBufferArray.push(rcvData)
            console.log(this.rcvBufferArray)
            
            if (rcvData == 'end'){
                
                // 배열을 정렬
                this.rcvBufferArray.sort((a, b) => {
                    // ':' 앞의 숫자를 추출하여 정수로 변환
                    let indexA = parseInt(a.split(':')[0]);
                    let indexB = parseInt(b.split(':')[0]);

                    // 인덱스를 비교하여 정렬
                    return indexA - indexB;
                });
                
                this.rcvBufferArray = this.rcvBufferArray.map(item => {
                    // ':' 이후의 부분을 반환
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
    
                console.log('modelURL : ', this.modelURL)
        
                this.loadModelFromURL();

                this.rcvBufferArray = [];
                console.log(this.rcvBufferArray)
            }
            
            // console.log('Received data');
            
            // console.log(typeof event.data);
            // console.log(event.data);
            
            
           
        }

        // wss.onmessage = async (event) => {
        //     let rcvData = event.data;
            
        //     console.log('Received data');
            
        //     console.log(typeof event.data);
        //     console.log(event.data);
            
            
        //     let binaryData = atob(event.data);
            
            
        //     let len = binaryData.length;
        //     let array = new Uint8Array(len);
            
        //     for (let i = 0; i < len; i++) {
        //         array[i] = binaryData.charCodeAt(i);
        //     }
        //     let blob = new Blob([array.buffer], {type: 'text/plain'});

        //     this.modelURL = URL.createObjectURL(blob);
  
        //     console.log('modelURL : ', this.modelURL)
    
        //     this.loadModelFromURL();
        // }
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