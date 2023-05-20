import { VideoFrameExtractor } from './videoExtract.js';

const extractor = new VideoFrameExtractor(
    `videoInput`,
    'viewerCanvas',
    'sendButton',
    '127.0.0.1',
    '7777');

const videoNullCheckButton = document.getElementById('sendButton');
videoNullCheckButton.addEventListener('click', () => extractor.sendImages());