import {CatalogWebsocket} from './websocketModule.js';

const websocketModule = new CatalogWebsocket(
    'category',
    'roomName',
    'catalogCanvas',
    'sendButton',
    'park-tdl.tsp-xr.com',
    '7778');

const videoNullCheckButton = document.getElementById('sendButton');
videoNullCheckButton.addEventListener('click', () => websocketModule.sendMessages());