import sys
import ssl
import json

def search(query: str):
    ssl._create_default_https_context = ssl._create_unverified_context
    if sys.version_info[0]==2:
        import six
        from six.moves.urllib import request
        opener = request.build_opener(
            request.ProxyHandler(
                {'http': 'http://brd-customer-hl_8ab66c71-zone-serp_api_codefest:7wu1yt6fyb2t@brd.superproxy.io:33335',
                'https': 'http://brd-customer-hl_8ab66c71-zone-serp_api_codefest:7wu1yt6fyb2t@brd.superproxy.io:33335'}))
        
    if sys.version_info[0]==3:
        import urllib.request
        opener = urllib.request.build_opener(
            urllib.request.ProxyHandler(
                {'http': 'http://brd-customer-hl_8ab66c71-zone-serp_api_codefest:7wu1yt6fyb2t@brd.superproxy.io:33335',
                'https': 'http://brd-customer-hl_8ab66c71-zone-serp_api_codefest:7wu1yt6fyb2t@brd.superproxy.io:33335'}))
        f"https://www.google.com/search?q={query}?num=10&gl=us&brd_json=1"
    results = opener.open(f"https://www.google.com/search?q={query}?num=10&gl=us&brd_json=1").read()
    
    json_string = results.decode('utf-8')
    json_data = json.loads(json_string)

    return json_data

def get_top_links(query: str):
    links = []
    for each in search(query.replace(" ","+"))["organic"][:3]:
        links.append(each["link"])
    return links

if __name__ == "__main__":
    print(get_top_links("300 Mbps Tmobile"))
