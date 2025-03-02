import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

import json
import anthropic
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from RAG.milvus_search import search_documents_with_links
from call_perplexity import get_perplexity_response

load_dotenv()
client = anthropic.Anthropic()

def load_context(question: str):
    return search_documents_with_links(question)

app = Flask(__name__)
CORS(app)

@app.route('/get_alternatives', methods=['POST'])
def get_alternatives():
    data = request.json
    query = data.get("query", "")
    
    if not query:
        return jsonify({"error": "Missing 'query' in request body"}), 400
    
    ################### REMOVE ###################
    return jsonify({
        "content": "If you're looking for sports and news TV package alternatives in Philadelphia, here are some options compared to Xfinity:\n\n## Alternatives\n\n1. **Hulu + Live TV**\n   - **Price**: $82.99/month\n   - **Pros**: Offers a wide range of sports channels (ESPN, Fox Sports, NFL Network), local channels, and includes ESPN Plus.\n   - **Cons**: Expensive, lacks regional sports networks like Bally Sports.\n\n2. **Sling TV**\n   - **Price**: $40-$45/month (Orange/Blue plans)\n   - **Pros**: Affordable, customizable with add-ons, includes ESPN and some local channels.\n   - **Cons**: Limited local channel availability, no regional sports networks.\n\n3. **Fubo**\n   - **Price**: $70-$110/month\n   - **Pros**: Comprehensive sports coverage, includes international sports and local channels.\n   - **Cons**: Expensive, navigation can be clunky.\n\n4. **Philo**\n   - **Price**: $28/month\n   - **Pros**: Inexpensive, includes AMC+, no sports or local channels.\n   - **Cons**: Not suitable for sports or news enthusiasts.\n\n## Xfinity Advantage\n- **Price**: Varies by package, but generally competitive with more comprehensive channel options.\n- **Pros**: Offers a wide range of sports and news channels, including local and regional networks, with robust DVR capabilities.\n- **Cons**: Pricing can vary significantly based on location and package.\n\nXfinity provides a more comprehensive package with local and regional sports networks, making it a strong choice for those seeking a full sports and news experience in Philadelphia.",
        "role": "assistant"
    })
    ################### REMOVE ###################
    
    response = get_perplexity_response(query)
    return jsonify(response)

@app.route('/get_product_suggestions', methods=['POST'])
def get_product_suggestions():
    data = request.json
    question = data.get("question", "")
    
    if not question:
        return jsonify({"error": "Missing 'question' in request body"}), 400
    
    ################### REMOVE ###################
    return jsonify({
        "ai_salesman_response": "dummy text here",
        "product_items": [
            {
                "product_link": "https://www.xfinity.com/learn/digital-cable-tv/sports-news",
                "product_name": "Sports & News TV Package"
            },
            {
                "product_link": "https://www.xfinity.com/learn/digital-cable-tv/add-channels",
                "product_name": "Sports Add-on Packages"
            },
            {
                "product_link": "https://www.xfinity.com/learn/digital-cable-tv/sports-news",
                "product_name": "TV + Internet + Mobile Bundle"
            }
        ]
    })
    ################### REMOVE ###################
    
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
    app.run(host='0.0.0.0', port=5000, debug=True)



