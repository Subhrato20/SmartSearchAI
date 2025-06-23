

<h1 align="center">SMARTSEARCHAI</h1>
<h3 align="center">Discover Tailored Services, Empower Your Choices Today</h3>
<h3 align="center"><a href="https://deepwiki.com/Subhrato20/SmartSearchAI"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a></h3>

**Personalized service bundle recommendations—powered by AI, not guesswork.**

Say goodbye to endless plan comparisons, fine-print surprises, and hidden fees.
**SmartSearch.AI** helps you find the best telecom, internet, and subscription bundles based on what *you* actually need—just tell us in plain English.

---

## 🚀 Elevator Pitch

SmartSearch.AI uses Retrieval-Augmented Generation (RAG), NLP, and real-time provider data to generate personalized, transparent, and optimized service recommendations.

You say:
> "I need unlimited data for 4 devices and fast internet for gaming + streaming."
We say:
✅ “Plan A from Provider X gives you everything you need—$30/month cheaper than the next best.”

---

## 🧠 How It Works

### 🗣 Natural Language Understanding
Users describe what they’re looking for—no dropdowns or forms. Just a conversational prompt.

### 🔍 RAG-Based Recommendation Engine
Pulls from a rich database of:
- ✅ Service plans scraped from provider websites (leveraging tools like Firecrawl)
- 💵 Real-time pricing data
- 📈 Service quality metrics (reliability, speed, customer satisfaction)
- 🔁 Comparison data across categories (mobile, internet, streaming, etc.)

### 🧮 Cost Optimization
Our algorithm evaluates *hundreds* of possible service combinations to:
- Meet **every** expressed user requirement
- Maximize **value per dollar**

### 💡 Transparent Justifications
Every recommendation includes:
- Reasoning behind selection
- Breakdown of how it meets your needs
- Clear cost comparison

### 🔁 Continuous Learning
Incorporates user feedback to:
- Improve future recommendations
- Personalize for usage patterns & preferences

---

## 🏁 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   **Python:** Version 3.8 or higher.
*   **Node.js and npm:** Node.js (which includes npm) for frontend dependencies.
*   **Milvus:** A vector database. For a quick setup, you can run Milvus using Docker:
    ```bash
    docker run -d --name milvus_cpu \
      -p 19530:19530 \
      -p 9091:9091 \
      milvusdb/milvus:v2.4.11-cpu-latest
    ```
    Ensure Milvus is running and accessible at `http://localhost:19530`.
*   **Git:** For cloning the repository.

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/subhrato20/subhrato20-smartsearchai.git
    cd subhrato20-smartsearchai/backend
    ```

2.  **Create and activate a Python virtual environment:**
    ```bash
    python -m venv venv
    # On Windows:
    # venv\Scripts\activate
    # On macOS/Linux:
    # source venv/bin/activate
    ```

3.  **Install backend dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory (`subhrato20-smartsearchai/backend/.env`) with your API keys:
    ```env
    ANTHROPIC_API_KEY="your_anthropic_api_key_here"
    PERPLEXITY_API_KEY="your_perplexity_api_key_here"
    ```

5.  **Initialize Milvus Database:**
    This script sets up the necessary collections and partitions in Milvus.
    ```bash
    python RAG/milvus_init.py
    ```

6.  **Process Data and Generate Embeddings:**
    This step processes text files from `text_data/`, generates embeddings, and saves them to `RAG/processed/`. Run this if the `*.json` files in `RAG/processed/` are missing, outdated, or if you've added new data to `text_data/`.
    ```bash
    python RAG/embedding.py
    ```

7.  **Upsert Embeddings to Milvus:**
    This script loads the processed JSON files and upserts the data into Milvus.
    ```bash
    python RAG/milvus_upsert.py
    ```

8.  **Start the backend server:**
    ```bash
    python llm_engine/claude_api.py
    ```
    The backend Flask server will start, typically on `http://localhost:8080`.

### Frontend Setup

1.  **Navigate to the frontend directory** (in a new terminal):
    ```bash
    # Assuming you are in the subhrato20-smartsearchai directory
    cd frontend
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

3.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
    The frontend development server (Vite) will start, typically accessible at `http://localhost:5173` (the exact port will be shown in the terminal).

### Running the Application

1.  Ensure your Milvus instance is running.
2.  Ensure the backend server (`claude_api.py`) is running.
3.  Ensure the frontend development server (`npm run dev`) is running.
4.  Open your web browser and navigate to the frontend URL (e.g., `http://localhost:5173`).

---

## 🛠️ Built with the tools and technologies:

This project leverages a range of powerful tools and technologies:

*   **React**: A JavaScript library for building user interfaces.
*   **Vite**: Next-generation frontend tooling for fast development.
*   **JavaScript**: The programming language for the web, used extensively in the frontend.
*   **Python**: The primary language for backend development and data processing.
*   **Flask**: A lightweight WSGI web application framework in Python for the backend API.
*   **NumPy**: Fundamental package for numerical computation in Python.
*   **pandas**: Powerful data analysis and manipulation library for Python.
*   **Pydantic**: Data validation and settings management using Python type annotations.
*   **Anthropic API**: Used for advanced AI and large language model capabilities.
*   **Axios**: Promise-based HTTP client for making API requests from the frontend.
*   **ESLint**: A pluggable and configurable linter tool to ensure JavaScript code quality.
*   **tqdm**: A fast, extensible progress bar for Python and CLI.
*   **SymPy**: A Python library for symbolic mathematics.
*   **JSON**: A lightweight data-interchange format.
*   **Markdown**: Used for documentation and rich text content.
*   **npm**: Package manager for Node.js, used for frontend dependency management.

*(Core RAG components like Milvus and HuggingFace Transformers are also integral to the project's architecture, facilitating advanced NLP and vector search capabilities).*

---

## ⚔️ Challenges We Tackled

- 📦 Parsing complex and inconsistent pricing models across providers
- 📈 Keeping data fresh and accurate with automated scraping pipelines
- 🤯 Handling vague or multi-part natural language inputs robustly
- 🧮 Balancing speed and accuracy in cost optimization across large datasets

---

## 🏆 What We're Proud Of

- 🔁 End-to-end working RAG system for service recommendations
- 🧠 Natural-language interface that feels intuitive and fast
- 💡 Fully explainable output—no black box recommendations
- ⚖️ Transparent, unbiased comparisons with clear cost breakdowns

---

## 📚 What We Learned

- Advanced chaining techniques with LangChain + vector stores
- Real-world prompt tuning for retrieval and generation balance
- Handling ambiguity and fallbacks in user instructions
- Designing UIs and outputs for *trustworthy* AI-powered recommendations

---

## 🚧 What’s Next

- 🖥 Frontend UI: Responsive React dashboard for general users
- 🛍 E-commerce Integration: One-click transitions to checkout with providers
- 👤 User Profiles: Save past preferences and adjust future recommendations
- 🔐 Auth + Feedback Loops: Let users rate and tweak results
- 📊 Analytics Dashboard: Help users understand spending patterns over time

---

## 🤝 Contributing

Pull requests, feature suggestions, and data pipeline improvements are welcome!

---

## 📜 License

MIT License
