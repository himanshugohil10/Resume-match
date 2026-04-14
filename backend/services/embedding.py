from sentence_transformers import SentenceTransformer, util
import numpy as np

# Load the model locally
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embeddings(text_list: list) -> list:
    """Generate embeddings for a list of strings."""
    if not text_list:
        return []
    embeddings = model.encode(text_list, convert_to_tensor=True)
    return embeddings

def calculate_similarity(embedding1, embedding2):
    """Calculate cosine similarity between two embeddings."""
    if embedding1 is None or embedding2 is None or len(embedding1) == 0 or len(embedding2) == 0:
        return 0.0
    
    # util.cos_sim returns a tensor, take the item
    score = util.cos_sim(embedding1, embedding2)
    return float(score[0][0])

def get_semantic_match_score(list1: list, list2: list) -> float:
    """Calculate an overall semantic similarity score between two lists of phrases."""
    if not list1 or not list2:
        return 0.0
    
    # Get embeddings for both lists
    emb1 = get_embeddings(list1)
    emb2 = get_embeddings(list2)
    
    # Calculate similarity matrix
    sim_matrix = util.cos_sim(emb1, emb2)
    
    # For each item in list1 (JD requirements), find the best match in list2 (Resume)
    # This ensures we check how well each JD requirement is covered by the resume
    max_similarities = sim_matrix.max(dim=1).values
    avg_similarity = max_similarities.mean().item()
    
    return float(avg_similarity)
