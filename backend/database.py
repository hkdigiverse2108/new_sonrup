from motor.motor_asyncio import AsyncIOMotorClient
from backend.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

def get_database():
    return db_instance.db

async def connect_to_mongo():
    db_instance.client = AsyncIOMotorClient(settings.mongodb_url)
    db_instance.db = db_instance.client[settings.database_name]
    print(f"Connected to MongoDB: database '{settings.database_name}'")

async def close_mongo_connection():
    if db_instance.client:
        db_instance.client.close()
        print("Closed MongoDB connection")
