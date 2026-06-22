import re
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from backend.core.config import settings
import logging
import certifi

logger = logging.getLogger("DATABASE")


def _mask_url(url: str) -> str:
    """Mask credentials in MongoDB connection string for safe logging."""
    return re.sub(r"://([^:]+):([^@]+)@", r"://***:***@", url)

client = None
db = None

def connect_to_mongo():
    """Connect to MongoDB with proper error handling and verification."""
    global client, db
    try:
        logger.info(f"Connecting to MongoDB at: {_mask_url(settings.MONGODB_URL)}")
        client = MongoClient(
            settings.MONGODB_URL,
            server_api=ServerApi('1'),
            tlsCAFile=certifi.where()
        )
        
        # Verify connection with a ping
        client.admin.command('ping')
        
        db = client[settings.DATABASE_NAME]
        
        # Ensure collections exist
        existing_collections = db.list_collection_names()
        required_collections = ["users", "analysis", "roadmaps"]
        for col in required_collections:
            if col not in existing_collections:
                db.create_collection(col)
                logger.info(f"  📦 Created collection: {col}")
        
        # Create indexes
        db.users.create_index("email", unique=True)
        db.analysis.create_index("user_email")
        db.roadmaps.create_index("user_email")
        
        logger.info(f"✅ Connected to MongoDB: {_mask_url(settings.MONGODB_URL)}")
        logger.info(f"  📂 Database: {settings.DATABASE_NAME}")
        logger.info(f"  📦 Collections: {db.list_collection_names()}")
        
    except Exception as e:
        logger.error(f"❌ MongoDB connection FAILED: {e}")
        logger.warning("⚠️ App will run without database persistence. Data will not be saved.")
        client = None
        db = None

def close_mongo_connection():
    """Close MongoDB connection gracefully."""
    global client
    if client is not None:
        client.close()
        logger.info("🔌 Closed MongoDB connection")

def get_database():
    """Get database instance. Returns None if not connected."""
    if db is None:
        logger.warning("⚠️ Database not available — MongoDB may not be running")
    return db
