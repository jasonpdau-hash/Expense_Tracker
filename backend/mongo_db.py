from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# Default database configurations
# Should be modified depending on user's system.
username = "root"
password = "root"
host = "localhost"
port = 27017
auth_source = "admin"
db_name = "mongo_expenses_app"
collection_name = "expenses"

users_collection_name = "users"
expenses_collection_name = "expenses"
actions_collection_name = "actions"



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

    # db = client[db_name]

    # return (
    #   client,
    #   db_get_collection(db, users_collection_name),
    #   db_get_collection(db, expenses_collection_name),
    #   db_get_collection(db, actions_collection_name),
    # )
  return client


# Database name to connect to. 
client = db_build_connection()
database = client[db_name]

collection = db_get_collection(database, collection_name)

users_collection = db_get_collection(database, users_collection_name)
expenses_collection = db_get_collection(database, expenses_collection_name)
actions_collection = db_get_collection(database, actions_collection_name)