// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Load third party dependencies
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const markdown = require('markdown').markdown;

//Connect Mongo Atlas
const Historial = require("./models/Historial");
// db instance connection
require("./config/db");

// Load our custom classes
const CustomerStore = require('./customerStore.js');
const MessageRouter = require('./messageRouter.js');

// Grab the service account credentials path from an environment variable
const keyPath = 'banco-pichincha-faq-bot-2da1b-ea0ae5ef81e9.json';
if(!keyPath) {
  console.log('You need to specify a path to a service account keypair in environment variable DF_SERVICE_ACCOUNT_PATH. See README.md for details.');
  process.exit(1);
}

// Load and instantiate the Dialogflow client library
const { SessionsClient } = require('dialogflow');
const dialogflowClient = new SessionsClient({
  keyFilename: keyPath
})

// Grab the Dialogflow project ID from an environment variable
const projectId = 'banco-pichincha-faq-bot-2da1b';
if(!projectId) {
  console.log('You need to specify a project ID in the environment variable DF_PROJECT_ID. See README.md for details.');
  process.exit(1);
}

// Instantiate our app
const customerStore = new CustomerStore();
const messageRouter = new MessageRouter({
  customerStore: customerStore,
  dialogflowClient: dialogflowClient,
  projectId: projectId,
  customerRoom: io.of('/customer'),
  operatorRoom: io.of('/operator')
});

app.use(express.static("public"));

// Serve static html files for the customer and operator clients
app.get('/customer', (req, res) => {
  res.sendFile(`${__dirname}/static/customer.html`);
});

app.get('/operator', (req, res) => {
  res.sendFile(`${__dirname}/static/operator.html`);
});

app.get('/prueba', (req, res) => {
  res.sendFile(`${__dirname}/static/prueba.html`);
});

// Begin responding to websocket and http requests
messageRouter.handleConnections();
http.listen(process.env.PORT || 3000);


