import { VideoFrameExtractor } from './videoExtractor.js';

const extractor = new VideoFrameExtractor(
    `videoInput`,
    'viewerCanvas',
    'sendButton',
    'park-tdl.tsp-xr.com',
    '7777');

const videoNullCheckButton = document.getElementById('sendButton');
videoNullCheckButton.addEventListener('click', () => extractor.sendImages());