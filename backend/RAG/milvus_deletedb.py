from pymilvus import MilvusClient

# Milvus connection settings
MILVUS_URI = "http://localhost:19530"
COLLECTION_NAME = "Xfinity_VDB"

# Initialize Milvus client
client = MilvusClient(uri=MILVUS_URI)

# List of partitions
PARTITIONS = ["TV_data", "Internet_data", "Mobile_data", "Home_Solution_data", "Home_Phone_data"]

# Delete all data from each partition
for partition in PARTITIONS:
    try:
        delete_expr = f"partition_name == '{partition}'"
        client.delete(collection_name=COLLECTION_NAME, filter=delete_expr)
        print(f"Deleted all data from partition '{partition}'.")
    except Exception as e:
        print(f"Error deleting data from partition '{partition}': {e}")
