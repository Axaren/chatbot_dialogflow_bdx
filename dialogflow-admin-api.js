const dialogflow = require('dialogflow');
const GOOGLE_CLOUD_AUTH_FILE = "auth_file.json";

exports.createIntent = createIntent;
exports.deleteIntent = deleteIntent;
exports.createContext = createContext;
exports.deleteContext = deleteContext;
exports.createEntity = createEntity;
exports.createEntityType = createEntityType;
exports.deleteEntityType = deleteEntityType;
exports.listEntityTypes = listEntityTypes;

async function createEntityType(projectId, entityType) {
  // [START dialogflow_create_entity_type]
  // Imports the Dialogflow library

  // Instantiates clients
  const entityTypesClient = new dialogflow.EntityTypesClient({keyFilename: GOOGLE_CLOUD_AUTH_FILE});

  // The path to the agent the created entity type belongs to.
  const agentPath = entityTypesClient.projectAgentPath(projectId);

  const createEntityTypeRequest = {
    parent: agentPath,
    entityType: entityType
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
  const entityTypesClient = new dialogflow.EntityTypesClient({keyFilename: GOOGLE_CLOUD_AUTH_FILE});

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

async function listEntityTypes(projectId) {
  // [START dialogflow_list_entity_types]
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const entityTypesClient = new dialogflow.EntityTypesClient({keyFilename: GOOGLE_CLOUD_AUTH_FILE});

  // The path to the agent the entity types belong to.
  const agentPath = entityTypesClient.projectAgentPath(projectId);

  const request = {
    parent: agentPath,
  };

  // Call the client library to retrieve a list of all existing entity types.
  const [response] = await entityTypesClient.listEntityTypes(request);
  response.forEach(entityType => {
    console.log(`Entity type name: ${entityType.name}`);
    console.log(`Entity type display name: ${entityType.displayName}`);
    console.log(`Number of entities: ${entityType.entities.length}\n`);
  });
  return response;
  // [END dialogflow_list_entity_types]
}

async function createEntity(projectId, entityTypeId, entityValue, synonyms) {
  // [START dialogflow_create_entity]
  // Imports the Dialogflow library

  // Instantiates clients
  const entityTypesClient = new dialogflow.EntityTypesClient({keyFilename: GOOGLE_CLOUD_AUTH_FILE});

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
  console.log('Created entity:');
  console.log(response);
  // [END dialogflow_create_entity]

  return response;
}

async function deleteEntity(projectId, entityTypeId, entityValue) {
  // [START dialogflow_delete_entity]
  // Imports the Dialogflow library

  // Instantiates clients
  const entityTypesClient = new dialogflow.EntityTypesClient({keyFilename: GOOGLE_CLOUD_AUTH_FILE});

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

async function createIntent(projectId, displayName, trainingPhrases, messageTexts, entityType) {
  // [START dialogflow_create_intent]
  // Imports the Dialogflow library

  // Instantiates the Intent Client
  const intentsClient = new dialogflow.IntentsClient({keyFilename: GOOGLE_CLOUD_AUTH_FILE});

  // The path to identify the agent that owns the created intent.
  const agentPath = intentsClient.projectAgentPath(projectId);

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

  let parameterId = "detected_ue";

  const intent = {
    displayName: displayName,
    trainingPhrases: trainingPhrases,
    messages: [message],
    parameters: [{
      name : entityType,
      displayName: entityType,
      entityTypeDisplayName: "@" + entityType,
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
  const intentsClient = new dialogflow.IntentsClient({keyFilename: GOOGLE_CLOUD_AUTH_FILE});

  const intentPath = intentsClient.intentPath(projectId, intentId);

  const request = {name: intentPath};

  // Send the request for deleting the intent.
  const result = await intentsClient.deleteIntent(request);
  console.log(`Intent ${intentPath} deleted`);
  return result;
  // [END dialogflow_delete_intent]
}

async function listIntents(projectId) {
  // [START dialogflow_list_intents]
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const intentsClient = new dialogflow.IntentsClient({keyFilename: GOOGLE_CLOUD_AUTH_FILE});

  // The path to identify the agent that owns the intents.
  const projectAgentPath = intentsClient.projectAgentPath(projectId);

  const request = {
    parent: projectAgentPath,
  };

  console.log(projectAgentPath);

  // Send the request for listing intents.
  const [response] = await intentsClient.listIntents(request);
  response.forEach(intent => {
    console.log('====================');
    console.log(`Intent name: ${intent.name}`);
    console.log(`Intent display name: ${intent.displayName}`);
    console.log(`Action: ${intent.action}`);
    console.log(`Root folowup intent: ${intent.rootFollowupIntentName}`);
    console.log(`Parent followup intent: ${intent.parentFollowupIntentName}`);

    console.log('Input contexts:');
    intent.inputContextNames.forEach(inputContextName => {
      console.log(`\tName: ${inputContextName}`);
    });

    console.log('Output contexts:');
    intent.outputContexts.forEach(outputContext => {
      console.log(`\tName: ${outputContext.name}`);
    });
  });
  // [END dialogflow_list_intents]
}

async function createContext(projectId, sessionId, contextId, lifespanCount) {
  // [START dialogflow_create_context]
  // Imports the Dialogflow library

  // Instantiates clients
  const contextsClient = new dialogflow.ContextsClient({keyFilename: GOOGLE_CLOUD_AUTH_FILE});

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
  const contextsClient = new dialogflow.ContextsClient({keyFilename: GOOGLE_CLOUD_AUTH_FILE});

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

async function listContexts(projectId, sessionId) {
  // [START dialogflow_list_contexts]
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const contextsClient = new dialogflow.ContextsClient({keyFilename: GOOGLE_CLOUD_AUTH_FILE});

  // The path to identify the agent that owns the contexts.
  const sessionPath = contextsClient.sessionPath(projectId, sessionId);

  const request = {
    parent: sessionPath,
  };

  // Send the request for listing contexts.
  const [response] = await contextsClient.listContexts(request);
  response.forEach(context => {
    console.log(`Context name: ${context.name}`);
    console.log(`Lifespan count: ${context.lifespanCount}`);
    console.log('Fields:');
    if (context.parameters !== null) {
      context.parameters.fields.forEach(field => {
        console.log(`\t${field.field}: ${field.value}`);
      });
    }
  });
  return response;
  // [END dialogflow_list_contexts]
}