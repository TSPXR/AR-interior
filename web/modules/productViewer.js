import { VideoFrameExtractor } from "./videoExtract.js";

const videoNum = 4;
const videoFrameList = [];

for (let i = 1; i <= videoNum; i++) {
  const extractor = new VideoFrameExtractor(`videoInput${i}`);
  videoFrameList.push(extractor.frames);
}

const viewer = document.getElementById("viewer");
const currentImage = document.getElementById("currentImage"); 

function videoNullCheck() {
  let nullVideoIndex = [];

  for (let i = 0; i < videoNum; i++) {
    if (videoFrameList[i].length == 0) {
      console.log(`Video ${i + 1} list length is 0`);
      alert(`Video ${i + 1}번이 로드되지 않았습니다.`);
      nullVideoIndex.push(i + 1);
    }
  }

  if (nullVideoIndex.length == 0) {
    testFunc();
    console.log('start testFunc');
  }
}

const videoNullCheckButton = document.getElementById("checkbutton");
videoNullCheckButton.addEventListener('click', videoNullCheck);

function testFunc(){
    const cameras = ['camera1', 'camera2', 'camera3', 'camera4'];
    
    currentImage.src = URL.createObjectURL(videoFrameList[2][12]);

    console.log(currentImage.src);
    const totalImages = videoFrameList[0].length;

    let currentImageIndex = 1;
    let currentCameraIndex = 0;

    function updateImage() {
        currentImage.src = URL.createObjectURL(videoFrameList[currentCameraIndex][currentImageIndex-1]);
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function handleStart(e) {
        e.preventDefault();
        const startX = e.clientX || e.touches[0].clientX;
        const startY = e.clientY || e.touches[0].clientY;
        const initialImageIndex = currentImageIndex;
        const initialCameraIndex = currentCameraIndex;

        function handleMove(e) {
            const deltaX = (e.clientX || e.touches[0].clientX) - startX;
            const deltaY = (e.clientY || e.touches[0].clientY) - startY;


            currentImageIndex = Math.round(initialImageIndex + (deltaX / viewer.clientWidth) * totalImages);
            currentImageIndex = ((currentImageIndex - 1) % totalImages + totalImages) % totalImages + 1; // Wrap around index

            currentCameraIndex = clamp(Math.round(initialCameraIndex - (deltaY / viewer.clientHeight) * (cameras.length - 1)), 0, cameras.length - 1);
            updateImage();
        }

        function handleEnd() {
            viewer.removeEventListener("mousemove", handleMove);
            viewer.removeEventListener("touchmove", handleMove);
            viewer.removeEventListener("mouseup", handleEnd);
            viewer.removeEventListener("touchend", handleEnd);
        }

        viewer.addEventListener("mousemove", handleMove);
        viewer.addEventListener("touchmove", handleMove);
        viewer.addEventListener("mouseup", handleEnd);
        viewer.addEventListener("touchend", handleEnd);
    }
    viewer.addEventListener("mousedown", handleStart);
    viewer.addEventListener("touchstart", handleStart);
}
