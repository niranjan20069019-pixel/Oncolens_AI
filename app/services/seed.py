from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import hash_password
from app.database.crud import create_user, get_user_by_email
from app.database.models import UserRole
from app.utils.logging import get_logger

logger = get_logger(__name__)

DEFAULT_USERS = [
    ("admin@oncolens.ai", "admin123", "System Administrator", UserRole.ADMIN),
    ("doctor@oncolens.ai", "doctor123", "Clinical Doctor", UserRole.DOCTOR),
]


async def seed_default_users(db: AsyncSession) -> None:
    for email, password, name, role in DEFAULT_USERS:
        existing = await get_user_by_email(db, email)
        if existing is None:
            await create_user(db, email, hash_password(password), name, role)
            logger.info("Seeded user %s (%s)", email, role.value)
