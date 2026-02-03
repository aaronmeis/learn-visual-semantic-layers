import React, { useState, useEffect } from 'react';
import {
    Layers,
    Cpu,
    Database,
    MessageSquare,
    BrainCircuit,
    CheckCircle,
    ChevronRight,
    Home,
    Info,
    ExternalLink,
    ArrowRight,
    Clock,
    Search,
    Bot,
    Zap,
    Activity,
    AlertTriangle,
    GitBranch,
    ShieldCheck,
    BarChart3,
    Box,
    Terminal,
    Unplug,
    TrendingUp,
    Target,
    Users,
    DollarSign,
    Sparkles,
    Loader2,
    Wand2,
    Maximize
} from 'lucide-react';

// --- Gemini API Utility ---
// Note: Use an environment variable VITE_GEMINI_API_KEY for the API key.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

const callGemini = async (prompt, systemInstruction = "") => {
    let delay = 1000;
    for (let i = 0; i < 5; i++) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        systemInstruction: { parts: [{ text: systemInstruction }] },
                        generationConfig: { responseMimeType: "application/json" }
                    })
                }
            );

            if (!response.ok) throw new Error('API request failed');

            const result = await response.json();
            return JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text);
        } catch (error) {
            if (i === 4) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
};

// Core Architectural Layers
const LAYERS = [
    {
        id: 'ui-layer',
        title: '1. User Interface (UI) Layer',
        icon: <MessageSquare className="w-5 h-5" />,
        color: 'bg-blue-500',
        semanticRole: 'Interaction gateway for input and output. Routes queries but does not deeply process semantics.',
        description: 'Serves as the interaction gateway, capturing user raw input and displaying generated responses.',
        details: [
            'Input Validation: Ensures the user input meets length and character requirements.',
            'Session Management: Captures initial identifiers to track ongoing dialogues across turns.',
            'Front-end Interfaces: Chat windows, voice interfaces, and messaging app integrations.',
            'Rendering: Displays streaming text and maintains history persistence for user view.'
        ],
        contextNeed: 'Essential for capturing session IDs. Without it, each query would be treated in isolation, breaking multi-turn conversations.',
        example: 'A messaging app (Slack, WhatsApp) logging user sessions for history persistence.',
        integration: 'Forwards raw input downstream to processing layers.'
    },
    {
        id: 'embedding-layer',
        title: '2. Input Processing & Embedding Layer',
        icon: <Cpu className="w-5 h-5" />,
        color: 'bg-emerald-500',
        semanticRole: 'Captures meaning beyond keywords, enabling handling of nuances like intent or sentiment.',
        description: 'Converts raw text into semantically meaningful vector representations (embeddings).',
        details: [
            'Tokenization & Entity Extraction: Breaking down sentences into sub-word units.',
            'Embedding Models: Using models like BERT or OpenAI text-embedding-3.',
            'Vectorization: Mapping text into high-dimensional space where "meaning" is represented by proximity.',
            'Preprocessing: Cleaning text and normalizing formats.'
        ],
        contextNeed: 'Appends conversation history to the current query before embedding. Essential for anaphora resolution.',
        example: 'Using Redis to maintain history before vectorizing to avoid model context limits.',
        integration: 'Embeddings directly inform prompt construction and vector search queries.'
    },
    {
        id: 'rag-layer',
        title: '3. Retrieval & Knowledge Integration (RAG)',
        icon: <Database className="w-5 h-5" />,
        color: 'bg-amber-500',
        semanticRole: 'Grounds responses in factual, contextually similar information from external knowledge bases.',
        description: 'Searches knowledge bases or vector databases for relevant facts to ground the LLM response.',
        details: [
            'Similarity Search: Calculating cosine similarity between query vectors and document chunks.',
            'Vector Databases: Using Pinecone, Weaviate, or Chroma for semantic indexing.',
            'Top-K Retrieval: Selecting the most relevant N chunks of information.',
            'Knowledge Augmentation: Injecting retrieved facts into the final prompt template.'
        ],
        contextNeed: 'Retrieval queries must incorporate historical context to filter matches accordingly.',
        example: 'Searching a corporate knowledge base with contextual embeddings.',
        integration: 'Augments the prompt with factual data, significantly reducing hallucinations.',
        subComponents: ['Knowledge Base', 'Vector DB', 'Search Engine']
    },
    {
        id: 'dialogue-layer',
        title: '4. Dialogue Management & Reasoning Layer',
        icon: <BrainCircuit className="w-5 h-5" />,
        color: 'bg-purple-500',
        semanticRole: 'Reasons over semantics to clarify ambiguities or determine necessary system actions.',
        description: 'Manages conversation flow and logical progression using intent detection and state machines.',
        details: [
            'Intent Classification: Determining if the user wants an answer, an action, or clarification.',
            'Slot Filling: Identifying missing pieces of information required to complete a task.',
            'State Machines: Handling multi-turn logic and complex branching.',
            'Entity Tracking: Maintaining a live record of specific names, dates, or values.'
        ],
        contextNeed: 'Tracks entities across turns. Requires databases like MongoDB to handle long-term history.',
        example: 'Recalling a user\'s earlier "budget" mention to refine a product recommendation.',
        integration: 'Uses the LLM for reasoning steps while feeding it managed state.',
        subComponents: ['Context Manager', 'Reasoning Engine']
    },
    {
        id: 'llm-layer',
        title: '5. Core LLM Generation Layer',
        icon: <Layers className="w-5 h-5" />,
        color: 'bg-indigo-500',
        semanticRole: 'Produces natural, semantically aligned text based on all gathered context.',
        description: 'The Large Language Model generates a human-like response.',
        details: [
            'Prompt Engineering: Crafting system instructions that set persona and constraints.',
            'Inference: Running the processed prompt through the neural network.',
            'Truncation: Summarizing old history to fit within context windows.',
            'Generation: Producing the raw text string for output processing.'
        ],
        contextNeed: 'Prompt must include managed context. Truncation is vital as exceeding limits causes failure.',
        example: 'Generating a response infused with historical context for deep personalization.',
        integration: 'A direct inference call synthesizing RAG and dialogue history.'
    },
    {
        id: 'output-layer',
        title: '6. Output Post-Processing & Delivery',
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'bg-rose-500',
        semanticRole: 'Ensures output matches semantic intent and meets safety/quality guardrails.',
        description: 'Polishes, formats, and verifies the final response before it reaches the user UI.',
        details: [
            'Safety Guardrails: Checking for harmful or restricted content.',
            'Formatting: Converting raw output into Markdown or HTML.',
            'Fact Verification: Double-checking generated facts against RAG context.',
            'Citations: Appending source links for transparency.'
        ],
        contextNeed: 'Final consistency checks to ensure response doesn\'t contradict earlier turns.',
        example: 'Formatting a response with context-aware elements like citations.',
        integration: 'Final polish before sending back to the UI Layer.'
    }
];

