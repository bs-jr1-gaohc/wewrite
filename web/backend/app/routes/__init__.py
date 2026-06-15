"""HTTP 路由：身份依赖 + 子路由。"""
from __future__ import annotations

from fastapi import Header


def current_user(x_user_id: str | None = Header(default=None)) -> str:
    """MVP：用 X-User-Id 头标识用户，缺省为 'default'。

    NOTE(生产): 替换为真正的会话/鉴权（OAuth、邮箱登录等）。
    """
    return (x_user_id or "default").strip() or "default"
