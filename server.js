// server.js

// init project
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const assets = require('./assets');
const structjson = require('structjson');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const projectLanguageCode = 'fr-FR';
const projectId = 'formation-bdx';
// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient();

app.use(session({
    store: new FileStore("./.sessions/"),
    secret: '%]N.]x5QYP?3xH2C',
    resave: true,
    saveUninitialized: true,
    messages: []
  })
);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use("/assets", assets);

//Used to parse POST requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
const listener = app.listen('8080', function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

app.post('/sendMsg',function(request,response)  {
  const messageContent = request.body.message;
  let currentSession = request.sessionID;
  console.log("SessionID = "+ currentSession);
  detectTextIntent(projectId, currentSession, messageContent, projectLanguageCode)
  .then(dialogflowResponse => {
    var botMessage = dialogflowResponse[0].queryResult.fulfillmentMessages[0].text.text[0];
    console.log("Response = " + botMessage);
    response.send(botMessage);
  });
});

function detectTextIntent(projectId, sessionId, query, languageCode) {
  // [START dialogflow_detect_intent_text]

  // Instantiates a session client
  const sessionClient = new dialogflow.SessionsClient();

  if(!query)
    return;

  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  let promise;

  // Detects the intent of the query
    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: languageCode,
        },
      },
    };

    if (!promise) {
      // First query.
      console.log(`Sending query "${query}"`);
      promise = sessionClient.detectIntent(request);
    } else {
      promise = promise.then(responses => {
        console.log('Detected intent');
        const response = responses[0];

        // Use output contexts as input contexts for the next query.
        response.queryResult.outputContexts.forEach(context => {
          // There is a bug in gRPC that the returned google.protobuf.Struct
          // value contains fields with value of null, which causes error
          // when encoding it back. Converting to JSON and back to proto
          // removes those values.
          context.parameters = structjson.jsonToStructProto(
            structjson.structProtoToJson(context.parameters)
          );
        });
        request.queryParams = {
          contexts: response.queryResult.outputContexts,
        };

        console.log(`Sending query "${query}"`);
        return sessionClient.detectIntent(request);
      });
    }
  return promise;

  // [END dialogflow_detect_intent_text]
}

