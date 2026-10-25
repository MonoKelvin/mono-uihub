"""Minimal MCP client for Streamable HTTP servers.

Only what Storyset needs: initialize → tools/list → tools/call. No SDK, no
websocket, no stdio. SSE and plain JSON responses are both supported, and the
``mcp-session-id`` header is carried across requests.

Why not vendor the official SDK? It pulls in pydantic/httpx and a build step for
a single read-only remote server. The protocol surface we use is three methods.
"""

from __future__ import annotations

import json
from typing import Any, Mapping

from . import http

PROTOCOL_VERSION = "2025-06-18"


class MCPError(RuntimeError):
    pass


def _header(headers: Mapping[str, str], name: str) -> str:
    for key, value in headers.items():
        if key.lower() == name.lower():
            return value
    return ""


def _parse_sse(raw: str) -> list[dict[str, Any]]:
    events: list[str] = []
    data: list[str] = []
    for line in raw.splitlines():
        if line.startswith("data:"):
            data.append(line[5:].lstrip())
        elif not line.strip() and data:
            events.append("\n".join(data))
            data = []
    if data:
        events.append("\n".join(data))
    parsed: list[dict[str, Any]] = []
    for event in events:
        try:
            value = json.loads(event)
        except ValueError:
            continue
        if isinstance(value, dict):
            parsed.append(value)
    return parsed


class MCPClient:
    def __init__(
        self,
        url: str,
        *,
        timeout: float = 45.0,
        headers: Mapping[str, str] | None = None,
        client_name: str = "resource-getter",
    ) -> None:
        self.url = url
        self.timeout = timeout
        self.headers = dict(headers or {})
        self.client_name = client_name
        self.session_id = ""
        self.ready = False
        self._next_id = 1

    # -- transport ---------------------------------------------------------
    def _post(self, payload: dict[str, Any]) -> list[dict[str, Any]]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "MCP-Protocol-Version": PROTOCOL_VERSION,
            **self.headers,
        }
        if self.session_id:
            headers["mcp-session-id"] = self.session_id
        resp = http.request(
            self.url,
            method="POST",
            headers=headers,
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            timeout=self.timeout,
            retries=0,
        )
        sid = _header(resp.headers, "mcp-session-id")
        if sid:
            self.session_id = sid
        ctype = resp.content_type
        if ctype == "text/event-stream":
            return _parse_sse(resp.text)
        if not resp.body.strip():
            return []
        try:
            value = resp.json()
        except ValueError as exc:
            raise MCPError(f"MCP 返回无法解析：{resp.text[:200]}") from exc
        return value if isinstance(value, list) else [value]

    @staticmethod
    def _pick(messages: list[dict[str, Any]], request_id: int) -> dict[str, Any]:
        for message in messages:
            if message.get("id") == request_id:
                return message
        if messages:
            return messages[-1]
        raise MCPError("MCP 无响应")

    # -- protocol ----------------------------------------------------------
    def initialize(self) -> dict[str, Any]:
        request_id = self._next_id
        self._next_id += 1
        messages = self._post(
            {
                "jsonrpc": "2.0",
                "id": request_id,
                "method": "initialize",
                "params": {
                    "protocolVersion": PROTOCOL_VERSION,
                    "capabilities": {},
                    "clientInfo": {"name": self.client_name, "version": "1.0"},
                },
            }
        )
        message = self._pick(messages, request_id)
        if "error" in message:
            raise MCPError(f"MCP initialize 失败：{message['error']}")
        # The spec requires this notification before any other request.
        try:
            self._post({"jsonrpc": "2.0", "method": "notifications/initialized"})
        except http.HttpError:
            pass
        self.ready = True
        return message.get("result", {})

    def _ensure(self) -> None:
        if not self.ready:
            self.initialize()

    def list_tools(self) -> list[dict[str, Any]]:
        self._ensure()
        request_id = self._next_id
        self._next_id += 1
        message = self._pick(
            self._post({"jsonrpc": "2.0", "id": request_id, "method": "tools/list", "params": {}}),
            request_id,
        )
        if "error" in message:
            raise MCPError(f"MCP tools/list 失败：{message['error']}")
        return message.get("result", {}).get("tools", [])

    def call(self, name: str, arguments: dict[str, Any] | None = None) -> Any:
        self._ensure()
        request_id = self._next_id
        self._next_id += 1
        message = self._pick(
            self._post(
                {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "method": "tools/call",
                    "params": {"name": name, "arguments": arguments or {}},
                }
            ),
            request_id,
        )
        if "error" in message:
            raise MCPError(f"MCP tools/call {name} 失败：{message['error']}")
        result = message.get("result", {})
        if result.get("isError"):
            text = " ".join(
                item.get("text", "") for item in result.get("content", []) if item.get("type") == "text"
            )
            raise MCPError(f"MCP 工具 {name} 报错：{text[:300]}")
        if "structuredContent" in result:
            return result["structuredContent"]
        texts = [
            item.get("text", "")
            for item in result.get("content", [])
            if item.get("type") == "text"
        ]
        raw = "\n".join(texts).strip()
        if not raw:
            return {}
        try:
            return json.loads(raw)
        except ValueError:
            return raw

    def close(self) -> None:
        if not self.session_id:
            return
        try:
            http.request(
                self.url,
                method="DELETE",
                headers={
                    "mcp-session-id": self.session_id,
                    "MCP-Protocol-Version": PROTOCOL_VERSION,
                },
                timeout=10,
                retries=0,
            )
        except http.HttpError:
            pass
        finally:
            self.session_id = ""
            self.ready = False

    def __enter__(self) -> "MCPClient":
        self.initialize()
        return self

    def __exit__(self, *_: Any) -> None:
        self.close()
