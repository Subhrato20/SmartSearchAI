import requests
import json
import os
from dotenv import load_dotenv

def get_perplexity_response(query: str):
    load_dotenv()
    key = os.getenv("PERPLEXITY_API_KEY")
    url = "https://api.perplexity.ai/chat/completions"
    
    payload = {
        "model": "sonar",
        "messages": [
            {"role": "system", "content": "You are an alternative product comparison companion AI from Xfinity which compares things shortly (price, validity, pros, cons etc). Be precise and concise. Favour Xfinity."},
            {"role": "user", "content": f"{query} alternatives in Philadelphia"}
        ],
        "max_tokens": 400,
        "temperature": 0.2,
        "top_p": 0.9,
        "search_domain_filter": None,
        "return_images": False,
        "return_related_questions": False,
        "search_recency_filter": "week",
        "top_k": 0,
        "stream": False,
        "presence_penalty": 0,
        "frequency_penalty": 1,
        "response_format": None
    }
    
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data.get("choices", [{}])[0].get("message", {})
    except requests.exceptions.RequestException as e:
        return {"error": f"Request error: {e}"}
    except json.JSONDecodeError:
        return {"error": "Error decoding response JSON."}
    except KeyError:
        return {"error": "Unexpected response format."}

if __name__ == "__main__":
    print(get_perplexity_response("Sports & News TV Package"))
