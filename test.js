const http = require('http');
const help = require('./help')

const port = 3004;
const ip = "0.0.0.0";

const c = new help.Cache({
    loader: (k) => k + k,
    maxSize: 4,
    removalListener:(k,v)=>console.log(v+v)
    

});
c.put("1", "alpha");
console.log(c.get("2", () => "s" + 1));
c.invalidateAll();
console.log(c);



const requestHandler = (request, response) => {
    c.put(new Date().getTime() % 30, null);
    console.log(c.getAllPresent("1"));

    const e = help.compressFile(request, "package-lock.json");
    const headers = {};
    if (e.encoding)
        headers["Content-Encoding"] = e.encoding;
    response.writeHead(200, headers);
    e.stream.pipe(response);
}

const server = http.createServer(requestHandler);

server.listen(port, ip, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }
    console.log(`server is listening on ${port}`);
});