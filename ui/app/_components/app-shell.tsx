"use client";

import {
  CheckCircle2,
  Database,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  ShieldCheck,
  TerminalSquare
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { getItems, postCustomApi, upsertItem } from "../_lib/pleasanter-client";
import type { PleasanterItem } from "../_lib/pleasanter-client";
import { loadRuntimeConfig } from "../_lib/runtime-config";
import type { RuntimeConfig } from "../_lib/runtime-config";

type LoadState = "idle" | "loading" | "success" | "error";

const siteIdStorageKey = "pleasanter-quickstart:site-id";

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function recordSummary(record: PleasanterItem) {
  const classHash = record.ClassHash ?? {};
  const firstClass = Object.entries(classHash)[0];

  if (!firstClass) {
    return "分類なし";
  }

  return `${firstClass[0]}: ${firstClass[1] ?? ""}`;
}

export function AppShell() {
  const [config, setConfig] = useState<RuntimeConfig | null>(null);
  const [configState, setConfigState] = useState<LoadState>("loading");
  const [siteId, setSiteId] = useState("");
  const [queryText, setQueryText] = useState("");
  const [records, setRecords] = useState<PleasanterItem[]>([]);
  const [recordState, setRecordState] = useState<LoadState>("idle");
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [keyField, setKeyField] = useState("ClassA");
  const [keyValue, setKeyValue] = useState("");
  const [description, setDescription] = useState("");
  const [customPath, setCustomPath] = useState("/api/items/{siteId}/get");
  const [customBody, setCustomBody] = useState("{\n  \"View\": {}\n}");
  const [customResult, setCustomResult] = useState("");

  useEffect(() => {
    setSiteId(localStorage.getItem(siteIdStorageKey) ?? "");

    loadRuntimeConfig()
      .then((loadedConfig) => {
        setConfig(loadedConfig);
        setConfigState("success");
      })
      .catch((error: unknown) => {
        setConfigState("error");
        setMessage(error instanceof Error ? error.message : String(error));
      });
  }, []);

  useEffect(() => {
    if (siteId) {
      localStorage.setItem(siteIdStorageKey, siteId);
    }
  }, [siteId]);

  const canUseApi = Boolean(config?.apiKey && siteId);
  const apiKeyLabel = useMemo(() => {
    if (!config?.apiKey) {
      return "未取得";
    }

    return `${config.apiKey.slice(0, 6)}...${config.apiKey.slice(-4)}`;
  }, [config?.apiKey]);

  async function handleLoadRecords() {
    if (!config || !siteId) {
      setMessage("サイトIDを入力してください。");
      return;
    }

    setRecordState("loading");
    setMessage("");

    try {
      const response = await getItems(config, siteId, queryText);
      const data = response.Response?.Data ?? [];
      setRecords(data);
      setRecordState("success");
      setMessage(`${data.length}件のレコードを取得しました。`);
    } catch (error) {
      setRecordState("error");
      setMessage(error instanceof Error ? error.message : String(error));
    }
  }

  async function handleUpsert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!config || !siteId || !title) {
      setMessage("サイトIDとタイトルを入力してください。");
      return;
    }

    setMessage("");

    try {
      const response = await upsertItem(config, siteId, {
        Title: title,
        ...(body ? { Body: body } : {}),
        ...(keyValue
          ? {
              Keys: [keyField],
              ClassHash: {
                [keyField]: keyValue
              }
            }
          : {}),
        ...(description
          ? {
              DescriptionHash: {
                DescriptionA: description
              }
            }
          : {})
      });

      setMessage(response.Message ?? "レコードを保存しました。");
      setTitle("");
      setBody("");
      setDescription("");
      await handleLoadRecords();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  }

  async function handleCustomApi() {
    if (!config || !siteId) {
      setMessage("サイトIDを入力してください。");
      return;
    }

    setMessage("");

    try {
      const parsedBody = JSON.parse(customBody) as Record<string, unknown>;
      const result = await postCustomApi(
        config,
        customPath.replace("{siteId}", siteId),
        parsedBody
      );
      setCustomResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setCustomResult("");
      setMessage(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Pleasanter as persistence</p>
          <h1>Pleasanter Quickstart UI</h1>
        </div>
        <div className="status-strip" aria-label="接続状態">
          <span className={`status-pill ${config?.apiKey ? "ok" : "warn"}`}>
            <ShieldCheck aria-hidden="true" />
            API Key {apiKeyLabel}
          </span>
          <span className="status-pill">
            <Database aria-hidden="true" />
            {config?.pleasanterApiBasePath ?? "/pleasanter"}
          </span>
        </div>
      </section>

      <section className="workspace">
        <aside className="side-panel" aria-label="Pleasanter 接続設定">
          <div className="panel-heading">
            <h2>接続</h2>
            {configState === "loading" ? (
              <Loader2 className="spin" aria-hidden="true" />
            ) : (
              <CheckCircle2 aria-hidden="true" />
            )}
          </div>

          <label>
            サイトID
            <input
              inputMode="numeric"
              placeholder="例: 1"
              value={siteId}
              onChange={(event) => setSiteId(event.target.value)}
            />
          </label>

          <label>
            タイトル検索
            <input
              placeholder="部分一致で検索"
              value={queryText}
              onChange={(event) => setQueryText(event.target.value)}
            />
          </label>

          <button
            className="primary-button"
            type="button"
            disabled={!canUseApi || recordState === "loading"}
            onClick={handleLoadRecords}
          >
            {recordState === "loading" ? (
              <Loader2 className="spin" aria-hidden="true" />
            ) : (
              <RefreshCw aria-hidden="true" />
            )}
            レコード取得
          </button>

          {message ? <p className="message">{message}</p> : null}
        </aside>

        <section className="content-stack">
          <section className="records-section" aria-label="レコード一覧">
            <div className="section-heading">
              <h2>レコード</h2>
              <span>{records.length} 件</span>
            </div>

            <div className="record-list">
              {records.length ? (
                records.map((record) => (
                  <article
                    className="record-card"
                    key={`${record.SiteId ?? "site"}-${record.ResultId ?? record.Title}`}
                  >
                    <div>
                      <h3>{record.Title ?? "(no title)"}</h3>
                      <p>{recordSummary(record)}</p>
                    </div>
                    <dl>
                      <div>
                        <dt>ID</dt>
                        <dd>{record.ResultId ?? "-"}</dd>
                      </div>
                      <div>
                        <dt>更新</dt>
                        <dd>{formatDate(record.UpdatedTime)}</dd>
                      </div>
                    </dl>
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  <Database aria-hidden="true" />
                  <p>サイトIDを入力してレコードを取得してください。</p>
                </div>
              )}
            </div>
          </section>

          <section className="form-grid">
            <form className="tool-panel" onSubmit={handleUpsert}>
              <div className="section-heading">
                <h2>保存</h2>
                <Plus aria-hidden="true" />
              </div>

              <label>
                タイトル
                <input
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>

              <label>
                内容
                <textarea
                  rows={4}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                />
              </label>

              <div className="inline-fields">
                <label>
                  キー項目
                  <input
                    value={keyField}
                    onChange={(event) => setKeyField(event.target.value)}
                  />
                </label>
                <label>
                  キー値
                  <input
                    value={keyValue}
                    onChange={(event) => setKeyValue(event.target.value)}
                  />
                </label>
              </div>

              <label>
                DescriptionA
                <textarea
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>

              <button className="primary-button" type="submit" disabled={!canUseApi}>
                <Plus aria-hidden="true" />
                Upsert
              </button>
            </form>

            <section className="tool-panel" aria-label="任意API実行">
              <div className="section-heading">
                <h2>API Console</h2>
                <TerminalSquare aria-hidden="true" />
              </div>

              <label>
                Path
                <input
                  value={customPath}
                  onChange={(event) => setCustomPath(event.target.value)}
                />
              </label>

              <label>
                Body JSON
                <textarea
                  className="code-input"
                  rows={8}
                  value={customBody}
                  onChange={(event) => setCustomBody(event.target.value)}
                />
              </label>

              <button
                className="secondary-button"
                type="button"
                disabled={!canUseApi}
                onClick={handleCustomApi}
              >
                <Play aria-hidden="true" />
                POST
              </button>

              {customResult ? <pre>{customResult}</pre> : null}
            </section>
          </section>
        </section>
      </section>
    </main>
  );
}
