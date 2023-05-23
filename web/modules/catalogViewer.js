import {CatalogWebsocket} from './websocketModule.js';

const websocketModule = new CatalogWebsocket(
    'category',
    'roomName',
    'catalogCanvas',
    'sendButton',
    '127.0.0.1',
    '7778');

const videoNullCheckButton = document.getElementById('sendButton');
videoNullCheckButton.addEventListener('click', () => websocketModule.sendMessages());