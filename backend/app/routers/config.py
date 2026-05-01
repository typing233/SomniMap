from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import User, UserConfig
from app.schemas import UserConfigUpdate, UserConfigResponse, ConnectionTestRequest
from app.routers.auth import get_current_user
from app.services.volcanic_service import (
    VolcanicArkService, 
    DEFAULT_VOLCANIC_BASE_URL,
    DEFAULT_VOLCANIC_MODEL
)

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
            volcanic_model_name=DEFAULT_VOLCANIC_MODEL,
            volcanic_base_url=DEFAULT_VOLCANIC_BASE_URL,
            privacy_mode="standard"
        )
        db.add(config)
        db.commit()
        db.refresh(config)
    
    return UserConfigResponse(
        id=config.id,
        user_id=config.user_id,
        volcanic_model_name=config.volcanic_model_name or DEFAULT_VOLCANIC_MODEL,
        volcanic_base_url=config.volcanic_base_url,
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
    
    if config_data.volcanic_base_url is not None:
        config.volcanic_base_url = config_data.volcanic_base_url
    
    if config_data.privacy_mode is not None:
        config.privacy_mode = config_data.privacy_mode
    
    db.commit()
    db.refresh(config)
    
    return UserConfigResponse(
        id=config.id,
        user_id=config.user_id,
        volcanic_model_name=config.volcanic_model_name or DEFAULT_VOLCANIC_MODEL,
        volcanic_base_url=config.volcanic_base_url,
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
        model_name=config.volcanic_model_name or DEFAULT_VOLCANIC_MODEL,
        base_url=config.volcanic_base_url
    )
    
    is_valid = await service.validate_api_key()
    
    return {
        "valid": is_valid,
        "message": "API Key验证成功" if is_valid else "API Key验证失败，请检查Key是否正确"
    }


@router.post("/test-connection")
async def test_connection(
    test_data: ConnectionTestRequest,
    current_user: User = Depends(get_current_user)
):
    if not test_data.api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="请输入API Key"
        )
    
    base_url = test_data.base_url or DEFAULT_VOLCANIC_BASE_URL
    
    try:
        service = VolcanicArkService(
            api_key=test_data.api_key,
            model_name=test_data.model_name,
            base_url=base_url
        )
        
        is_valid = await service.validate_api_key()
        
        return {
            "valid": is_valid,
            "message": (
                f"连接成功！已成功连接到 {base_url}" 
                if is_valid 
                else "连接失败，请检查 API Key、模型名称和 Base URL 是否正确"
            ),
            "base_url": base_url,
            "model": test_data.model_name
        }
        
    except Exception as e:
        return {
            "valid": False,
            "message": f"连接失败: {str(e)}",
            "base_url": base_url,
            "model": test_data.model_name
        }
