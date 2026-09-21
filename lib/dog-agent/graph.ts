import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { formatDocuments, retrieveDogDocuments } from "./knowledge";

const AgentState = Annotation.Root({
  question: Annotation<string>(),
  documents: Annotation<ReturnType<typeof retrieveDogDocuments>>({
    reducer: (_, next) => next,
    default: () => []
  }),
  answer: Annotation<string>({ reducer: (_, next) => next, default: () => "" })
});

const answerPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are the Dogs of IIM Udaipur assistant. Answer only from the supplied campus records. Be concise, kind, and practical. If the records do not answer the question, say that clearly and suggest contacting campus support. Never invent medical, behavioral, or location facts.\n\nRecords:\n{context}"
  ],
  ["human", "{question}"]
]);

function fallbackAnswer(question: string, documents: ReturnType<typeof retrieveDogDocuments>) {
  const questionTerms = new Set(question.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 1));
  const matchingDocuments = documents.filter((document) => {
    const metadata = document.metadata as { dog?: string; area?: string };
    const searchableText = `${metadata.dog ?? ""} ${metadata.area ?? ""} ${document.pageContent}`.toLowerCase();
    return [...questionTerms].some((term) => searchableText.includes(term));
  });
  const profileMatches = matchingDocuments.filter((document) => document.metadata.source === "dog-profile");
  if (profileMatches.length > 0) return profileMatches.map((document) => document.pageContent).join(" ");
  return "I can help with dog profiles, areas, temperament notes, and how to report a concern. Please mention a dog's name or ask about a campus area.";
}

const graph = new StateGraph(AgentState)
  .addNode("retrieve", async (state) => ({ documents: retrieveDogDocuments(state.question) }))
  .addNode("respond", async (state) => {
    const context = formatDocuments(state.documents);
    if (!process.env.OPENAI_API_KEY) return { answer: fallbackAnswer(state.question, state.documents) };

    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.2
    });
    const response = await answerPrompt.pipe(model).invoke({ context, question: state.question });
    return { answer: typeof response.content === "string" ? response.content : JSON.stringify(response.content) };
  })
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "respond")
  .addEdge("respond", END)
  .compile();

export async function runDogAgent(question: string) {
  const result = await graph.invoke({ question });
  return { answer: result.answer, sources: result.documents.map((document) => document.metadata) };
}