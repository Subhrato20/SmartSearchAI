from firecrawl import FirecrawlApp
import os
import json
from urllib.parse import urlparse
from dotenv import load_dotenv
import re

load_dotenv()

# Initialize the Firecrawl app with your API key
api_key = os.environ.get('FIRECRAWL_API_KEY')
app = FirecrawlApp(api_key)

# Define the crawl parameters
target_url = 'https://xfinity.com/'
crawl_params = {
    'limit': 5,
    'scrapeOptions': {'formats': ['markdown']},
    'allowBackwardLinks': True
}

# Extract domain for folder naming
parsed_url = urlparse(target_url)
domain_folder = parsed_url.netloc.replace('.', '_')

# Create main output folder
os.makedirs(domain_folder, exist_ok=True)

def sanitize_filename(name):
    return re.sub(r'[^a-zA-Z0-9_\-]', '_', name)

# Start the crawl
try:
    crawl_status = app.crawl_url(
        target_url,
        params=crawl_params,
        poll_interval=30
    )
    print("Crawl completed successfully.")
    print(f"Credits used: {crawl_status['creditsUsed']}")
    print(f"Pages crawled: {len(crawl_status['data'])}")

    # print(crawl_status)
    for page in crawl_status['data']:
        url = page.get('metadata', '').get('url', 'unknown_url')
        content = page.get('markdown', '')

        # Create a safe filename from the URL path
        parsed_page_url = urlparse(url)
        path = parsed_page_url.path or 'index'
        filename = sanitize_filename(path.strip('/')) or 'index'
        output_path = os.path.join(domain_folder, f"{filename}.txt")

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(url + '\n\n' + content)

    print(f"All pages saved in folder: {domain_folder}")

except Exception as e:
    print(f"An error occurred during crawling: {str(e)}")
