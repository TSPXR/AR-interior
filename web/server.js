let express = require('express');
let app = express();
let cors = require('cors');

let fs = require('fs');
let options = {
    key: fs.readFileSync('./web/ssl/_wildcard_.tsp-xr.com_2022112348E91.key.pem'),
    cert: fs.readFileSync('./web/ssl/_wildcard_.tsp-xr.com_2022112348E91.crt.pem'),
    requestCert: false,
    rejectUnauthorized: false
};
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(cors());

app.use('/', express.static(__dirname));
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/modules', express.static(__dirname + '/modules'));
app.use('/img', express.static(__dirname + '/img'));

let server_port = 5555;
let server = require('https').createServer(options, app);

app.get('/', (req, res) => {
    res.render(__dirname + '/productView.html');    // index.ejs을 사용자에게 전달
    console.log(__dirname);
})

server.listen(server_port, function() {
  console.log( 'Express server listening on port ' + server.address().port );
});