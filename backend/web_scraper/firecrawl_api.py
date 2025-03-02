# Install with pip install firecrawl-py
from firecrawl import FirecrawlApp
import os
from dotenv import load_dotenv

load_dotenv()

app = FirecrawlApp(api_key=os.getenv("FIRECRAWL_API_KEY"))

def return_markdown(url: str):
    response = app.scrape_url(url=url, params={'formats': [ 'markdown' ],})
    return response['markdown']
