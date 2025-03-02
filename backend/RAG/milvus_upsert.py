import json
import logging
from pymilvus import MilvusClient, MilvusException

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Milvus connection settings
MILVUS_URI = "http://localhost:19530"
COLLECTION_NAME = "CCST"
PARTITION_NAME = "TV_data"

# Initialize Milvus client
client = MilvusClient(uri=MILVUS_URI)

def load_json(file_path):
    """Load data from a JSON file."""
    with open(file_path, "r") as f:
        return json.load(f)

def upsert_to_milvus(client, collection_name, partition_name, json_objects):
    """Upserts data into Milvus."""
    if not json_objects:
        logger.error("No data found to upsert.")
        return

    # Ensure partition exists
    try:
        client.create_partition(collection_name=collection_name, partition_name=partition_name)
    except MilvusException as e:
        if "already exists" in str(e):
            logger.info(f"Partition '{partition_name}' already exists.")
        else:
            logger.error(f"Error creating partition: {e}")
            return

    # Upsert data
    try:
        client.upsert(
            collection_name=collection_name,
            data=json_objects,
            partition_name=partition_name
        )
        logger.info(f"Upserted {len(json_objects)} records into collection '{collection_name}', partition '{partition_name}'.")
    except MilvusException as e:
        logger.error(f"Failed to upsert data: {e}")

if __name__ == "__main__":
    json_file_path = "data.json"  # Change this to your actual file path
    json_data = load_json(json_file_path)
    upsert_to_milvus(client, COLLECTION_NAME, PARTITION_NAME, json_data)
