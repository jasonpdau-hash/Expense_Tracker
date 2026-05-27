from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

from dotenv import load_dotenv
import os

load_dotenv()

# Default database configurations
# Should be modified depending on user's system.
username=os.getenv("db_username")
password=os.getenv("db_password")
host=os.getenv("db_host")
port=int(os.getenv("db_port"))
auth_source=os.getenv("db_auth_source")
db_name=os.getenv("db_name")

users_collection_name=os.getenv("db_users_collection_name")
expenses_collection_name=os.getenv("db_expenses_collection_name")
actions_collection_name=os.getenv("db_actions_collection_name")



# Returns a collection from the given database (if exists). Otherwise, creates and returns a new collection
def db_get_collection(db, collection_name):
  if collection_name in db.list_collection_names():
    print(f"[DB] Found existing collection: {collection_name}")
    return db[collection_name]
  else:
    print(f"[DB] Created new collection: {collection_name}")
    return db.create_collection(collection_name)


# Builds a connection to mongo db
def db_build_connection():
  uri = f"mongodb://{username}:{password}@{host}:{port}/?authSource={auth_source}"
  
  client = None
  try:
    client = MongoClient(uri)
    client.admin.command("ping")
    print("[DB] Successful connection to Mongo DB")
  except ConnectionFailure as outp:
    print(f"[DB] Failed to connect to Mongo DB: {outp}")
  except Exception as outp:
    print(f"[DB] Mongo DB Exception error: {outp}")

  return client


# Database name to connect to, and create / find collections.
client = db_build_connection()
database = client[db_name]

users_collection = db_get_collection(database, users_collection_name)
expenses_collection = db_get_collection(database, expenses_collection_name)
actions_collection = db_get_collection(database, actions_collection_name)