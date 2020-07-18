//@ts-check
const http = require('http');
const help = require('../help');

const port = 3004;
const ip = "0.0.0.0";

let r = null

const requestHandler = (request, response) => {
    const headers = { "content-type": "application/json","content-disposition":"attachment; filename=res.json" };
    delete headers["content-disposition"];
    const o = help.parseRequest(request);
    response.writeHead(200, headers);
    response.end(JSON.stringify(o));
}

const server = http.createServer(requestHandler);

server.listen(port, ip, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }
    http.get("http://" + ip + ":" + port + "?habs=9&karl=&rot=eins&rot=zwei&blau=drei,vier&camu=true", () => { })
    http.get("http://" + ip + ":" + port + "?habs=8&karl=&rot=eins&rot=zwei&blau=drei,vier&camu=true", () => { })
    console.log(`server is listening on ${port}`);
});