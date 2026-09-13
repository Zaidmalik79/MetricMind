from sqlalchemy import create_engine

from backend.config.config import DATABASE_URL
from backend.utils.logger import logger

logger.info("Creating database engine...")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

logger.info("Database engine created successfully.")