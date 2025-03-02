import os
import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin, urlparse
from tqdm import tqdm

BASE_URL = "https://www.xfinity.com"
OUTPUT_DIR = "xfinity_texts"
visited_urls = set()

def save_text_to_file(url, text):
    """Saves extracted text from a URL to a file."""
    filename = urlparse(url).path.replace("/", "_").strip("_") or "homepage"
    filename = re.sub(r'\W+', '_', filename) + ".txt"
    file_path = os.path.join(OUTPUT_DIR, filename)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"Saved: {file_path}")

def extract_text_from_page(url):
    """Fetches a web page and extracts text."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Failed to fetch {url}: {e}")
        return None

    soup = BeautifulSoup(response.text, "html.parser")
    paragraphs = soup.find_all("p")
    text = "\n".join(p.get_text(strip=True) for p in paragraphs)
    
    return text if text else None

def get_internal_links(url, soup):
    """Extracts all internal links from a page."""
    links = set()
    for a_tag in soup.find_all("a", href=True):
        href = a_tag["href"]
        full_url = urljoin(BASE_URL, href)
        
        if BASE_URL in full_url and full_url not in visited_urls:
            links.add(full_url)
    
    return links

def crawl_xfinity(start_url):
    """Crawls the Xfinity website and saves extracted text."""
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    to_visit = {start_url}

    with tqdm() as progress:
        while to_visit:
            url = to_visit.pop()
            if url in visited_urls:
                continue

            visited_urls.add(url)
            text = extract_text_from_page(url)

            if text:
                save_text_to_file(url, text)

            try:
                response = requests.get(url, timeout=10)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, "html.parser")
                new_links = get_internal_links(url, soup)
                to_visit.update(new_links)
            except requests.RequestException as e:
                print(f"Skipping {url}: {e}")

            progress.update(1)

if __name__ == "__main__":
    crawl_xfinity(BASE_URL)
