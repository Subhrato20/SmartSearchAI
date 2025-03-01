import json
import logging
from typing import Any, Dict, List

import boto3
from botocore.exceptions import ClientError
from pymilvus import MilvusClient
from pymilvus.exceptions import MilvusException

# Configuration Constants
MILVUS_URI = "http://localhost:19530"

COLLECTIONS_CONFIG = {
    "CCST": {
        "dimension": 1024,
        "metric_type": "COSINE",
        "partitions": ["TV_data"]
    }
}

# S3_CONFIG = {
#     "SCbranch": {"bucket": "CCST-json", "key": "CCAST.json"},
# }

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

def fetch_data_from_s3(s3_client: boto3.client, bucket: str, key: str) -> Any:
    """Fetches and deserializes JSON data from an S3 object."""
    try:
        response = s3_client.get_object(Bucket=bucket, Key=key)
        json_data = response['Body'].read().decode('utf-8')
        data = json.loads(json_data)
        logger.info(f"Data fetched from S3 bucket '{bucket}', key '{key}'.")
        return data
    except ClientError as e:
        logger.error(f"Failed to fetch data from S3 bucket '{bucket}', key '{key}': {e}")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Failed to decode JSON from S3 object '{key}': {e}")
        return None

def validate_data(data: Any) -> bool:
    """Validates the structure of the data before upserting."""
    if not isinstance(data, list):
        logger.warning("Data is not a list.")
        return False
    # Additional validation rules can be added here
    return True

def validate_partition(client: MilvusClient, collection: str, partition: str) -> bool:
    """Checks if a partition exists in the specified collection."""
    try:
        exists = client.has_partition(collection_name=collection, partition_name=partition)
        if exists:
            return True
        else:
            logger.error(f"Partition '{partition}' not found in collection '{collection}'.")
            return False
    except MilvusException as e:
        logger.error(f"Error checking existence of partition '{partition}' in collection '{collection}': {e}")
        return False

def upsert_data(client: MilvusClient, collection: str, partition: str, data: List[Dict[str, Any]], batch_size: int = 1000) -> None:
    """Upserts data into a specified Milvus collection and partition in batches."""
    if not validate_partition(client, collection, partition):
        logger.error(f"Partition '{partition}' does not exist in collection '{collection}'. Skipping upsert.")
        return

    if not validate_data(data):
        logger.error(f"Invalid data for collection '{collection}', partition '{partition}'. Skipping upsert.")
        return

    try:
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            client.upsert(
                collection_name=collection,
                data=batch,
                partition_name=partition
            )
            logger.info(f"Upserted batch {i // batch_size + 1} to collection '{collection}', partition '{partition}'.")
    except MilvusException as e:
        logger.error(f"Failed to upsert data to collection '{collection}', partition '{partition}': {e}")
        raise

def main():
    # Initialize Milvus client
    client = MilvusClient(uri=MILVUS_URI)
    logger.info("Connected to Milvus.")

    # Initialize S3 client
    s3 = boto3.client('s3')
    logger.info("Connected to AWS S3.")

    # Create collections and partitions
    for collection, details in COLLECTIONS_CONFIG.items():
        create_collection(client, collection, details["dimension"], details["metric_type"])
        for partition in details["partitions"]:
            create_partition(client, collection, partition)

    # Upsert data from S3 to Milvus
    for partition, s3_info in S3_CONFIG.items():
        data = fetch_data_from_s3(s3, s3_info["bucket"], s3_info["key"])
        if data:
            for collection, details in COLLECTIONS_CONFIG.items():
                if partition in details["partitions"]:
                    upsert_data(client, collection, partition, data)
                else:
                    logger.info(f"Skipping upsert for collection '{collection}' as partition '{partition}' is not applicable.")

if __name__ == "__main__":
    main()
