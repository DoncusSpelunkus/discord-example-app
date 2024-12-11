import { SystemMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
<<<<<<< Updated upstream

const dndApi = "https://www.dnd5eapi.co"


const ollamaLlm = new ChatOllama({
  baseUrl: "http://localhost:11434", // Default value
  model: "MarcusDnDexperiment3:latest", // Default value
});


=======
import { ChatPromptTemplate, MessagesPlaceholder, } from "@langchain/core/prompts";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { OllamaEmbeddings } from "@langchain/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { createRetrievalChain } from "langchain/chains/retrieval";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import {
  DiscordGetMessagesTool,
  DiscordChannelSearchTool,
  DiscordSendMessagesTool,
  DiscordGetGuildsTool,
  DiscordGetTextChannelsTool,
} from "@langchain/community/tools/discord";

import * as dotenv from 'dotenv';
dotenv.config();

const dndApi = "https://www.dnd5eapi.co"

// test with splitter and vector store
const createVectorStore = async () => {
  const bigDoc = new CheerioWebBaseLoader(`${dndApi}/api/equipment`);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 200,
    chunkOverlap: 20,
  })

  const docs = await splitter.splitDocuments(await bigDoc.load());

  const embeddings = new OllamaEmbeddings({
    model: "mxbai-embed-large",
    baseUrl: "http://localhost:11434",
  });

  const vectorStore = new MemoryVectorStore(embeddings);

  await vectorStore.addDocuments(docs);

  return vectorStore
}

const fetchDoc = async (input) => {
  const loader = new CheerioWebBaseLoader(`${dndApi}/api/equipment/${input}`);

  return await loader.load();
}

// #### RESPONSE AGENT ####
const createRespondChain = async (doc) => {
  const fetcher = new ChatOllama({
    baseUrl: "http://localhost:11434", // Default value
    model: "llama3.2:latest", // Default value
    MAX_TOKENS: 1000,
    temperature: 0,
  });

  const sendTool = new DiscordSendMessagesTool(process.env.DISCORD_BOT_TOKEN, process.env.DISCORD_CHANNEL_ID);

  const tools = [sendTool];
  
  const prompt = ChatPromptTemplate.fromMessages(
    [("system", "You will receive information on an item and you should format the information and send it to the channel"),
    ("human", "{input}"),
    new MessagesPlaceholder("agent_scratchpad")]
  );

  const agent = createToolCallingAgent({
    llm: fetcher,
    prompt,
    tools
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools
  });

  return agentExecutor
}
// #### RESPONSE AGENT ####

// #### CONVERT CHAIN ####
const createConvertChain = async () => {
  const fetcher = new ChatOllama({
    baseUrl: "http://localhost:11434", // Default value
    model: "MarcusDnDexperiment3:latest", // Default value
    MAX_TOKENS: 1000,
    temperature: 0,
  });

  const prompt = ChatPromptTemplate.fromTemplate(
    "You will receive information on an item and you should format the information and send it to the channel"
  );
>>>>>>> Stashed changes

  const chain = prompt.pipe(fetcher);

<<<<<<< Updated upstream
export async function invoke(userMessage) {
  try {
    // Get the response from the LLM
    const llmResponse = await ollamaLlm.invoke(userMessage);

    // Extract content from LLM response
    const apiEndpoint = llmResponse.content.trim(); // Ensure clean endpoint
    console.log(apiEndpoint);
    console.log(`${dndApi}${apiEndpoint}`)
    // Make the API call dynamically
    const apiResponse = await fetch(`${dndApi}${apiEndpoint}`, {
      method: "GET", // Adjust the method and options as per the API requirements
    });

    if (!apiResponse.ok) {
      throw new Error(`API call failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    
    console.log("API Response:", data);

    return data;
  } catch (error) {
    console.error("Error in invoke function:", error);
    return "error in invoke"
  }
=======
  return chain
}
// #### CONVERT CHAIN ####

const respondChain = await createRespondChain();

const convertChain = await createConvertChain();

export async function llmInvocation(userInput) {
  const convertedUserinput = await convertChain.invoke({
    input: `${userInput}`
  })

  console.log(convertedUserinput.content);

  const doc = await fetchDoc(convertedUserinput.content).trim();
  

  console.log(doc);

  await respondChain.invoke({
    input: `${doc}`
  })
>>>>>>> Stashed changes
}