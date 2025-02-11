from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from transformers import StoppingCriteria, StoppingCriteriaList

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("deepseek-ai/deepseek-coder-6.7b-instruct", trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained("deepseek-ai/deepseek-coder-6.7b-instruct", trust_remote_code=True, torch_dtype=torch.bfloat16).cuda()

# Define streaming generator function
def stream_generate(prompt, max_new_tokens=512):
    messages = [{'role': 'user', 'content': prompt}]
    inputs = tokenizer.apply_chat_template(messages, add_generation_prompt=True, return_tensors="pt").to(model.device)

    # Stream generation using generate() with `stopping_criteria`
    for output in model.generate(inputs, max_new_tokens=max_new_tokens, do_sample=True, top_k=50, top_p=0.95, num_return_sequences=1, eos_token_id=tokenizer.eos_token_id):
        decoded_text = tokenizer.decode(output[len(inputs[0]):], skip_special_tokens=True)
        yield decoded_text  # Stream response

# Example: Streaming response
for chunk in stream_generate("write a quick sort algorithm in python."):
    print(chunk, end="", flush=True)  # Prints token-by-token