const RESOURCES = {
    'frameworks': {
        title: 'Orchestration Frameworks',
        icon: <Unplug className="w-5 h-5" />,
        description: 'Tools for chaining layers and building complex agentic workflows.',
        items: [
            { name: 'LangChain', desc: 'The industry standard for chaining LLM calls and managing memory.', url: 'https://python.langchain.com/' },
            { name: 'LlamaIndex', desc: 'Specialized in connecting LLMs to external data and indexing.', url: 'https://www.llamaindex.ai/' },
            { name: 'Haystack', desc: 'An open-source NLP framework for building RAG pipelines.', url: 'https://haystack.deepset.ai/' },
            { name: 'Semantic Kernel', desc: 'Microsoft SDK for integrating LLMs with conventional languages.', url: 'https://learn.microsoft.com/en-us/semantic-kernel/' }
        ]
    },
    'benchmarks': {
        title: 'Performance Benchmarks',
        icon: <BarChart3 className="w-5 h-5" />,
        description: 'Standardized tests to measure reasoning, coding, and factual accuracy.',
        items: [
            { name: 'MMLU', desc: 'Massive Multitask Language Understanding across 57 subjects.', url: 'https://github.com/hendrycks/test' },
            { name: 'HumanEval', desc: 'Measures code generation capabilities in Python.', url: 'https://github.com/openai/human-eval' },
            { name: 'GSM8K', desc: 'Grade school math word problems for multi-step reasoning.', url: 'https://github.com/openai/grade-school-math' },
            { name: 'HELM', desc: 'Holistic Evaluation of Language Models across many metrics.', url: 'https://crfm.stanford.edu/helm/' }
        ]
    },
    'safety': {
        title: 'Safety & Guardrails',
        icon: <ShieldCheck className="w-5 h-5" />,
        description: 'Mitigating risks, bias, and hallucinations in production systems.',
        items: [
            { name: 'Guardrails AI', desc: 'Framework for adding structure and quality checks to outputs.', url: 'https://www.guardrailsai.com/' },
            { name: 'Llama Guard', desc: 'A safety classifier model for input/output monitoring.', url: 'https://huggingface.co/meta-llama/Llama-Guard-3-8B' },
            { name: 'Perspective API', desc: 'Google Jigsaw tool for detecting toxic or harmful speech.', url: 'https://www.perspectiveapi.com/' },
            { name: 'Red Teaming', desc: 'Adversarial testing to find edge-case failures.', url: 'https://www.anthropic.com/news/red-teaming-language-models' }
        ]
    },
    'open-source': {
        title: 'Open Source Ecosystem',
        icon: <Box className="w-5 h-5" />,
        description: 'Publicly accessible models and datasets for localized deployment.',
        items: [
            { name: 'Llama 3', desc: 'Meta\'s state-of-the-art open weights foundation model.', url: 'https://llama.meta.com/' },
            { name: 'Mistral / Mixtral', desc: 'High-efficiency models using Mixture-of-Experts architecture.', url: 'https://mistral.ai/' },
            { name: 'Hugging Face Hub', desc: 'The central repository for weights, datasets, and demos.', url: 'https://huggingface.co/' },
            { name: 'Ollama', desc: 'Local tool for running LLMs efficiently on personal hardware.', url: 'https://ollama.com/' }
        ]
    }
};

