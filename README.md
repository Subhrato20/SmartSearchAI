# SmartSearch.AI 🤖📦

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
- ✅ Service plans scraped from provider websites
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

## 🧱 Built With

- **Python** — Core backend + data parsing
- **Firecrawl** — Web scraping engine
- **HuggingFace Transformers** — NLP + embedding generation
- **Custom RAG Stack** — Hybrid search
- **Milvus** — Vector database for similarity search
- **Flask** — REST API layer

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


