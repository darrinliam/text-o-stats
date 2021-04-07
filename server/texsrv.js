'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');

const router = require('./../routes/index.js').router;
const getArgs = require('./getArgs.js');

const app = express();

const DEFAULT_PORT = 3001;

const usage = `Usage: 
  texsrv  --verbose 
          --port <portnum>
`;

// middleware to examine req/res
const reqLogger = function(req, res, next) {
  console.log(`reqLogger: method: ${req.method}.`);
  next();
}

app.use(reqLogger);

app.use(bodyParser.json());
app.use((err, req, res, next) => {
  if (err) {
    res.status(400).send({
      success: false,
      message: "Error parsing body as JSON."
    })
  } else {
    next()
  }
})
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(compression());

app.use(router);

app.use(function(req, res) {
  res.status(404).send({
    success: false,
    message: "Not found."
  });
});

let args = getArgs(process.argv.slice(2), usage);

let port = (args.port) ? args.port : DEFAULT_PORT;

const srv = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

if (args.verbose) {
  console.log("Running in verbose mode.");
  setInterval(() => srv.getConnections(
    (err, openConnections) => console.log(`${openConnections} connections currently open`)
  ), 1000); // every second, log the # of open connections
}

console.log(`Running environment: ${process.env.NODE_ENV ? process.env.NODE_ENV : "not set"}`);

// Close all connections on interrupt/kill
process.on('SIGINT', shutDown); // ctrl-c
process.on('SIGTERM', shutDown); // kill signal

let connectionList = [];

srv.on('connection', (connection) => {
  console.log("Adding connection.");
  connectionList.push(connection);
  connection.on('close', () => {
	for (let i = 0; i < connections.length; i++) {
		if (connections[i] === connection) {
			connections.splice(i,1);  // Remove connection from list. Modify array in place
			break;
		}
	}
    console.log("Closed connection.");
  });
});

function shutDown() {
  console.log("Received SIGTERM / SIGINT. Shutting down...");
  srv.close(() => {
    console.log("Done.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Could not close connection(s). Shutting down now.");
    process.exit(1);
  }, 10000);

  connectionList.forEach((curConn) => {
    curConn.end();
    console.log("Successfully closed connection during shutdown.");
  });
  setTimeout(() => connectionList.forEach((curConn) => curConn.destroy()), 5000);
}

module.exports = app;
