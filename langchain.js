import { SystemMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";

const dndApi = "https://www.dnd5eapi.co"


const ollamaLlm = new ChatOllama({
  baseUrl: "http://localhost:11434", // Default value
  model: "MarcusDnDexperiment3:latest", // Default value
});




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
}