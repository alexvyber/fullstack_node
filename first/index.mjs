import fs from "node:fs";
import http from "node:http";
import querystring from "querystring";
import path from "node:path";

const PORT = 3000;

function respondText(req, res) {
  res.setHeader("Content-Type", "text/plain");
  res.end("hi");
}
function respondJson(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ text: "hi", numbers: [1, 2, 3] }));
}

function respondNotFound(req, res) {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
}

// -------------------

function respondEcho(req, res) {
  const { input = "" } = querystring.parse(
    req.url.split("?").slice(1).join("")
  );
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      normal: input,
      shouty: input.toUpperCase(),
      characterCount: input.length,
      backwards: input.split(".").reverse().join("."),
    })
  );
}

// -------------------

function respondStatic(req, res) {
  console.log(path.dirname("index.msj"));
  const anotherFile = new URL(
    `public/${req.url.split("/static/")[1]}`,
    import.meta.url
  );
  console.info(anotherFile.toString());

  // const filename = path.join(path.dirname, `public${req.url.split("/static")[1]}`);

  fs.createReadStream(anotherFile)
    .on("error", () => respondNotFound(req, res))
    .pipe(res);
  // res.end("Static")
}

// -------------------

const server = http.createServer(function (req, res) {
  if (req.url === "/") return respondText(req, res);
  if (req.url === "/json") return respondJson(req, res);
  if (req.url.match(/^\/shit/)) return respondEcho(req, res);
  if (req.url.match(/^\/static/)) return respondStatic(req, res);

  respondNotFound(req, res);
});

console.log("Server started on port:", PORT);

server.listen(PORT);
