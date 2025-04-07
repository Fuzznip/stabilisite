import requests

splits = [
    {"id": "156543787882119168"},
]

base_url = "https://stabilibackend-staging.up.railway.app/users"

for split in splits:
    split_id = split["id"]
    url = f"{base_url}/{split_id}"
    response = requests.delete(url)
    print(f"DELETE {url} - Status: {response.status_code}")
