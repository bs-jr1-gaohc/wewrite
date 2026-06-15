"""微信凭证的对称加密 —— 不以明文存储 appid/secret。"""
from __future__ import annotations

import base64
import hashlib

from cryptography.fernet import Fernet, InvalidToken

from .config import get_settings


def _fernet() -> Fernet:
    key = get_settings().app_secret_key
    if not key:
        # 未配置时派生一个进程内临时 key —— 仅用于本地起步，重启即失效。
        # 生产必须设置 APP_SECRET_KEY。
        key = base64.urlsafe_b64encode(hashlib.sha256(b"wewrite-dev-insecure").digest()).decode()
    try:
        return Fernet(key.encode() if isinstance(key, str) else key)
    except ValueError:
        # 给的不是合法 Fernet key（32 字节 urlsafe base64），派生一个。
        derived = base64.urlsafe_b64encode(hashlib.sha256(key.encode()).digest())
        return Fernet(derived)


def encrypt(plaintext: str) -> str:
    return _fernet().encrypt(plaintext.encode()).decode()


def decrypt(token: str) -> str:
    try:
        return _fernet().decrypt(token.encode()).decode()
    except InvalidToken as exc:  # pragma: no cover - 配置错误时给出清晰信号
        raise ValueError("无法解密凭证：APP_SECRET_KEY 可能已变更") from exc
