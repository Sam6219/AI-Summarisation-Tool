from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import ollama
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
)


@app.post("/generate")
def generate(prompt: str = Body(..., embed=True)):
    # Check if the prompt uses the new format
    if "<|begin_of_text|>" in prompt:
        messages = []

        # Extract system message
        system_pattern = r"<\|start_header_id\|>system<\|end_header_id\|>(.*?)<\|eot_id\|>"
        system_match = re.search(system_pattern, prompt, re.DOTALL)
        if system_match:
            system_content = system_match.group(1).strip()
            messages.append({"role": "system", "content": system_content})

        # Extract user message
        user_pattern = r"<\|start_header_id\|>user<\|end_header_id\|>(.*?)<\|eot_id\|>"
        user_match = re.search(user_pattern, prompt, re.DOTALL)
        if user_match:
            user_content = user_match.group(1).strip()
            messages.append({"role": "user", "content": user_content})

        # If no matches found, fall back to the entire prompt as user content
        if not messages:
            messages.append({"role": "user", "content": prompt})
    else:
        # Handle legacy format for backward compatibility
        messages = []
        # Split only if "user" exists in prompt
        if "user" in prompt:
            try:
                system_part, user_part = prompt.split("user", 1)
                messages.append({
                    "role": "system",
                    "content": system_part.replace("system", "").strip()
                })
                messages.append({
                    "role": "user",
                    "content": user_part.strip()
                })
            except ValueError:
                # Fallback if split fails
                messages.append({"role": "user", "content": prompt})
        else:
            messages.append({"role": "user", "content": prompt})

    response = ollama.chat(
        model="llama3.2:latest",
        messages=messages
    )
    return {"response": response["message"]["content"]}
