from pymilvus import MilvusClient
from pymilvus.exceptions import MilvusException


import logging

# Configure logger
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

MILVUS_URI = "http://localhost:19530"

COLLECTIONS_CONFIG = {
    "CCST_VDB": {
        "dimension": 1024,
        "metric_type": "COSINE",
        "partitions": ["TV_data", "Internet_data","Mobile_data","Home_Solution_data","Home_Phone_Data"]
    }
} # type: ignore

# Initialize Milvus Client
client = MilvusClient(
    uri="http://localhost:19530"
)

def get_milvus_client():
    return client

def create_collection(client: MilvusClient, name: str, dimension: int, metric_type: str) -> None:
    """Creates a Milvus collection."""
    try:
        client.create_collection(
            collection_name=name,
            dimension=dimension,
            metric_type=metric_type
        )
        logger.info(f"Collection '{name}' created successfully.")
    except MilvusException as e:
        if "already exists" in str(e):
            logger.warning(f"Collection '{name}' already exists.")
        else:
            logger.error(f"Failed to create collection '{name}': {e}")
            raise


def create_partition(client: MilvusClient, collection_name: str, partition_name: str) -> None:
    """Creates a partition within a Milvus collection."""
    try:
        client.create_partition(
            collection_name=collection_name,
            partition_name=partition_name
        )
        logger.info(f"Partition '{partition_name}' created in collection '{collection_name}'.")
    except MilvusException as e:
        if "already exists" in str(e):
            logger.warning(f"Partition '{partition_name}' already exists in collection '{collection_name}'.")
        else:
            logger.error(f"Failed to create partition '{partition_name}' in collection '{collection_name}': {e}")
            raise


def main():
    # Initialize Milvus client
    client = MilvusClient(uri=MILVUS_URI)
    logger.info("Connected to Milvus.")


    # Create collections and partitions
    for collection, details in COLLECTIONS_CONFIG.items():
        create_collection(client, collection, details["dimension"], details["metric_type"])
        for partition in details["partitions"]:
            create_partition(client, collection, partition)

if __name__ == "__main__":
    main()

