from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
from mongo_db import users_collection, expenses_collection, actions_collection 
# Import our collection from mongo_db for use here.


#
# Import security libraries for hashing and jwt tokens.
#
from fastapi.security import OAuth2PasswordBearer
import bcrypt
import jwt

from dotenv import load_dotenv
import os
load_dotenv()

# JWT token configuration
JWT_SECRET=os.getenv("app_jwt_secret") 
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60
OA2_scheme = OAuth2PasswordBearer(
  tokenUrl="login"
)



# Fast API instance
app = FastAPI()

# Define the origins that are allowed to talk to your server
origins = [
  "http://localhost:3000",  # Default React port
  "http://127.0.0.1:3000",
  "http://localhost:5173",  # Default Vite/React port
  "http://127.0.0.1:5173",
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
  allow_headers=["*"],  # Allows all headers
)



#
# === Security Functions ===
#

# Hashes a given plaintext password for secure storage in the database
def hash_password(plain_password: str) -> str:
  password_bytes = plain_password.encode("utf-8")
  salt = bcrypt.gensalt(rounds=12)
  hash = bcrypt.hashpw(password_bytes, salt)
  return hash.decode("utf-8")

# Check given input password against the password stored in the database, return true or false.
def check_password(plain_password: str, encrypted_password: str) -> bool:
  plain_bytes = plain_password.encode("utf-8")
  hash_bytes = encrypted_password.encode("utf-8")
  return bcrypt.checkpw(plain_bytes, hash_bytes) # returns true if both strings match

# Generates a JWT access token using the email address with a expiry time of 60 minutes.
def generate_token(data: dict, expiry_time: timedelta):
  payload = data.copy()
  expiry = datetime.now(timezone.utc) + (expiry_time)
  payload.update({"exp": expiry})
  encoded_jwt = jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)
  return encoded_jwt

# Used in our endpoints to obtain the user email with jwt verification.
async def get_user_email(token: str = Depends(OA2_scheme)):
  try:
    payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
    email: str = payload.get("sub")

    if email is None:
      raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="[Auth] Invalid token."
      )
    return email
  except jwt.ExpiredSignatureError:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="[Auth] Token expired."
    )
  except jwt.PyJWTError:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="[Auth] Credentials can not be validated."
    )



#
# === Demonstration users for the app - insert into the users collection.
#

# Pydantic model to structure user data required for database.
class user_data(BaseModel):
  email: str
  password: str
  role: str

# Registers our demonstration users for the database
def add_user(data: user_data):

  # Check if this user already exists in the database. If exists, we skip that user.
  exists = users_collection.find_one({"email": data.email})
  if exists:
    print(f"[User] User {data.email} already exists.")
    return
  users_collection.insert_one(
    {
      "email": data.email,
      "password": hash_password(data.password),
      "role": data.role,
    }
  )
  print(f"[User] {data.email} registered.")
  return {
    "status": "success",
    "message": f"User {data.email} registered.",
  }

# Populate the database with demo users according to specifications.
add_user(user_data(email="admin@test.com", password="admin", role="admin"))
add_user(user_data(email="user1@test.com", password="user1", role="user"))
add_user(user_data(email="user2@test.com", password="user2", role="user"))


#
# === Endpoints ===
#

# --- Login/Logout ---
#
# Pydantic model to structure form data. 
class LoginRequest(BaseModel):
  email: str
  password: str

# The login endpoint. Returns the jwt token
@app.post("/login")
async def user_login(form_data: LoginRequest):

  # Check if this user is in the database, if not then return http unauthourised
  user = users_collection.find_one({"email": form_data.email})
  if not user:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="[User] User not found."
    )
  # If we are here, now check the input password against the hashed password in the database
  # If this fails, return http unauthourised.
  if not check_password(form_data.password, user.get("password")):
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="[User] Incorrect username or password."
    )
  
  # If we reach here, then all checks have passed.
  # Add this login event to the actions collection with user email.
  generic_action(action_log(email=user.get("email"), action="USER_LOGIN"))

  # Generate jwt token
  jwt_token_expiry = timedelta(minutes=TOKEN_EXPIRE_MINUTES)
  jwt_token = generate_token(
    data={"sub": form_data.email},
    expiry_time=jwt_token_expiry
  )
  # Return the access token, email of the user and their role.
  return {
    "status": "success",
    "access_token": jwt_token,
    "token_type": "bearer",
    "email": form_data.email,
    "role": user.get("role")
  }


# Simple pydantic model to validate logout requests.
class LogoutRequest(BaseModel):
  email: str

@app.post("/logout")
async def user_logout(email: LogoutRequest):
  # Integrity check, We use the email address matching the one stored in the database
  user = users_collection.find_one({"email": email.email})
  # Again, add this logout event to the actions collection.
  generic_action(action_log(email=user.get("email"), action="USER_LOGOUT"))




# --- Expense related endpoints ---
#
# - Get Function
# Returns an array of records (objects) located in the Database that match the current user's email.
@app.get("/expenditure")
async def db_get_expenditure(current_user_email: str = Depends(get_user_email)):
  return expenses_collection.find({"email_id": current_user_email}, {"_id": 0}).to_list()
  # Exclude the autogenerated "_id" field in mongo db.


# - Add function
# Adds a record from submitForm into the database. Treated as a dict in python.
# Associate this expense item with the current user.
@app.post("/expenditure")
async def db_create_expense(expense: dict, current_user_email: str = Depends(get_user_email)):
  expense["email_id"] = current_user_email # associate the input "email_id" with that from the decoded jwt.
  result = expenses_collection.insert_one(expense)
  id = result.inserted_id
  # Add this add expense event to the actions collection. 
  expense_action(action_log(email=current_user_email, action="ADD_EXPENSE"), expense["title"])
  return {"id": str(id)}


# - Delete function
# Remove a record from the database. Called by deleteExpenditure.
@app.delete("/expenditure/{expenditure_id}")
async def db_delete_expense(expenditure_id: str, current_user_email: str = Depends(get_user_email)):
  # Used to store the title of what is being deleted for event logging later...
  expense_item = expenses_collection.find_one({"id": expenditure_id, "email_id": current_user_email})

  # Delete the expense item, according to the id and current user's email.
  status = expenses_collection.delete_one({"id": expenditure_id, "email_id": current_user_email})
  if status.deleted_count == 1: # If a record has been successfully deleted...
    expense_action(action_log(email=current_user_email, action="DELETE_EXPENSE"), expense_item.get("title"))
    return {"message": f"[Delete] Item with id {expenditure_id} deleted"}
  else:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail=f"Item with id {expenditure_id} not found",
    )




# --- Actions ---
#
# Action endpoint return the list of all recorded events from the collection.
@app.get("/actions")
async def db_get_actions():
  return actions_collection.find({}, {"_id": 0}).to_list()

# Structure the basics of the action log. An action log MUST contain the email and the action being completed.
# We will set the date and time when the event is logged to the database.
class action_log(BaseModel):
  email: str
  action: str
  
# Default event logging to the database - used for login and logout events.
def generic_action(log: action_log):
  actions_collection.insert_one(
    {
      "user": log.email,
      "action": log.action,
      "time": datetime.now()
    }
  )

# Expense specific events - used when adding or deleting an expense.
# Do not include when fetching, as this will completely clutter the action collection.
def expense_action(log: action_log, expense: str):
  actions_collection.insert_one(
    {
      "user": log.email,
      "action": log.action,
      "time": datetime.now(),
      "description": expense
    }
  )