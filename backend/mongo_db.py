from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# Default database configurations
# Should be modified depending on user's system.
username = "root"
password = "root"
host = "localhost"
port = 27017
auth_source = "admin"
db_name = "mongo_expenditure"
collection_name = "expenditure"

uri = f"mongodb://{username}:{password}@{host}:{port}/?authSource={auth_source}"

# Attempt to establish a connection to mongo_db
client = None
try:
  client = MongoClient(uri)
  client.admin.command("ping")
  print("[DB] Successful connection to Mongo DB.")
except ConnectionFailure as e:
  print(f"[DB] Failed to connect to Mongo DB: {e}")
except Exception as e:
  print(f"[DB] Connection to Mongo DB resulted in exception: {e}")

# Database name to connect to. 
db = client[db_name]

# Assume the database and collection does not exist yet. If one exists, use the existing database
# Else, create a new database and collection
collection = None
if collection_name in db.list_collection_names():
  collection = db[collection_name]
  print("[DB] Found existing collection.")
else:
  collection = db.create_collection(collection_name)
  print("[DB] Created new collection.")