import os
import json
import logging
from pymilvus import MilvusClient, MilvusException

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Milvus connection settings
MILVUS_URI = "http://localhost:19530"
COLLECTION_NAME = "CCST_VDB"

# Define partitions
PARTITIONS = {
    "tvdata": "TV_data",
    "internet": "Internet_data",
    "mobile": "Mobile_data",
    "home_solution": "Home_Solution_data",
    "home_phone": "Home_Phone_Data",
}

# Initialize Milvus client
client = MilvusClient(uri=MILVUS_URI)

def load_json(file_path):
    """Load data from a JSON file."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading JSON file {file_path}: {e}")
        return []

def upsert_to_milvus(client, collection_name, partition_name, json_objects):
    """Upserts data into Milvus."""
    if not json_objects:
        logger.error(f"No data found to upsert for partition '{partition_name}'.")
        return

    # Ensure partition exists
    try:
        client.create_partition(collection_name=collection_name, partition_name=partition_name)
        logger.info(f"Created partition '{partition_name}'.")
    except MilvusException as e:
        if "already exists" in str(e):
            logger.info(f"Partition '{partition_name}' already exists.")
        else:
            logger.error(f"Error creating partition '{partition_name}': {e}")
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

def process_json_files(json_directory):
    """Process and upsert JSON files into corresponding partitions."""
    for file_name in os.listdir(json_directory):
        if file_name.endswith(".json"):
            file_path = os.path.join(json_directory, file_name)
            partition_key = file_name.replace(".json", "").lower()

            # Match partition name
            partition_name = PARTITIONS.get(partition_key)
            if not partition_name:
                logger.warning(f"No matching partition for file '{file_name}', skipping.")
                continue

            json_data = load_json(file_path)
            upsert_to_milvus(client, COLLECTION_NAME, partition_name, json_data)

# Example Usage
json_directory = "./processed"  # Update with the correct path where JSON files are stored
process_json_files(json_directory)
