const dialogflow = require('dialogflow');

exports.createIntent = createIntent;
exports.deleteIntent = deleteIntent;
exports.createContext = createContext;
exports.deleteContext = deleteContext;
exports.createEntity = createEntity;
exports.createEntityType = createEntityType;

async function createEntityType(projectId, displayName, kind) {
  // [START dialogflow_create_entity_type]
  // Imports the Dialogflow library

  // Instantiates clients
  const entityTypesClient = new dialogflow.EntityTypesClient();

  // The path to the agent the created entity type belongs to.
  const agentPath = entityTypesClient.projectAgentPath(projectId);

  const createEntityTypeRequest = {
    parent: agentPath,
    entityType: {
      displayName: displayName,
      kind: kind,
    },
  };

  const responses = await entityTypesClient.createEntityType(
    createEntityTypeRequest
  );
  console.log(`Created ${responses[0].name} entity type`);
  // [END dialogflow_create_entity_type]
}

async function deleteEntityType(projectId, entityTypeId) {
  // [START dialogflow_delete_entity_type]
  // Imports the Dialogflow library

  // Instantiates clients
  const entityTypesClient = new dialogflow.EntityTypesClient();

  const entityTypePath = entityTypesClient.entityTypePath(
    projectId,
    entityTypeId
  );

  const request = {
    name: entityTypePath,
  };

  // Call the client library to delete the entity type.
  const response = await entityTypesClient.deleteEntityType(request);
  console.log(`Entity type ${entityTypePath} deleted`);
  return response;
  // [END dialogflow_delete_entity_type]
}

async function createEntity(projectId, entityTypeId, entityValue, synonyms) {
  // [START dialogflow_create_entity]
  // Imports the Dialogflow library

  // Instantiates clients
  const entityTypesClient = new dialogflow.EntityTypesClient();

  // The path to the agent the created entity belongs to.
  const agentPath = entityTypesClient.entityTypePath(projectId, entityTypeId);

  const entity = {
    value: entityValue,
    synonyms: synonyms,
  };

  const createEntitiesRequest = {
    parent: agentPath,
    entities: [entity],
  };

  const [response] = await entityTypesClient.batchCreateEntities(
    createEntitiesRequest
  );
  console.log('Created entity type:');
  console.log(response);
  // [END dialogflow_create_entity]
}

async function deleteEntity(projectId, entityTypeId, entityValue) {
  // [START dialogflow_delete_entity]
  // Imports the Dialogflow library

  // Instantiates clients
  const entityTypesClient = new dialogflow.EntityTypesClient();

  // The path to the agent the entity types belong to.
  const entityTypePath = entityTypesClient.entityTypePath(
    projectId,
    entityTypeId
  );

  const request = {
    parent: entityTypePath,
    entityValues: [entityValue],
  };

  // Call the client library to delete the entity type.
  await entityTypesClient.batchDeleteEntities(request);
  console.log(`Entity Value ${entityValue} deleted`);
  // [END dialogflow_delete_entity]
}

async function createIntent(projectId, displayName, trainingPhrasesParts, messageTexts, entityType) {
  // [START dialogflow_create_intent]
  // Imports the Dialogflow library

  // Instantiates the Intent Client
  const intentsClient = new dialogflow.IntentsClient();

  // The path to identify the agent that owns the created intent.
  const agentPath = intentsClient.projectAgentPath(projectId);

  const trainingPhrases = [];

  trainingPhrasesParts.forEach(trainingPhrasesPart => {
    const part = {
      text: trainingPhrasesPart,
      entityType: '@'+entityType,
    };

    // Here we create a new training phrase for each provided part.
    const trainingPhrase = {
      type: 'EXAMPLE',
      parts: [part],
    };

    trainingPhrases.push(trainingPhrase);
  });

  const messageText = {
    text: messageTexts,
  };

  const message = {
    text: messageText,
  };

  const intent = {
    displayName: displayName,
    trainingPhrases: trainingPhrases,
    messages: [message],
    parameters: [{
      name : "",
      displayName: "Adjectif",
      entityTypeDisplayName: "@Adjectif",
    }]
  };

  const createIntentRequest = {
    parent: agentPath,
    intent: intent,
  };

  // Create the intent
  const responses = await intentsClient.createIntent(createIntentRequest);
  console.log(`Intent ${responses[0].name} created`);
  // [END dialogflow_create_intent]
}

async function deleteIntent(projectId, intentId) {
  // [START dialogflow_delete_intent]
  // Imports the Dialogflow library

  // Instantiates clients
  const intentsClient = new dialogflow.IntentsClient();

  const intentPath = intentsClient.intentPath(projectId, intentId);

  const request = {name: intentPath};

  // Send the request for deleting the intent.
  const result = await intentsClient.deleteIntent(request);
  console.log(`Intent ${intentPath} deleted`);
  return result;
  // [END dialogflow_delete_intent]
}

async function createContext(projectId, sessionId, contextId, lifespanCount) {
  // [START dialogflow_create_context]
  // Imports the Dialogflow library

  // Instantiates clients
  const contextsClient = new dialogflow.ContextsClient();

  const sessionPath = contextsClient.sessionPath(projectId, sessionId);
  const contextPath = contextsClient.contextPath(
    projectId,
    sessionId,
    contextId
  );

  const createContextRequest = {
    parent: sessionPath,
    context: {
      name: contextPath,
      lifespanCount: lifespanCount,
    },
  };

  const context = await contextsClient.createContext(createContextRequest);
  console.log(`Created ${context[0].name} context`);
  // [END dialogflow_create_context]

  return context;
}

async function deleteContext(projectId, sessionId, contextId) {
  // [START dialogflow_delete_context]
  // Imports the Dialogflow library

  // Instantiates clients
  const contextsClient = new dialogflow.ContextsClient();

  const contextPath = contextsClient.contextPath(
    projectId,
    sessionId,
    contextId
  );

  const request = {
    name: contextPath,
  };

  // Send the request for retrieving the context.
  const result = await contextsClient.deleteContext(request);
  console.log(`Context ${contextPath} deleted`);
  return result;
  // [END dialogflow_delete_context]
}