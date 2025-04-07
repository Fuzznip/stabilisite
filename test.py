import requests

splits = [
    {"id": "8240e085-95bd-4e49-b44e-aa4684de5a48"},
]

base_url = "https://stabilibackend-staging.up.railway.app/splits"

for split in splits:
    split_id = split["id"]
    url = f"{base_url}/{split_id}"
    response = requests.delete(url)
    print(f"DELETE {url} - Status: {response.status_code}")
