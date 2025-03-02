import os
import json
import numpy as np
from transformers import AutoTokenizer, AutoModel
import torch


def extract_text_from_file(file_path):
    """Extract text and URL from a .txt file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        url = lines[0].strip() if lines else ""
        text = "".join(lines[1:]).strip() if len(lines) > 1 else ""
    return url, text


def chunk_files_in_directory(directory_path):
    """Reads and chunks .txt files in a directory, treating each file as a single chunk."""
    chunks = []
    urls = []
    for file_name in os.listdir(directory_path):
        file_path = os.path.join(directory_path, file_name)
        if file_name.endswith('.txt'):
            url, text = extract_text_from_file(file_path)
            chunks.append(text)  # Each file is a single chunk
            urls.append(url)
            print(f"Chunk {len(chunks)}: {file_name} (size: {len(text.split())} words, URL: {url})")

    return chunks, urls


def create_embeddings(chunks, model_name='BAAI/bge-large-en-v1.5'):
    """Generate embeddings for text chunks using BAAI/bge-large-en-v1.5."""
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModel.from_pretrained(model_name)

    embeddings = []
    for chunk in chunks:
        inputs = tokenizer(chunk, return_tensors='pt', truncation=True, padding=True)
        with torch.no_grad():
            outputs = model(**inputs)
        chunk_embedding = outputs.last_hidden_state.mean(dim=1).squeeze().detach().numpy()
        embeddings.append(chunk_embedding)

    return embeddings


def save_to_json(embeddings, chunks, urls, output_file):
    """Save the embeddings, text chunks, and URLs to a JSON file."""
    json_objects = [{
        "id": idx,
        "url": urls[idx],
        "text": chunk,
        "vector": row.tolist()
    } for idx, (chunk, row) in enumerate(zip(chunks, embeddings))]

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(json_objects, f, indent=4)

    print(f"Saved: {output_file}")


def process_directories(directory_paths, output_folder):
    """Process multiple directories and save separate JSON files for each."""
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for directory_path in directory_paths:
        dir_name = os.path.basename(directory_path.rstrip('/'))
        output_file = os.path.join(output_folder, f"{dir_name}.json")

        chunks, urls = chunk_files_in_directory(directory_path)
        if chunks:
            embeddings = create_embeddings(chunks)
            save_to_json(embeddings, chunks, urls, output_file)
        else:
            print(f"No text files found in {directory_path}, skipping.")


# Example Usage
directories = [
    "../text_data/tvdata",
    "../text_data/internet",
    "../text_data/mobile",
    "../text_data/home_solution",
    "../text_data/home_phone",
    "../text_data/misc"
]

output_folder = "./processed"
process_directories(directories, output_folder)