const App = () => {
    const [currentPath, setCurrentPath] = useState('home');
    const [activeLayer, setActiveLayer] = useState(null);
    const [popupVisible, setPopupVisible] = useState(false);

    // Gemini State
    const [aiLoading, setAiLoading] = useState(false);
    const [businessInput, setBusinessInput] = useState("");
    const [customValues, setCustomValues] = useState(null);

    const navigateTo = (id) => {
        setCurrentPath(id);
        setActiveLayer(null);
        setPopupVisible(false);
        window.scrollTo(0, 0);
    };

    const handleGenerateBusiness = async () => {
        if (!businessInput) return;
        if (!apiKey) {
            alert("Please set VITE_GEMINI_API_KEY in your environment to use the AI generator.");
            return;
        }
        setAiLoading(true);
        try {
            const systemPrompt = "You are a Business Strategy Consultant. Given a company/industry, generate 4 strategic ROI values for a semantic LLM system. Return JSON as a list of 4 objects with: title, desc, metric.";
            const result = await callGemini(businessInput, systemPrompt);
            setCustomValues(result);
        } catch (e) {
            console.error(e);
        } finally {
            setAiLoading(false);
        }
    };

    const Sidebar = () => (
        <aside className="w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 hidden lg:flex flex-col border-r border-slate-800">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <Bot className="text-blue-400" />
                    Semantic Stack
                </h1>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
                <button
                    onClick={() => navigateTo('business')}
                    className={`w-full flex items-center px-6 py-3 transition-colors ${currentPath === 'business' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
                >
                    <TrendingUp className="w-5 h-5 mr-3" />
                    Business Value
                </button>

                <button
                    onClick={() => navigateTo('home')}
                    className={`w-full flex items-center px-6 py-3 transition-colors ${currentPath === 'home' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
                >
                    <Home className="w-5 h-5 mr-3" />
                    System Overview
                </button>

                <button
                    onClick={() => navigateTo('blowout')}
                    className={`w-full flex items-center px-6 py-3 transition-colors ${currentPath === 'blowout' ? 'bg-purple-600 text-white' : 'hover:bg-slate-800'}`}
                >
                    <Maximize className="w-5 h-5 mr-3" />
                    Blowout Diagram
                </button>

                <div className="mt-6 px-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Architecture Layers
                </div>
                {LAYERS.map((layer) => (
                    <button
                        key={layer.id}
                        onClick={() => navigateTo(layer.id)}
                        className={`w-full flex items-center px-6 py-3 text-sm transition-colors ${currentPath === layer.id ? 'bg-slate-800 text-blue-400 border-r-4 border-blue-400' : 'hover:bg-slate-800'}`}
                    >
                        <span className="mr-3">{layer.icon}</span>
                        <span className="truncate">{layer.title.split('. ')[1]}</span>
                    </button>
                ))}
                <div className="mt-6 px-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Resources
                </div>
                {Object.keys(RESOURCES).map((key) => (
                    <button
                        key={key}
                        onClick={() => navigateTo(key)}
                        className={`w-full flex items-center px-6 py-2 text-xs transition-colors ${currentPath === key ? 'text-white font-bold' : 'hover:text-white'}`}
                    >
                        <ChevronRight className={`w-3 h-3 mr-2 ${currentPath === key ? 'text-blue-400' : 'text-slate-600'}`} />
                        {RESOURCES[key].title}
                    </button>
                ))}
            </nav>
            <div className="p-6 border-t border-slate-800">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black mb-3">
                    <Activity className="w-3 h-3" /> System Health
                </div>
                <div className="space-y-2">
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-blue-500"></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>Memory</span>
                        <span>8.2 GB / 12 GB</span>
                    </div>
                </div>
            </div>
        </aside>
    );

    const LandingPage = () => {
        const activeLayerData = LAYERS.find(l => l.id === activeLayer);

        return (
            <div className="relative min-h-screen py-8 px-4">
                <div className="text-center mb-12 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight uppercase">Anatomy of a Semantic LLM Chatbot</h2>
                    <p className="text-base text-slate-600 leading-relaxed font-medium">
                        A visual guide to the modular architecture required for state-of-the-art semantic reasoning and grounded generation.
                    </p>
                </div>

                <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center">
                    <div className="absolute left-0 top-1/2 w-48 hidden xl:block animate-subtle-float">
                        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-lg relative">
                            <div className="absolute -left-2 top-6 w-4 h-4 bg-slate-100 rounded rotate-45 border-l border-b border-slate-200"></div>
                            <div className="flex items-center gap-2 mb-2 text-blue-600">
                                <Search className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase tracking-tighter">System Logic</span>
                            </div>
                            <p className="text-[10px] text-slate-600 font-bold leading-normal">Context is Critical:</p>
                            <p className="text-[10px] text-slate-500 leading-snug">Each layer relies on robust context management to ensure coherence.</p>
                        </div>
                    </div>

                    <div className="relative perspective-1000 w-full max-w-[650px] h-[550px] mt-4">
                        {LAYERS.map((layer, index) => {
                            const isSelected = activeLayer === layer.id;
                            const zIdx = LAYERS.length - index;
                            const translateY = index * 55;

                            return (
                                <div
                                    key={layer.id}
                                    className={`absolute left-1/2 top-0 -translate-x-1/2 transition-all duration-700 cursor-pointer group`}
                                    style={{
                                        transform: `translateX(-50%) translateY(${translateY}px) rotateX(45deg) rotateZ(-15deg) scale(${isSelected ? 1.05 : 1})`,
                                        zIndex: zIdx
                                    }}
                                    onClick={() => {
                                        if (activeLayer === layer.id) navigateTo(layer.id);
                                        else { setActiveLayer(layer.id); setPopupVisible(true); }
                                    }}
                                    onMouseEnter={() => !activeLayer && setActiveLayer(layer.id)}
                                    onMouseLeave={() => !popupVisible && setActiveLayer(null)}
                                >
                                    <div className={`
                    w-[280px] sm:w-[400px] md:w-[550px] h-20 
                    border-2 rounded-xl transition-all shadow-[0_15px_40px_rgba(0,0,0,0.08)]
                    flex items-center px-6 relative overflow-hidden
                    ${isSelected ? 'bg-slate-50 border-blue-500 ring-4 ring-blue-50' : 'bg-white border-slate-200 group-hover:border-blue-400'}
                  `}>
                                        <div className={`w-10 h-10 rounded-lg ${layer.color} flex items-center justify-center text-white mr-5 shadow-inner flex-shrink-0`}>
                                            {layer.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-black text-[10px] sm:text-base uppercase tracking-tight ${isSelected ? 'text-blue-600' : 'text-slate-800'}`}>
                                                {layer.title}
                                            </h3>
                                            <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{layer.semanticRole}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {activeLayerData && (
                        <div className={`
              mt-12 transition-all duration-500 max-w-lg w-full px-4
              ${popupVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}
            `}>
                            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${activeLayerData.color} text-white shadow-xl`}>
                                                {activeLayerData.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-white">{activeLayerData.title}</h4>
                                                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-0.5">Quick View</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { setPopupVisible(false); setActiveLayer(null); }} className="p-1 text-slate-500 hover:text-white transition-colors">✕</button>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                                        {activeLayerData.description}
                                    </p>
                                    <button
                                        onClick={() => navigateTo(activeLayerData.id)}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                                    >
                                        View Breakdown <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const BusinessValuePage = () => {
        const defaultValues = [
            {
                title: "Reduced Hallucinations",
                icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
                desc: "By grounding responses in the RAG layer, businesses eliminate the risk of inaccurate or made-up claims.",
                metric: "95%+ Fact Accuracy"
            },
            {
                title: "Operational Cost Efficiency",
                icon: <DollarSign className="w-6 h-6 text-indigo-500" />,
                desc: "Semantic chatbots handle Tier 1 and Tier 2 support queries instantly, reducing manual overhead.",
                metric: "Up to 40% Cost Savings"
            },
            {
                title: "Superior User Retention",
                icon: <Users className="w-6 h-6 text-blue-500" />,
                desc: "Context-aware systems remember user preferences and history, creating a frictionless customer journey.",
                metric: "+30% Engagement Rate"
            },
            {
                title: "Rapid Market Adaptation",
                icon: <Target className="w-6 h-6 text-rose-500" />,
                desc: "Updating the bot's knowledge base allows it to speak on new products instantly without retraining.",
                metric: "Real-time Knowledge Updates"
            }
        ];

        const displayValues = customValues || defaultValues;

        return (
            <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-12 flex flex-col md:flex-row justify-between items-start gap-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 leading-tight uppercase tracking-tighter mb-4">Strategic Business Value</h1>
                        <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                            A semantic chatbot is a strategic asset that transforms how organizations interact with data and customers.
                        </p>
                    </div>

                    <div className="w-full md:w-80 bg-indigo-50 border border-indigo-100 rounded-3xl p-6">
                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Sparkles size={12} /> Custom Value Generator ✨
                        </h4>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Company or Industry..."
                                className="w-full px-4 py-2 bg-white rounded-xl text-xs border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={businessInput}
                                onChange={(e) => setBusinessInput(e.target.value)}
                            />
                            <button
                                onClick={handleGenerateBusiness}
                                disabled={aiLoading}
                                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                Generate Value ✨
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayValues.map((v, i) => (
                        <div key={i} className="p-8 bg-white border border-slate-200 rounded-[32px] shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6">
                                    {v.icon || <Sparkles className="text-indigo-500" />}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4">{v.title}</h3>
                                <p className="text-slate-600 leading-relaxed font-medium mb-8 italic text-sm">
                                    "{v.desc}"
                                </p>
                            </div>
                            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact Metric</span>
                                <span className="text-sm font-black text-indigo-600">{v.metric}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const BlowoutDiagramPage = () => {
        return (
            <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 leading-tight uppercase tracking-tighter mb-4">Architectural Blowout Diagram</h1>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
                        An exploded perspective of the modular semantic layers, visualizing the flow of information across the entire AI pipeline.
                    </p>
                </div>

                <div className="relative w-full aspect-square md:aspect-video rounded-[40px] overflow-hidden shadow-2xl border border-slate-200 bg-slate-950 flex items-center justify-center p-4">
                    <img
                        src="/assets/blowout_diagram.png"
                        alt="Blowout Diagram of Semantic LLM Stack"
                        className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5 rounded-[40px]"></div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl">
                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Perspective</h4>
                        <p className="text-sm text-blue-900 font-bold">Six modular layers decoupled for maximum scalability and reliability.</p>
                    </div>
                    <div className="p-6 bg-purple-50 border border-purple-100 rounded-3xl">
                        <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">Integration</h4>
                        <p className="text-sm text-purple-900 font-bold">Seamless data flow between retrieval, reasoning, and generation.</p>
                    </div>
                    <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl">
                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Governance</h4>
                        <p className="text-sm text-emerald-900 font-bold">Integrated safety guardrails ensuring output quality at every stage.</p>
                    </div>
                </div>
            </div>
        );
    };

    const ResourceBreakout = ({ id }) => {
        const data = RESOURCES[id];
        return (
            <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                    <button onClick={() => navigateTo('home')} className="flex items-center text-slate-400 hover:text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6 transition-colors group">
                        <Home className="w-3 h-3 mr-2 group-hover:-translate-x-0.5 transition-transform" /> Back to Overview
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl flex-shrink-0">
                            {data.icon}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight">{data.title}</h1>
                            <p className="text-base text-slate-500 font-medium">{data.description}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.items.map((item, i) => (
                        <a
                            key={i}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group block text-left"
                        >
                            <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.name}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                            <div className="mt-4 flex items-center text-[10px] font-black text-blue-500 uppercase tracking-widest transition-colors">
                                View Documentation <ExternalLink className="w-3 h-3 ml-2 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        );
    };

    const LayerBreakout = ({ layer }) => (
        <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => navigateTo('home')} className="flex items-center text-slate-400 hover:text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6 transition-colors group">
                <Home className="w-3 h-3 mr-2 group-hover:-translate-x-0.5 transition-transform" /> Back to Overview
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full ${layer.color} text-white font-black text-[9px] uppercase tracking-widest mb-4 shadow-md`}>
                        Module 0{LAYERS.indexOf(layer) + 1}
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-4 leading-tight tracking-tighter uppercase">{layer.title}</h1>
                    <p className="text-lg text-slate-500 font-medium mb-8 leading-relaxed">
                        {layer.semanticRole}
                    </p>

                    <div className="space-y-8">
                        <section>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Functional Breakdown</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {layer.details.map((item, i) => (
                                    <div key={i} className="flex items-start p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-blue-500 mr-4 flex-shrink-0">
                                            <Terminal className="w-4 h-4" />
                                        </div>
                                        <span className="text-slate-700 text-sm font-bold leading-relaxed">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                    <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200/50 shadow-inner">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldCheck className="w-4 h-4 text-amber-500" />
                            <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-[0.1em]">Core Strategy</h4>
                        </div>
                        <p className="text-amber-900 leading-relaxed font-black italic text-lg tracking-tight">
                            "{layer.contextNeed}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FAFBFC] flex font-sans selection:bg-blue-600 selection:text-white">
            <Sidebar />

            <main className="flex-1 flex flex-col h-screen overflow-y-auto">
                <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 px-8 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            {currentPath === 'home' ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-xl">
                                        <Bot size={20} />
                                    </div>
                                    <h1 className="text-sm font-black text-slate-900 tracking-tighter uppercase">Semantic System Visualizer</h1>
                                </div>
                            ) : (
                                <nav className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    <button onClick={() => navigateTo('home')} className="hover:text-blue-600 transition-colors">Home</button>
                                    <ChevronRight size={10} />
                                    <span className="text-slate-900">{currentPath.replace('-', ' ')}</span>
                                </nav>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-1 px-8">
                    <div className="max-w-7xl mx-auto">
                        {currentPath === 'home' && <LandingPage />}
                        {currentPath === 'business' && <BusinessValuePage />}
                        {currentPath === 'blowout' && <BlowoutDiagramPage />}
                        {LAYERS.find(l => l.id === currentPath) && <LayerBreakout layer={LAYERS.find(l => l.id === currentPath)} />}
                        {RESOURCES[currentPath] && <ResourceBreakout id={currentPath} />}
                    </div>
                </div>

                {/* Restore Footer */}
                <footer className="bg-slate-950 text-white py-12 px-8 mt-auto border-t border-slate-900">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <Layers size={18} className="text-blue-500" />
                                <h3 className="text-xl font-black tracking-tighter uppercase">Anatomy of LLMs</h3>
                            </div>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">
                                Modular architectural blueprints for reliable AI applications. This system is derived from your original reference anatomy.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 col-span-1 md:col-span-2">
                            <div>
                                <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-6">Ecosystem</h4>
                                <div className="space-y-3">
                                    <button onClick={() => navigateTo('frameworks')} className="block text-xs text-slate-400 hover:text-white font-bold transition-colors text-left uppercase tracking-widest">Frameworks</button>
                                    <button onClick={() => navigateTo('benchmarks')} className="block text-xs text-slate-400 hover:text-white font-bold transition-colors text-left uppercase tracking-widest">Benchmarks</button>
                                    <button onClick={() => navigateTo('safety')} className="block text-xs text-slate-400 hover:text-white font-bold transition-colors text-left uppercase tracking-widest">Safety Guides</button>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-6">Safety</h4>
                                <div className="space-y-3">
                                    <button onClick={() => navigateTo('safety')} className="block text-xs text-slate-400 hover:text-white font-bold transition-colors text-left">Safety Guides</button>
                                    <button onClick={() => navigateTo('open-source')} className="block text-xs text-slate-400 hover:text-white font-bold transition-colors text-left">Open Source</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-900 flex justify-between items-center text-[9px] font-black text-slate-700 uppercase tracking-widest">
                        <span>v2.5 Alpha</span>
                    </div>
                </footer>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
        .perspective-1000 { perspective: 2000px; }
        @keyframes subtle-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-subtle-float { animation: subtle-float 4s ease-in-out infinite; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
        </div>
    );
};

export default App;