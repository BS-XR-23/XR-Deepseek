import requests
import json

url = "http://localhost:11434/api/chat"
headers = {"Content-Type": "application/json"}

data = {
    "model": "deepseek-coder:6.7b",
    "stream": False,
    "messages": [
        {"role": "user", "content": "write code to add 4 and 7"},
        {"role": "assistant", "content": "```python num1 = 4 num2 = 7 # adding the two numbers sum = num1 + num2 print(\"The sum of 4 and 7 is\", sum)```"},
        {"role": "user", "content": "now substruct this two numbers"}
    ]
}

response = requests.post(url, headers=headers, data=json.dumps(data))

print(response.json())
