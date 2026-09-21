import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { formatDocuments, retrieveDogDocuments } from "./knowledge";

type AgentIntent = "profile" | "recommendation" | "incident" | "general";

const AgentState = Annotation.Root({
  question: Annotation<string>(),
  intent: Annotation<AgentIntent>({ reducer: (_, next) => next, default: () => "general" }),
  documents: Annotation<ReturnType<typeof retrieveDogDocuments>>({
    reducer: (_, next) => next,
    default: () => []
  }),
  answer: Annotation<string>({ reducer: (_, next) => next, default: () => "" }),
  suggestions: Annotation<string[]>({ reducer: (_, next) => next, default: () => [] })
});

const answerPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are the Dogs of IIM Udaipur assistant. Answer only from the supplied campus records. Be concise, kind, and practical. If the records do not answer the question, say that clearly and suggest contacting campus support. Never invent medical, behavioral, or location facts.\n\nRecords:\n{context}"
  ],
  ["human", "{question}"]
]);

function classifyQuestion(question: string): AgentIntent {
  const normalizedQuestion = question.toLowerCase();
  if (/hurt|injur|miss|distress|report|emergency|contact|issue|help/.test(normalizedQuestion)) return "incident";
  if (/recommend|suggest|friendly|meet|visit|near|which dog|who can/.test(normalizedQuestion)) return "recommendation";
  if (/\b(bruno|panda|snowy|chotu|pappu|motu|jumpy|sheru|ramani|damani|fluffy|simba|nimba|biscuit|wafer|chutki|whitey)\b/.test(normalizedQuestion)) return "profile";
  return "general";
}

function suggestionsForIntent(intent: AgentIntent) {
  if (intent === "incident") return ["Who should I contact?", "How should I approach an injured dog?"];
  if (intent === "recommendation") return ["Which friendly dogs are near the hostel?", "Tell me about Motu"];
  if (intent === "profile") return ["Where can I find this dog?", "What is this dog's temperament?"];
  return ["Which dogs are in Faculty Housing?", "Which friendly dog can I meet?"];
}

function fallbackAnswer(question: string, intent: AgentIntent, documents: ReturnType<typeof retrieveDogDocuments>) {
  const normalizedQuestion = question.toLowerCase();
  if (intent === "incident") {
    const guide = documents.find((document) => document.metadata.source === "campus-guide");
    if (guide) return guide.pageContent;
  }

  const ignoredTerms = new Set(["tell", "about", "which", "what", "where", "when", "are", "the", "dog", "dogs", "campus", "in", "is", "a", "do", "i", "if", "should", "me", "there", "how", "can", "to", "for"]);
  const questionTerms = new Set(question.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 1 && !ignoredTerms.has(term)));
  const matchingDocuments = documents.filter((document) => {
    const metadata = document.metadata as { dog?: string; area?: string };
    const searchableText = `${metadata.dog ?? ""} ${metadata.area ?? ""}`.toLowerCase();
    return [...questionTerms].some((term) => searchableText.includes(term));
  });
  const profileMatches = matchingDocuments.filter((document) => document.metadata.source === "dog-profile");
  if (profileMatches.length > 0) {
    const prefix = intent === "recommendation" ? "Based on the campus records, these dogs may fit: " : "Here is what the campus record says: ";
    return prefix + profileMatches.map((document) => document.pageContent).join(" ");
  }
  return "I can help with dog profiles, areas, temperament notes, and how to report a concern. Please mention a dog's name or ask about a campus area.";
}

const graph = new StateGraph(AgentState)
  .addNode("classify", async (state) => ({ intent: classifyQuestion(state.question) }))
  .addNode("retrieve", async (state) => ({ documents: retrieveDogDocuments(state.question, state.intent === "recommendation" ? 6 : 4) }))
  .addNode("respond", async (state) => {
    const context = formatDocuments(state.documents);
    const suggestions = suggestionsForIntent(state.intent);
    if (!process.env.OPENAI_API_KEY) return { answer: fallbackAnswer(state.question, state.intent, state.documents), suggestions };

    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.2
    });
    const response = await answerPrompt.pipe(model).invoke({ context, question: state.question });
    return { answer: typeof response.content === "string" ? response.content : JSON.stringify(response.content), suggestions };
  })
  .addEdge(START, "classify")
  .addEdge("classify", "retrieve")
  .addEdge("retrieve", "respond")
  .addEdge("respond", END)
  .compile();

export async function runDogAgent(question: string) {
  const result = await graph.invoke({ question });
  return { answer: result.answer, suggestions: result.suggestions, sources: result.documents.map((document) => document.metadata) };
}