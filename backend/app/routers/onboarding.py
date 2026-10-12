from typing import List, Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.models import User, DisabilityProfile
from app.schemas.schemas import (
    OnboardingRequest,
    TokenResponse,
    UserProfileFull,
    DisabilityProfileUpdate,
    DisabilityProfileCreate,
)
from app.core.security import get_password_hash, create_access_token
from app.routers.auth import get_current_user

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


@router.post("/register", response_model=TokenResponse)
def register_onboarding(req: OnboardingRequest, db: Session = Depends(get_db)):
    """Create user and disability profiles in one call, return auth token."""
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    hashed_pw = get_password_hash(req.password)
    allowed_role = req.role if req.role in ["student", "adult_learner", "teacher", "coordinator", "admin"] else "student"

    new_user = User(
        email=req.email.lower(),
        hashed_password=hashed_pw,
        full_name=req.full_name,
        role=allowed_role,
        onboarding_completed=True,
    )
    db.add(new_user)
    db.flush()

    for d in req.disabilities:
        profile = DisabilityProfile(
            user_id=new_user.id,
            disability_type=d.disability_type,
            severity=d.severity,
            preferences_json=d.preferences_json,
        )
        db.add(profile)

    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.id, "role": new_user.role, "email": new_user.email})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=new_user.role,
        user_id=new_user.id,
        full_name=new_user.full_name,
        school_id=new_user.school_id,
    )


@router.get("/profile", response_model=UserProfileFull)
def get_onboarding_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get full profile with disabilities for authenticated user."""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/profile", response_model=UserProfileFull)
def update_onboarding_profile(
    profile_in: Union[DisabilityProfileUpdate, List[DisabilityProfileCreate]],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update disability profile for authenticated user."""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if isinstance(profile_in, list):
        disabilities_to_set = profile_in
        user.onboarding_completed = True
    else:
        if profile_in.full_name is not None:
            user.full_name = profile_in.full_name
        if profile_in.onboarding_completed is not None:
            user.onboarding_completed = profile_in.onboarding_completed
        else:
            user.onboarding_completed = True
        disabilities_to_set = profile_in.disabilities

    if disabilities_to_set is not None:
        db.query(DisabilityProfile).filter(DisabilityProfile.user_id == user.id).delete()
        for d in disabilities_to_set:
            profile = DisabilityProfile(
                user_id=user.id,
                disability_type=d.disability_type,
                severity=d.severity,
                preferences_json=d.preferences_json,
            )
            db.add(profile)

    db.commit()
    db.refresh(user)
    return user
