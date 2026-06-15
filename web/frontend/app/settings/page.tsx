"use client";

import { useEffect, useState } from "react";
import {
  AccountState,
  CatalogItem,
  bindWeChat,
  getAccount,
  getPersonas,
  getThemes,
  saveStyle,
  unbindWeChat,
} from "@/lib/api";

export default function SettingsPage() {
  const [account, setAccount] = useState<AccountState | null>(null);
  const [personas, setPersonas] = useState<CatalogItem[]>([]);
  const [themes, setThemes] = useState<CatalogItem[]>([]);
  const [msg, setMsg] = useState("");

  // style form
  const [accountName, setAccountName] = useState("");
  const [persona, setPersona] = useState("midnight-friend");
  const [theme, setTheme] = useState("professional-clean");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");

  // wechat form
  const [appid, setAppid] = useState("");
  const [secret, setSecret] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    getPersonas().then(setPersonas).catch(() => {});
    getThemes().then(setThemes).catch(() => {});
    getAccount()
      .then((a) => {
        setAccount(a);
        setAccountName(a.account_name);
        setPersona(a.writing_persona);
        setTheme(a.theme);
        setAudience(a.audience);
        setTone(a.tone);
        setAuthor(a.wechat_author);
      })
      .catch(() => {});
  }, []);

  async function onSaveStyle() {
    setMsg("");
    try {
      const a = await saveStyle({
        account_name: accountName,
        writing_persona: persona,
        theme,
        audience,
        tone,
      });
      setAccount(a);
      setMsg("风格已保存 ✓");
    } catch (e) {
      setMsg("保存失败：" + String(e));
    }
  }

  async function onBind() {
    setMsg("");
    try {
      const a = await bindWeChat({ appid, secret, author });
      setAccount(a);
      setAppid("");
      setSecret("");
      setMsg("公众号已绑定 ✓（appid/secret 已加密存储）");
    } catch (e) {
      setMsg("绑定失败：" + String(e));
    }
  }

  async function onUnbind() {
    setMsg("");
    try {
      const a = await unbindWeChat();
      setAccount(a);
      setMsg("已解绑公众号");
    } catch (e) {
      setMsg("解绑失败：" + String(e));
    }
  }

  return (
    <>
      <h1>设置</h1>
      <p className="sub">配置一次，之后每篇文章自动沿用。</p>
      {msg && <p className="ok">{msg}</p>}

      <div className="panel">
        <h2>公众号风格</h2>
        <div className="row">
          <div>
            <label>公众号名称</label>
            <input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
          </div>
          <div>
            <label>写作人格</label>
            <select value={persona} onChange={(e) => setPersona(e.target.value)}>
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} — {p.description}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="row">
          <div>
            <label>默认排版主题</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id}
                  {t.description ? `（${t.description}）` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>目标读者（可选）</label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="如：关注 AI 的产品经理"
            />
          </div>
        </div>
        <label>语气补充（可选）</label>
        <input
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          placeholder="如：专业但不端着，多用具体例子"
        />
        <div style={{ marginTop: 16 }}>
          <button className="btn" onClick={onSaveStyle}>
            保存风格
          </button>
        </div>
      </div>

      <div className="panel">
        <h2>
          微信公众号绑定{" "}
          {account?.wechat_bound ? (
            <span className="badge done">已绑定</span>
          ) : (
            <span className="badge">未绑定</span>
          )}
        </h2>
        <p className="hint">
          推送到<strong>你自己的</strong>公众号草稿箱需要你自己的 appid/secret —— 这是平台无法代为提供的唯一一项。
          其余（LLM、AI 配图）均由平台统一承担，你无需任何配置。凭证将<strong>加密存储</strong>，仅在生成时临时注入。
        </p>
        {account?.wechat_bound ? (
          <div>
            <p>
              当前署名：<span className="ok">{account.wechat_author || "（未设置）"}</span>
            </p>
            <button className="btn danger" onClick={onUnbind}>
              解绑公众号
            </button>
          </div>
        ) : (
          <>
            <div className="row">
              <div>
                <label>AppID</label>
                <input value={appid} onChange={(e) => setAppid(e.target.value)} placeholder="wx..." />
              </div>
              <div>
                <label>AppSecret</label>
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <label>默认署名（可选）</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} />
            <div style={{ marginTop: 16 }}>
              <button className="btn" onClick={onBind} disabled={!appid || !secret}>
                绑定公众号
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
