const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
// choose any port: node . 5000
const port = process.argv[2] || 3000;

function showTemplate(response) {
  const template = fs.readFileSync("template.html", {
    encoding: "utf-8",
  });

  let dataObject = {
    0: {
      id: 0,
      name: "Jessica Knowledge",
      city: "Chicago",
      position: "Marketing Officer",
      link: "https://basecamp.com/",
      extension: "pdf",
    },
    1: {
      id: 1,
      name: "Google Human",
      city: "Mountain View",
      position: "Designer",
      link: "http://google.com/",
      extension: "wav",
    },
    2: {
      id: 2,
      name: "Alexa Basecamp",
      city: "Berlin",
      position: "Photographer",
      link: "https://basecamp.com/",
      extension: "html",
    },
    3: {
      id: 3,
      name: "React Rose",
      city: "Frankfurt",
      position: "Software Developer",
      link: "http://google.com/",
      extension: "jpeg",
    },
    4: {
      id: 4,
      name: "Twitter Rele",
      city: "Shanghai",
      position: "Communications",
      link: "https://basecamp.com/",
      extension: "png",
    },
    5: {
      id: 5,
      name: "John Smith",
      city: "Beijing",
      position: "Customer Care",
      link: "http://google.com/",
      extension: "js",
    },
  };
  let output;
  for (var key in dataObject) {
    output += template
      .replace(/%%id%%/g, dataObject[key]["id"])
      .replace(/%%name%%/g, dataObject[key]["name"])
      .replace(/%%city%%/g, dataObject[key]["city"])
      .replace(/%%position%%/g, dataObject[key]["position"])
      .replace(/%%link%%/g, dataObject[key]["link"])
      .replace(/%%extension%%/g, dataObject[key]["extension"]);
  }
  return output;
}

const mimeType = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".css": "text/css",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".doc": "application/msword",
  ".eot": "application/vnd.ms-fontobject",
  ".ttf": "application/x-font-ttf",
};

http
  .createServer(function (request, response) {
    const parsedUrl = url.parse(request.url);
    //Avoid directory traversal (like http://localhost:1800/../fileOutofContext.txt) by replacing "../" with " ".
    const sanitizedPath = path
      .normalize(parsedUrl.pathname)
      .replace(/^(\.\.[\/\\])+/, ""); //limit to current directory
    let pathname = path.join(__dirname, sanitizedPath);

    fs.exists(pathname, function (exist) {
      if (!exist) {
        console.log("Does not exist:", pathname);
        // if the file is not found, return templated page
        response.writeHead(404, {
          "Content-Type": "text/html",
        });
        let output = showTemplate(response);
        response.end(output);
        return;
      }

      // if is a directory, then look for the linked index.html
      if (fs.statSync(pathname).isDirectory()) {
        console.log("pathname:", pathname);
        pathname += "/index.html";
      }

      fs.readFile(pathname, function (error, data) {
        console.log("file being served:", pathname);
        if (error) {
          response.writeHead(200, {
            "Content-Type": "text/html",
          });
          let output = showTemplate(response);
          response.end(output);
        } else {
          // based on the pathname, find the extension name(pdf/jpg etc)
          const extension = path.parse(pathname).ext;
          response.setHeader(
            "Content-type",
            mimeType[extension] || "text/plain"
          );
          let readStream = fs.createReadStream(pathname);
          readStream
            .on("error", (err) => {
              response.end(err);
            })
            .on("open", () => {
              console.log("piping");
              readStream.pipe(response);
            });
        }
      });
    });
  })
  .listen(parseInt(port));

console.log(`Server listening on port ${port}`);

// run main script
// cd src && node . 3000

// get the javascript file with
// curl -i localhost:9000/index.js

// testing an existing file
// curl -i localhost:9000/employee/4.png

// testing a non-existing file
// curl -i localhost:9000/randomfile.doc

// "login" route
// curl -i localhost:9000/login
