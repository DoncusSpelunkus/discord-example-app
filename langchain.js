import { RequestsGetTool } from "langchain/tools";
import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate, } from "@langchain/core/prompts";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { OllamaEmbeddings } from "@langchain/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { createRetrievalChain } from "langchain/chains/retrieval";
import { StructuredOutputParser  } from "@langchain/core/output_parsers";

const dndApi = "https://www.dnd5eapi.co"

const endpointFormatLLM = new ChatOllama({
  baseUrl: "http://localhost:11434", // Default value
  model: "MarcusDnDexperiment3:latest", // Default value
  MAX_TOKENS: 1000,
  temperature: 0
});


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
const createChain = async () => {
  const fetcher = new ChatOllama({
    baseUrl: "http://localhost:11434", // Default value
    model: "llama3.2:latest", // Default value
    MAX_TOKENS: 1000,
    temperature: 0,
  });

  const prompt = ChatPromptTemplate.fromTemplate(
    `Fetch the matching endpoint from the following context {context}, do not add any other text to your response: 
    Question: {input}`
  );
  const chain =  prompt.pipe(fetcher)

  const retrievers = vectorStore.asRetriever({
    k: 3
  });

  const comboChain = await createRetrievalChain({
    combineDocsChain: chain,
    retriever: retrievers,
  })

  return comboChain

}

const vectorStore = await createVectorStore();

const finalChain = await createChain();


// end of test

export async function llmInvocation(userInput) {
  const response = await finalChain.invoke({
    input: userInput
  });
  console.log(response.answer.content);
}