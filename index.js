const fs = require('fs'); //filesystem module -> core node module that comes with node.js for reading files
const http = require('http'); //another code module needed for creating server
const url = require('url'); // another core module needed for routing

const json = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8'); //sync version is always blocking ... _dirname -> in node.js is defined as the home folder
const laptopData = JSON.parse(json); // returns an object

const server = http.createServer((req, res) => { //callback function that's fired every time someone accesses our server
    
    const pathName = url.parse(req.url, true).pathname;//url.parse(req.url) -> returns the url / true -> ensures it is parsed into an object -> pathname is /laptop or /products
    const id = url.parse(req.url, true).query.id; // reads id from url eg for the query -> ?id=4

    //routing -> responding in different ways to different urls
    
    // PRODUCTS OVERVIEW
    if (pathName === '/products' || pathName === '/') {
        res.writeHead(200, { 'Content-type': 'text/html'}); // http status code
        
        fs.readFile(`${__dirname}/templates/template-overview.html`, 'utf-8', (err, data) => {//all the html is now in the data variable
            let overviewOutput = data;
            
            fs.readFile(`${__dirname}/templates/template-card.html`, 'utf-8', (err, data) => {
            
                const cardsOutput = laptopData.map(el => replaceTemplate(data, el)).join('');
                overviewOutput = overviewOutput.replace('{%CARDS%}', cardsOutput); 
                
                res.end(overviewOutput); //res.end -> sends response
            });
        });
        
        
    }
    
    // LAPTOP DETAIL
    else if (pathName === '/laptop' && id < laptopData.length) { //laptopdata from parsed json file
        res.writeHead(200, { 'Content-type': 'text/html'});
        
        fs.readFile(`${__dirname}/templates/template-laptop.html`, 'utf-8', (err, data) => { //all the html is now in the data variable
            const laptop = laptopData[id];
            const output = replaceTemplate(data, laptop); //replace original html place holders with laptopdata from json file
            res.end(output);
        });
    }
    
    // IMAGES
    else if ((/\.(jpg|jpeg|png|gif)$/i).test(pathName)) { // a seperate route for images is required
        fs.readFile(`${__dirname}/data/img${pathName}`, (err, data) => {
            res.writeHead(200, { 'Content-type': 'image/jpg'});
            res.end(data);
        });
    }
    
    // URL NOT FOUND
    else {
        res.writeHead(404, { 'Content-type': 'text/html'});
        res.end('URL was not found on the server!');
    }
    
});

server.listen(1337, '127.0.0.1', () => { //tells node.js to keep listening on an ip and port
    console.log('Listening for requests now');
});

function replaceTemplate(originalHtml, laptop) {
    let output = originalHtml.replace(/{%PRODUCTNAME%}/g, laptop.productName);
    output = output.replace(/{%IMAGE%}/g, laptop.image);
    output = output.replace(/{%PRICE%}/g, laptop.price);
    output = output.replace(/{%SCREEN%}/g, laptop.screen);
    output = output.replace(/{%CPU%}/g, laptop.cpu);
    output = output.replace(/{%STORAGE%}/g, laptop.storage);
    output = output.replace(/{%RAM%}/g, laptop.ram);
    output = output.replace(/{%DESCRIPTION%}/g, laptop.description);
    output = output.replace(/{%ID%}/g, laptop.id);
    return output;
}