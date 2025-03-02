import re
import json
import os
import requests
import anthropic
from dotenv import load_dotenv
from flask import Flask, request, jsonify

load_dotenv()
client = anthropic.Anthropic()

def load_context():
    with open("backend/llm_engine/temp_context.txt", "r", encoding='utf-8') as f:
        return f.read()

app = Flask(__name__)

@app.route('/get_product_suggestions', methods=['POST'])
def get_product_suggestions():
    data = request.json
    question = data.get("question", "")
    
    if not question:
        return jsonify({"error": "Missing 'question' in request body"}), 400
    
    context = load_context()
    
    message = client.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=1000,
        temperature=0.5,
        system="""
You are an AI assistant designed to suggest products and services based on user preferences and cost-effectiveness. 
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
You're a Product Insights AI.
Answer this question and output in JSON format with “ai_salesman_response” (product suggestion text), and “product_items” (list of dicts“product_name” and “product_link”).
                        
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
