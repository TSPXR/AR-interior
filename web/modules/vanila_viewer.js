import { VideoFrameExtractor } from './video_extract.js';

const extractor = new VideoFrameExtractor(`video-input`, 'viewerCanvas');
extractor.frames;

const viewer = document.getElementById('viewer');
const currentImage = document.getElementById('current-image'); 

const videoNullCheckButton = document.getElementById('checkbutton');
videoNullCheckButton.addEventListener('click', videoNullCheck);

function videoNullCheck() {  
  if (extractor.frames.length == 0) {
      alert(`Video가 로드되지 않았습니다.`);    
    }
  else {
    testFunc();
    console.log('start testFunc');
  }
}

// Test
function testFunc(){

  extractor.sendImages()
}