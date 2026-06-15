"""账户：风格偏好 + 微信公众号绑定。"""
from __future__ import annotations

from fastapi import APIRouter, Depends

from ..models import AccountState, StylePrefs, WeChatBinding
from ..security import encrypt
from ..store import STORE
from . import current_user

router = APIRouter(prefix="/api/account", tags=["account"])


def _state(user_id: str) -> AccountState:
    a = STORE.account(user_id)
    return AccountState(
        account_name=a.account_name,
        writing_persona=a.writing_persona,
        theme=a.theme,
        audience=a.audience,
        tone=a.tone,
        wechat_bound=a.wechat_bound,
        wechat_author=a.wechat_author,
    )


@router.get("", response_model=AccountState)
def get_account(user_id: str = Depends(current_user)) -> AccountState:
    return _state(user_id)


@router.put("/style", response_model=AccountState)
def update_style(prefs: StylePrefs, user_id: str = Depends(current_user)) -> AccountState:
    a = STORE.account(user_id)
    a.account_name = prefs.account_name
    a.writing_persona = prefs.writing_persona
    a.theme = prefs.theme
    a.audience = prefs.audience
    a.tone = prefs.tone
    return _state(user_id)


@router.put("/wechat", response_model=AccountState)
def bind_wechat(binding: WeChatBinding, user_id: str = Depends(current_user)) -> AccountState:
    a = STORE.account(user_id)
    a.wechat_appid_enc = encrypt(binding.appid)
    a.wechat_secret_enc = encrypt(binding.secret)
    a.wechat_author = binding.author
    return _state(user_id)


@router.delete("/wechat", response_model=AccountState)
def unbind_wechat(user_id: str = Depends(current_user)) -> AccountState:
    a = STORE.account(user_id)
    a.wechat_appid_enc = None
    a.wechat_secret_enc = None
    a.wechat_author = ""
    return _state(user_id)
