from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import User, UserConfig
from app.schemas import UserConfigUpdate, UserConfigResponse
from app.routers.auth import get_current_user
from app.services.volcanic_service import VolcanicArkService

router = APIRouter(prefix="/api/config", tags=["config"])


@router.get("/", response_model=UserConfigResponse)
async def get_config(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    config = db.query(UserConfig).filter(UserConfig.user_id == current_user.id).first()
    
    if not config:
        config = UserConfig(
            user_id=current_user.id,
            volcanic_model_name="doubao-pro-32k",
            privacy_mode="standard"
        )
        db.add(config)
        db.commit()
        db.refresh(config)
    
    return UserConfigResponse(
        id=config.id,
        user_id=config.user_id,
        volcanic_model_name=config.volcanic_model_name,
        privacy_mode=config.privacy_mode,
        has_api_key=bool(config.volcanic_api_key)
    )


@router.put("/", response_model=UserConfigResponse)
async def update_config(
    config_data: UserConfigUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    config = db.query(UserConfig).filter(UserConfig.user_id == current_user.id).first()
    
    if not config:
        config = UserConfig(user_id=current_user.id)
        db.add(config)
    
    if config_data.volcanic_api_key is not None:
        config.volcanic_api_key = config_data.volcanic_api_key
    
    if config_data.volcanic_model_name is not None:
        config.volcanic_model_name = config_data.volcanic_model_name
    
    if config_data.privacy_mode is not None:
        config.privacy_mode = config_data.privacy_mode
    
    db.commit()
    db.refresh(config)
    
    return UserConfigResponse(
        id=config.id,
        user_id=config.user_id,
        volcanic_model_name=config.volcanic_model_name,
        privacy_mode=config.privacy_mode,
        has_api_key=bool(config.volcanic_api_key)
    )


@router.post("/validate-api-key")
async def validate_api_key(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    config = db.query(UserConfig).filter(UserConfig.user_id == current_user.id).first()
    
    if not config or not config.volcanic_api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="未配置API Key"
        )
    
    service = VolcanicArkService(
        api_key=config.volcanic_api_key,
        model_name=config.volcanic_model_name or "doubao-pro-32k"
    )
    
    is_valid = await service.validate_api_key()
    
    return {
        "valid": is_valid,
        "message": "API Key验证成功" if is_valid else "API Key验证失败，请检查Key是否正确"
    }
