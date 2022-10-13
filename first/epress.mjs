import fs from "node:fs";
import http from "node:http";
import querystring from "querystring";
import path from "node:path";

// -------------------
import EventEmitter from "events";
const chatEmitter = new EventEmitter();
// -------------------
import express from "express";

const PORT = 3000;

function respondText(req, res) {
  res.json({ text: "some" });
}
function respondJson(req, res) {
  res.json({ text: "hi", numbers: [1, 2, 3] });
}

function respondNotFound(req, res) {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
}

// -------------------

function respondEcho(req, res) {
  const { input = "" } = req.query;

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
  const anotherFile = new URL(`public/${req.params[0]}`, import.meta.url);

  fs.createReadStream(anotherFile)
    .on("error", () => respondNotFound(req, res))
    .pipe(res);
}

// ------------------

function respondChat(req, res) {
  const { message } = req.query;
  chatEmitter.emit("message", message);
  res.end();
}

function respondSSE(req, res) {
	res.writeHead(200,{
		'Content-Type':'text/event-stream',
		'Connection': 'keep-alive'
	})

  const onMessage = (msg) => res.write(`data:${msg}\n\n`);

  chatEmitter.on("message", onMessage);

  res.on("close", function () {
    chatEmitter.off("message", onMessage);
  });
}

const app = express();

app.get("/", respondText);
app.get("/json", respondJson);
app.get("/echo", respondEcho);
app.get("/static/*", respondStatic);
app.get("/chat", respondChat);
app.get("/sse", respondSSE);

app.listen(PORT, () => console.log("Started", PORT));
