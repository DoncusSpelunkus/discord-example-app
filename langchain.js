import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OllamaEmbeddings } from "@langchain/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatOllama } from "@langchain/ollama";

const ollamaLlm = new ChatOllama({
  baseUrl: "http://localhost:11434", // Default value
  model: "llama3.2", // Default value
});

const loader = new CheerioWebBaseLoader(
  "https://lilianweng.github.io/posts/2023-06-23-agent/"
);

const docs = await loader.load();

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 0,
});
const allSplits = await textSplitter.splitDocuments(docs);
console.log(allSplits.length);

// const embeddings = new OllamaEmbeddings();

// const vectorStore = await MemoryVectorStore.fromDocuments(allSplits, embeddings);

// const question = "What are the approaches to Task Decomposition?";
// docs = await vectorStore.similaritySearch(question);

const response = await ollamaLlm.invoke(
  "Simulate a rap battle between Stephen Colbert and John Oliver"
);
console.log(response.content);