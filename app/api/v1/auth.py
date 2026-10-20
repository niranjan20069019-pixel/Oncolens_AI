from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.jwt import create_access_token, hash_password, verify_password
from app.database.crud import create_user, get_user_by_email
from app.database.models import User, UserRole
from app.database.session import get_db
from app.models.schemas import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])

REGISTERABLE_ROLES = {
    "doctor": UserRole.DOCTOR,
    "patient": UserRole.PATIENT,
    "user": UserRole.PATIENT,
}
MIN_PASSWORD_LENGTH = 6


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    user = await get_user_by_email(db, body.email)
    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(user.email, user.role.value)
    return TokenResponse(access_token=token, role=user.role.value, email=user.email)


@router.get("/me")
async def me(user: User = Depends(get_current_user)) -> dict:
    return {"email": user.email, "role": user.role.value, "full_name": user.full_name}


@router.post("/register", response_model=TokenResponse)
async def register(
    body: LoginRequest,
    full_name: str = "New User",
    role: str = "doctor",
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    if len(body.password) < MIN_PASSWORD_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Password must be at least {MIN_PASSWORD_LENGTH} characters",
        )
    user_role = REGISTERABLE_ROLES.get(role.strip().lower())
    if user_role is None:
        raise HTTPException(status_code=400, detail="role must be 'doctor' or 'patient'")
    if await get_user_by_email(db, body.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = await create_user(db, body.email, hash_password(body.password), full_name, user_role)
    token = create_access_token(user.email, user.role.value)
    return TokenResponse(access_token=token, role=user.role.value, email=user.email)
