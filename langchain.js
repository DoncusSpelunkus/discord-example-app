import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate, MessagesPlaceholder, } from "@langchain/core/prompts";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { OllamaEmbeddings } from "@langchain/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
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

const fetchDoc = async (input) => {
  const loader = new CheerioWebBaseLoader(`${dndApi}${input}`);

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
    `You are a conversion tool, you should format the {input} into a valid api endpoint like "api/equipment/longsword" and return nothing else.`
  );

  const chain = prompt.pipe(fetcher);

  return chain;
}
// #### CONVERT CHAIN ####

const respondChain = await createRespondChain();

const convertChain = await createConvertChain();

export async function llmInvocation(userInput) {
  const convertedUserinput = await convertChain.invoke({
    input: `${userInput}`
  })

  const doc = await fetchDoc(convertedUserinput.content.trim());
  
  await respondChain.invoke({
    input: `${doc[0].pageContent}`
  })
}