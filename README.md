# Semantic LLM Architecture Visualizer

An interactive React-based application designed to visualize and explore the modular components of a state-of-the-art Semantic LLM Chatbot. This tool provides a deep dive into the architectural layers, strategic business value, and technical resources essential for building reliable AI systems.

## 🚀 Key Features

- **Interactive 3D Stack**: An isometric representation of the six-layer architectural stack, allowing users to drill down into each module.
- **Strategic Business Value**: Dynamic insights into how semantic systems drive fact accuracy, cost savings, and engagement.
- **Custom Value Generator**: Integration with the Gemini API to generate tailored ROI metrics for specific industries.
- **Architectural Blowout Diagram**: High-fidelity visualization of the modular layers and information flow.
- **Resource Repository**: Curated lists of orchestration frameworks, performance benchmarks, and safety guardrails.

## 🏗️ Architectural Layers

1.  **User Interface (UI) Layer**: Interaction gateway for input and output, managing sessions and history persistence.
2.  **Input Processing & Embedding Layer**: Converting raw text into semantically meaningful vector representations.
3.  **Retrieval & Knowledge Integration (RAG)**: Grounding responses in facts retrieved from external knowledge bases.
4.  **Dialogue Management & Reasoning Layer**: Managing conversation flow, intent detection, and multi-turn logic.
5.  **Core LLM Generation Layer**: Generating natural, contextually aligned text using advanced language models.
6.  **Output Post-Processing & Delivery**: Ensuring safety, formatting, and factual verification before delivery.

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS for responsive and modern design
- **Icons**: Lucide React
- **AI Integration**: Google Gemini API (Flash 2.5)

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/aaronmeis/learn-visual-semantic-layers.git
    cd learn-visual-semantic-layers
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env` file in the root directory (or set it in your environment) and add your Gemini API key:
    ```bash
    VITE_GEMINI_API_KEY=your_actual_api_key_here
    ```

### Running Locally

```bash
npm run dev
```
The application will be available at `http://localhost:5173/`.

### Building for Production

```bash
npm run build
```
The production bundle will be generated in the `dist` folder.

## 📄 License

MIT

## 🤝 Reference

This project is derived from the **NotebookLM Blueprint Reference**, focusing on the "Anatomy of a Semantic LLM Chatbot".
