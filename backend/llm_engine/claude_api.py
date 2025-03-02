import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

import json
import anthropic
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from RAG.milvus_search import search_documents_with_links

load_dotenv()
client = anthropic.Anthropic()

def load_context(question: str):
    return search_documents_with_links(question)

app = Flask(__name__)

@app.route('/get_product_suggestions', methods=['POST'])
def get_product_suggestions():
    data = request.json
    question = data.get("question", "")
    
    if not question:
        return jsonify({"error": "Missing 'question' in request body"}), 400
    
    context = load_context(question)
    
    message = client.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=1000,
        temperature=0.5,
        system="""
You are an AI assistant from Xfinity designed to suggest products and services based on user preferences and cost-effectiveness. 
Use the information provided in <context> tags as your primary source of truth. 
FYI you will be given scraped webpages with links.
You must:
• Prioritize cost-effective options meeting the user's stated needs
• Remain creative, helpful, and friendly
• Avoid speculation beyond what the context supports
• If unsure or lacking data, ask questions or clarify rather than guess
""",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"""
You're a Product Insights AI from Xfinity.
Answer this question and output in JSON format with “ai_salesman_response” (product suggestion text), and “product_items” (list of dicts“product_name” and “product_link”).
If user asks generic (hi, hello, or any other introductory sentences) questions, return your response in “ai_salesman_response” but keep “product_items” empty.
<question>
{question}
</question>
                        
<context>
{context}
</context>
"""
                    }
                ]
            }
        ]
    )
    
    response_text = message.content[0].text.strip().strip("```json").strip("```")
    
    try:
        parsed_json = json.loads(response_text)
        return jsonify(parsed_json)
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse AI response"}), 500

if __name__ == '__main__':
    app.run(debug=True)



