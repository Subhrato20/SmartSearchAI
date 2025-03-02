import serp_api
import firecrawl_api

def search(query: str):
    results = serp_api.get_top_links(query+ " alternative 2025")
    context  = ""

    for each in results:
        try:
            context += firecrawl_api.return_markdown(each) + "\n\n\n"
        except:
            pass

    return context

if __name__ == "__main__":
    print(search("300 Mbps Tmobile"))
