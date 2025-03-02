from google import genai

client = genai.Client(api_key="AIzaSyBY7MuR7o5nmk-Vys7B0gRYqyb-PWrhLwQ")
response = client.models.generate_content(
    model="gemini-2.0-flash", contents="top sports channel provider comparison in philadelphia? shortly tell"
)
print(response.text)