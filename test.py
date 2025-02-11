import ollama

# Define the messages
messages = [
    {"role": "user", "content": "write code to add 4 and 7"}

]

# Call the model and handle it as a stream
response = ollama.chat(model="deepseek-coder:6.7b", messages=messages)

# Process the response incrementally (streaming simulation)
messages.append({"role": "assistant", "content":response['message']['content']})
# Define the messages
messages.append({"role": "user", "content": "now write code substruct this two numbers"})
response = ollama.chat(model="deepseek-coder:6.7b", messages=messages)
print(response['message']['content'])