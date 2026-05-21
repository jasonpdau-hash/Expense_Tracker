from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

CONNECTION_STRING = "mongodb://root:root@localhost:27017/?authSource=admin"

def check_mongodb_connection(uri):
  """
  Tests mongoDB connection
  """
  client = None
  try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")
    print("MongoDB connection successful!")
    return True
  except ConnectionFailure as e:
    print(f"MongoDB connection failed: {e}")
    return False
  except Exception as e:
    print(f"An unknown error occured: {e}")
    return False
  finally:
    if client:
      client.close()

if __name__ == "__main__":
  check_mongodb_connection(CONNECTION_STRING)