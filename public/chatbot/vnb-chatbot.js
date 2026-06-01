(function () {
  "use strict";

  var STYLE_ID = "vnb-chatbot-style-v1";
  var INSTANCE_COUNTER = { value: 0 };
  var INSTANCES = new Map();
  var WASM_ABORT_SENTINEL = {};

  var DEFAULTS = {
    id: "",
    target: "body",
    position: "bottom-right",
    zIndex: 2147483000,
    title: "AI Assistant",
    subtitle: "Online",
    placeholder: "Ask a question...",
    welcomeMessage: "Hi. How can I help you today?",
    systemPrompt: "You are a concise and helpful AI assistant.",
    maxHistoryMessages: 12,
    persistConversation: true,
    storageKey: "vnb-chatbot-history",
    retrieval: {
      enabled: true,
      topK: 3,
      chunkSize: 700,
      chunkOverlap: 100,
      minScore: 2
    },
    ingest: {
      auto: true,
      sources: []
    },
    inference: {
      mode: "local",
      fallbackToRemote: true,
      fallbackToLocal: false,
      fallbackToWasm: true
    },
    local: {
      moduleUrl: "https://esm.run/@mlc-ai/web-llm",
      model: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
      cacheBackend: "indexeddb",
      stream: true,
      temperature: 0.2,
      topP: 0.95,
      preloadOnInit: false
    },
    wasm: {
      moduleUrl: "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2",
      model: "onnx-community/Qwen2.5-0.5B-Instruct",
      dtype: "q4",
      device: "wasm",
      stream: true,
      temperature: 0.3,
      topP: 0.9,
      maxNewTokens: 256,
      preloadOnInit: false
    },
    transport: {
      provider: "openai",
      endpoint: "",
      apiKey: "",
      model: "gpt-4o-mini",
      headers: {},
      stream: true,
      requestBody: {}
    },
    theme: {
      accent: "#0f766e",
      accentHover: "#115e59",
      panelBg: "#ffffff",
      text: "#0f172a",
      muted: "#475569",
      border: "#dbe4ef",
      userBubbleBg: "#0f766e",
      userBubbleText: "#ffffff",
      botBubbleBg: "#f8fafc",
      botBubbleText: "#0f172a"
    },
    labels: {
      open: "Open chat",
      close: "Close chat",
      send: "Send",
      stop: "Stop",
      loading: "Thinking...",
      clear: "Clear"
    },
    adapter: null,
    onEvent: null,
    debug: false,
    autoInit: true
  };

  function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function deepMerge(base, override) {
    var output = Object.assign({}, base);
    if (!isObject(override)) {
      return output;
    }

    Object.keys(override).forEach(function (key) {
      var src = output[key];
      var next = override[key];
      if (isObject(src) && isObject(next)) {
        output[key] = deepMerge(src, next);
      } else {
        output[key] = next;
      }
    });

    return output;
  }

  function normalizeText(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function tokenize(text) {
    return normalizeText(text)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(function (part) {
        return part.length > 1;
      });
  }

  function chunkText(text, chunkSize, overlap) {
    var clean = normalizeText(text);
    if (!clean) {
      return [];
    }

    if (clean.length <= chunkSize) {
      return [clean];
    }

    var out = [];
    var step = Math.max(1, chunkSize - overlap);
    var i = 0;

    while (i < clean.length) {
      var piece = clean.slice(i, i + chunkSize).trim();
      if (piece) {
        out.push(piece);
      }
      i += step;
    }

    return out;
  }

  function createElement(tag, className, text) {
    var el = document.createElement(tag);
    if (className) {
      el.className = className;
    }
    if (typeof text === "string") {
      el.textContent = text;
    }
    return el;
  }

  function appendStyles(theme, zIndex) {
    var existing = document.getElementById(STYLE_ID);
    if (existing) {
      return;
    }

    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".vnbcb-root{position:fixed;z-index:" + zIndex + ";font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:" + theme.text + ";}",
      ".vnbcb-pos-bottom-right{right:20px;bottom:20px;}",
      ".vnbcb-pos-bottom-left{left:20px;bottom:20px;}",
      ".vnbcb-pos-inline .vnbcb-panel{display:flex;position:relative;width:100%;height:auto;min-height:500px;max-height:70vh;border-radius:12px;box-shadow:none;border:1px solid " + theme.border + ";}",
      ".vnbcb-pos-inline .vnbcb-launcher{display:none;}",
      ".vnbcb-pos-inline{position:relative;z-index:1;}",
      ".vnbcb-launcher{width:56px;height:56px;border:none;border-radius:999px;background:" + theme.accent + ";color:#fff;cursor:pointer;box-shadow:0 10px 24px rgba(2,6,23,.25);display:flex;align-items:center;justify-content:center;font-size:20px;}",
      ".vnbcb-launcher:hover{background:" + theme.accentHover + ";}",
      ".vnbcb-panel{width:min(92vw,380px);height:min(78vh,560px);background:" + theme.panelBg + ";border:1px solid " + theme.border + ";border-radius:16px;box-shadow:0 24px 48px rgba(2,6,23,.26);overflow:hidden;display:none;flex-direction:column;}",
      ".vnbcb-panel.open{display:flex;}",
      ".vnbcb-header{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:14px 14px 12px;background:#f8fafc;border-bottom:1px solid " + theme.border + ";}",
      ".vnbcb-title{margin:0;font-size:14px;font-weight:700;line-height:1.2;}",
      ".vnbcb-subtitle{margin:2px 0 0;color:" + theme.muted + ";font-size:12px;transition:color .2s;}",
      ".vnbcb-subtitle.loading{color:" + theme.accent + ";}",
      ".vnbcb-progress-wrap{width:100%;height:3px;background:" + theme.border + ";border-radius:2px;overflow:hidden;margin-top:4px;display:none;}",
      ".vnbcb-progress-wrap.active{display:block;}",
      ".vnbcb-progress-bar{height:100%;width:0%;background:" + theme.accent + ";border-radius:2px;transition:width .3s ease;}",
      ".vnbcb-progress-wrap.indeterminate .vnbcb-progress-bar{width:30%;animation:vnbcb-slide 1.2s ease-in-out infinite;}",
      "@keyframes vnbcb-slide{0%{transform:translateX(-100%)}50%{transform:translateX(200%)}100%{transform:translateX(-100%)}}",
      ".vnbcb-loading-card{align-self:center;text-align:center;padding:16px 20px;border-radius:12px;background:linear-gradient(135deg,#f0f9ff,#f0fdf4);border:1px solid " + theme.border + ";margin:12px 0;}",
      ".vnbcb-loading-card .vnbcb-loading-icon{font-size:24px;margin-bottom:8px;}",
      ".vnbcb-loading-card .vnbcb-loading-title{font-size:13px;font-weight:600;color:" + theme.text + ";margin-bottom:4px;}",
      ".vnbcb-loading-card .vnbcb-loading-detail{font-size:12px;color:" + theme.muted + ";}",
      ".vnbcb-pulse{animation:vnbcb-pulse 1.5s ease-in-out infinite;}",
      "@keyframes vnbcb-pulse{0%,100%{opacity:1}50%{opacity:.5}}",
      ".vnbcb-actions{display:flex;gap:8px;}",
      ".vnbcb-icon-btn{border:1px solid " + theme.border + ";background:#fff;border-radius:10px;padding:6px 8px;font-size:12px;cursor:pointer;color:" + theme.text + ";}",
      ".vnbcb-body{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#fff;}",
      ".vnbcb-msg{max-width:88%;padding:10px 12px;border-radius:12px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word;}",
      ".vnbcb-msg.user{align-self:flex-end;background:" + theme.userBubbleBg + ";color:" + theme.userBubbleText + ";}",
      ".vnbcb-msg.bot{align-self:flex-start;background:" + theme.botBubbleBg + ";color:" + theme.botBubbleText + ";border:1px solid " + theme.border + ";}",
      ".vnbcb-msg.meta{align-self:center;background:transparent;color:" + theme.muted + ";font-size:12px;padding:0;}",
      ".vnbcb-footer{border-top:1px solid " + theme.border + ";padding:10px;display:flex;gap:8px;background:#f8fafc;}",
      ".vnbcb-input{flex:1;resize:none;min-height:40px;max-height:120px;border:1px solid " + theme.border + ";border-radius:10px;padding:10px 12px;font-size:14px;font-family:inherit;line-height:1.4;}",
      ".vnbcb-input:focus{outline:none;border-color:" + theme.accent + ";box-shadow:0 0 0 3px rgba(15,118,110,.15);}",
      ".vnbcb-send{border:none;border-radius:10px;padding:0 14px;background:" + theme.accent + ";color:#fff;font-weight:700;cursor:pointer;}",
      ".vnbcb-send:hover{background:" + theme.accentHover + ";}",
      ".vnbcb-send[disabled]{opacity:.5;cursor:not-allowed;}",
      ".vnbcb-stop{display:none;border:none;border-radius:10px;padding:0 14px;background:#dc2626;color:#fff;font-weight:700;cursor:pointer;}",
      ".vnbcb-stop:hover{background:#b91c1c;}",
      "@media (max-width:640px){.vnbcb-pos-bottom-right,.vnbcb-pos-bottom-left{left:12px;right:12px;bottom:12px}.vnbcb-panel{width:auto;height:min(78vh,560px)}}"
    ].join("");

    document.head.appendChild(style);
  }

  function Chatbot(config) {
    this.config = deepMerge(DEFAULTS, config || {});
    this.id = this.config.id || "vnb-chatbot-" + ++INSTANCE_COUNTER.value;
    this.history = [];
    this.ingestedChunks = [];
    this.state = {
      ready: false,
      open: false,
      sending: false
    };
    this.abortController = null;
    this.localEngine = null;
    this.webllmModule = null;
    this.wasmEngine = null;
    this.wasmTokenizer = null;
    this.transformersModule = null;
    this._caps = null;
    this.nodes = {};
  }

  Chatbot.prototype.emit = function (name, payload) {
    if (typeof this.config.onEvent === "function") {
      try {
        this.config.onEvent({ name: name, payload: payload || null, id: this.id });
      } catch (err) {
        if (this.config.debug) {
          console.error("onEvent failed", err);
        }
      }
    }
  };

  Chatbot.prototype.init = async function () {
    appendStyles(this.config.theme, this.config.zIndex);
    this.mount();
    this.restoreHistory();

    await this.probeWebGPUAdapter();

    var initialBackend = (this.getBackendOrder()[0]) || this.config.inference.mode;
    if (initialBackend === "local") {
      this.updateSubtitle("Runs locally in your browser");
    } else if (initialBackend === "wasm") {
      this.updateSubtitle("Local Lite · Private");
    } else if (initialBackend === "remote") {
      this.updateSubtitle("Remote mode");
    } else {
      this.updateSubtitle(this.config.subtitle || "Online");
    }

    if (this.config.welcomeMessage && this.history.length === 0) {
      this.pushMetaMessage(this.config.welcomeMessage);
    }

    if (this.config.ingest && this.config.ingest.auto && Array.isArray(this.config.ingest.sources)) {
      await this.ingestMany(this.config.ingest.sources);
    }

    if (this.config.local.preloadOnInit && this.shouldUseLocalFirst()) {
      try {
        await this.ensureLocalEngine();
      } catch (err) {
        if (this.config.debug) {
          console.warn("Local model preload failed", err);
        }
      }
    }

    this.state.ready = true;
    this.emit("ready", { ingestedChunks: this.ingestedChunks.length });
    return this;
  };

  Chatbot.prototype.mount = function () {
    var target = document.querySelector(this.config.target) || document.body;
    var posClass = this.config.position === "inline" ? "vnbcb-pos-inline" : (this.config.position === "bottom-left" ? "vnbcb-pos-bottom-left" : "vnbcb-pos-bottom-right");
    var root = createElement("div", "vnbcb-root " + posClass);
    root.setAttribute("data-vnb-chatbot-id", this.id);

    var panel = createElement("section", "vnbcb-panel");
    panel.setAttribute("aria-live", "polite");

    var header = createElement("header", "vnbcb-header");
    var heading = createElement("div", "vnbcb-heading");
    var title = createElement("h2", "vnbcb-title", this.config.title);
    var subtitle = createElement("p", "vnbcb-subtitle", this.config.subtitle);
    var progressWrap = createElement("div", "vnbcb-progress-wrap");
    var progressBar = createElement("div", "vnbcb-progress-bar");
    progressWrap.appendChild(progressBar);
    heading.appendChild(title);
    heading.appendChild(subtitle);
    heading.appendChild(progressWrap);

    var actions = createElement("div", "vnbcb-actions");
    var clearBtn = createElement("button", "vnbcb-icon-btn", this.config.labels.clear);
    clearBtn.type = "button";
    var closeBtn = createElement("button", "vnbcb-icon-btn", this.config.labels.close);
    closeBtn.type = "button";
    actions.appendChild(clearBtn);
    actions.appendChild(closeBtn);

    header.appendChild(heading);
    header.appendChild(actions);

    var body = createElement("div", "vnbcb-body");

    var footer = createElement("form", "vnbcb-footer");
    var input = createElement("textarea", "vnbcb-input");
    input.placeholder = this.config.placeholder;
    input.rows = 1;
    var send = createElement("button", "vnbcb-send", this.config.labels.send);
    send.type = "submit";
    var stop = createElement("button", "vnbcb-stop", this.config.labels.stop);
    stop.type = "button";

    footer.appendChild(input);
    footer.appendChild(send);
    footer.appendChild(stop);

    panel.appendChild(header);
    panel.appendChild(body);
    panel.appendChild(footer);

    var launcher = createElement("button", "vnbcb-launcher", "AI");
    launcher.type = "button";
    launcher.setAttribute("aria-label", this.config.labels.open);

    root.appendChild(panel);
    root.appendChild(launcher);
    target.appendChild(root);

    this.nodes = {
      root: root,
      panel: panel,
      body: body,
      footer: footer,
      input: input,
      send: send,
      stop: stop,
      launcher: launcher,
      closeBtn: closeBtn,
      clearBtn: clearBtn,
      subtitle: subtitle,
      progressWrap: progressWrap,
      progressBar: progressBar
    };

    this.bindEvents();
  };

  Chatbot.prototype.bindEvents = function () {
    var self = this;

    if (this.config.position !== "inline") {
      this.nodes.launcher.addEventListener("click", function () {
        self.toggle();
      });

      this.nodes.closeBtn.addEventListener("click", function () {
        self.close();
      });
    }

    this.nodes.clearBtn.addEventListener("click", function () {
      self.clearConversation();
    });

    this.nodes.stop.addEventListener("click", function () {
      if (self.abortController) {
        self.abortController.abort();
      }
    });

    this.nodes.footer.addEventListener("submit", function (event) {
      event.preventDefault();
      self.sendFromInput();
    });

    this.nodes.input.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        self.sendFromInput();
      }
    });

    this.nodes.input.addEventListener("input", function () {
      self.nodes.input.style.height = "auto";
      self.nodes.input.style.height = Math.min(self.nodes.input.scrollHeight, 120) + "px";
    });
  };

  Chatbot.prototype.pushMessage = function (role, content) {
    var el = createElement("div", "vnbcb-msg " + role, content);
    this.nodes.body.appendChild(el);
    this.nodes.body.scrollTop = this.nodes.body.scrollHeight;
    return el;
  };

  Chatbot.prototype.pushLoadingCard = function () {
    var card = createElement("div", "vnbcb-loading-card");
    var icon = createElement("div", "vnbcb-loading-icon vnbcb-pulse", "🧠");
    var title = createElement("div", "vnbcb-loading-title", "Loading AI model locally...");
    var detail = createElement("div", "vnbcb-loading-detail", "First time takes a moment to download. Runs privately in your browser.");
    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(detail);
    this.nodes.body.appendChild(card);
    this.nodes.body.scrollTop = this.nodes.body.scrollHeight;
    return card;
  };

  Chatbot.prototype.replaceWithBotMessage = function (el, text) {
    var msg = createElement("div", "vnbcb-msg bot", text);
    if (el && el.parentNode) {
      el.parentNode.replaceChild(msg, el);
    } else {
      this.nodes.body.appendChild(msg);
    }
    this.nodes.body.scrollTop = this.nodes.body.scrollHeight;
    return msg;
  };

  Chatbot.prototype.pushMetaMessage = function (text) {
    return this.pushMessage("meta", text);
  };

  Chatbot.prototype.updateSubtitle = function (text) {
    if (this.nodes.subtitle) {
      this.nodes.subtitle.textContent = text;
    }
  };

  Chatbot.prototype.open = function () {
    this.state.open = true;
    this.nodes.panel.classList.add("open");
    this.nodes.input.focus();
    this.emit("open");
  };

  Chatbot.prototype.close = function () {
    this.state.open = false;
    this.nodes.panel.classList.remove("open");
    this.emit("close");
  };

  Chatbot.prototype.toggle = function () {
    if (this.state.open) {
      this.close();
    } else {
      this.open();
    }
  };

  Chatbot.prototype.sendFromInput = function () {
    var text = this.nodes.input.value.trim();
    if (!text || this.state.sending) {
      return;
    }

    this.nodes.input.value = "";
    this.nodes.input.style.height = "auto";
    this.send(text);
  };

  Chatbot.prototype.setSending = function (value) {
    this.state.sending = value;
    this.nodes.send.disabled = value;
    this.nodes.send.style.display = value ? "none" : "";
    this.nodes.stop.style.display = value ? "block" : "none";
    this.nodes.input.disabled = value;
  };

  Chatbot.prototype.buildContext = function (query) {
    if (!this.config.retrieval.enabled || this.ingestedChunks.length === 0) {
      return [];
    }

    var queryTokens = tokenize(query);
    var scores = [];

    for (var i = 0; i < this.ingestedChunks.length; i += 1) {
      var chunk = this.ingestedChunks[i];
      var score = 0;
      for (var j = 0; j < queryTokens.length; j += 1) {
        var token = queryTokens[j];
        if (chunk.tokenMap[token]) {
          score += chunk.tokenMap[token];
        }
      }

      if (score >= this.config.retrieval.minScore) {
        scores.push({ score: score, chunk: chunk });
      }
    }

    scores.sort(function (a, b) {
      return b.score - a.score;
    });

    return scores.slice(0, this.config.retrieval.topK).map(function (entry) {
      return {
        source: entry.chunk.source,
        content: entry.chunk.text
      };
    });
  };

  Chatbot.prototype.toChatMessages = function (query, contexts) {
    var messages = [];

    var systemParts = [];
    if (this.config.systemPrompt) {
      systemParts.push(this.config.systemPrompt);
    }

    if (contexts.length > 0) {
      var contextLines = contexts
        .map(function (ctx, index) {
          var label = ctx.source && ctx.source.title ? ctx.source.title : "Source " + (index + 1);
          return "[" + label + "]\n" + ctx.content;
        })
        .join("\n\n");
      systemParts.push(
        "Use the context below when relevant. If context is not enough, say what is missing.\n\n" + contextLines
      );
    }

    if (systemParts.length > 0) {
      messages.push({ role: "system", content: systemParts.join("\n\n") });
    }

    var remembered = this.history.slice(-this.config.maxHistoryMessages);
    for (var i = 0; i < remembered.length; i += 1) {
      messages.push(remembered[i]);
    }

    messages.push({ role: "user", content: query });
    return messages;
  };

  Chatbot.prototype.send = async function (text) {
    var self = this;
    this.setSending(true);
    this.pushMessage("user", text);

    var isFirstLoad = !this.localEngine && this.shouldUseLocalFirst();
    var botEl;
    if (isFirstLoad) {
      botEl = this.pushLoadingCard();
    } else {
      botEl = this.pushMessage("bot", this.config.labels.loading);
    }

    var contexts = this.buildContext(text);
    var requestMessages = this.toChatMessages(text, contexts);

    this.abortController = new AbortController();
    this.emit("request", { text: text, contextCount: contexts.length });

    try {
      var reply = await this.generateReply(requestMessages, text, contexts, botEl);
      if (botEl && botEl.parentNode) {
        this.replaceWithBotMessage(botEl, reply);
      }
      this.history.push({ role: "user", content: text });
      this.history.push({ role: "assistant", content: reply });
      this.persistHistory();
      this.emit("response", { text: reply });
    } catch (err) {
      var message = err && err.message ? err.message : "Failed to generate a response.";
      this.replaceWithBotMessage(botEl, "Error: " + message);
      this.emit("error", { message: message });
      if (this.config.debug) {
        console.error(err);
      }
    } finally {
      this.setSending(false);
      this.nodes.input.focus();
    }
  };

  Chatbot.prototype.generateReply = async function (messages, query, contexts, botEl) {
    if (typeof this.config.adapter === "function") {
      var custom = await this.config.adapter({
        messages: messages,
        query: query,
        contexts: contexts,
        config: this.config,
        signal: this.abortController.signal
      });
      return normalizeText(custom || "");
    }

    var order = this.getBackendOrder();
    var errors = [];

    for (var i = 0; i < order.length; i += 1) {
      var backend = order[i];
      try {
        if (backend === "local") {
          return await this.getLocalResponse(messages, botEl);
        }

        if (backend === "wasm") {
          this.updateSubtitle("Local Lite · Private");
          return await this.getWasmResponse(messages, botEl);
        }

        if (backend === "remote") {
          this.updateSubtitle("Remote mode");
          return await this.getRemoteResponse(messages, botEl);
        }
      } catch (err) {
        errors.push(backend + ": " + (err && err.message ? err.message : "Unknown error"));
        this.emit("backend_error", {
          backend: backend,
          message: err && err.message ? err.message : "Unknown error"
        });
        if (this.config.debug) {
          console.warn("Backend failed", backend, err);
        }
      }
    }

    throw new Error(
      "No available backend. " + (errors.length ? errors.join(" | ") : "Configure local or remote transport.")
    );
  };

  Chatbot.prototype.getBackendOrder = function () {
    var mode = this.config.inference.mode;
    var inf = this.config.inference;
    var canLocal = this.supportsLocalInference();
    var canWasm = this.supportsWasmInference();
    var hasRemote = this.hasRemoteTransport();

    if (mode === "wasm") {
      return canWasm ? ["wasm"] : (hasRemote && inf.fallbackToRemote ? ["remote"] : []);
    }

    if (mode === "local") {
      var localOrder = canLocal ? ["local"] : [];
      if (canWasm && inf.fallbackToWasm) localOrder.push("wasm");
      if (hasRemote && inf.fallbackToRemote) localOrder.push("remote");
      return localOrder;
    }

    if (mode === "remote") {
      var remoteOrder = hasRemote ? ["remote"] : [];
      if (inf.fallbackToLocal && canLocal) remoteOrder.push("local");
      if (inf.fallbackToLocal && canWasm) remoteOrder.push("wasm");
      return remoteOrder;
    }

    // "auto" — privacy-first cascade: WebGPU → WASM → remote
    var order = [];
    if (canLocal) order.push("local");
    if (canWasm && inf.fallbackToWasm) order.push("wasm");
    if (hasRemote && inf.fallbackToRemote) order.push("remote");
    return order;
  };

  Chatbot.prototype.shouldUseLocalFirst = function () {
    var order = this.getBackendOrder();
    return order.length > 0 && order[0] === "local";
  };

  Chatbot.prototype.detectCapabilities = function () {
    if (this._caps) return this._caps;

    var nav = typeof navigator !== "undefined" ? navigator : {};
    var ua = nav.userAgent || "";
    var caps = {
      webgpu: Boolean(nav.gpu),
      webgpuAdapter: false,
      webgpuProbed: false,
      wasm: typeof WebAssembly === "object",
      sharedArrayBuffer: typeof SharedArrayBuffer === "function",
      crossOriginIsolated: typeof crossOriginIsolated !== "undefined" && crossOriginIsolated,
      deviceMemory: nav.deviceMemory || 0,
      hardwareConcurrency: nav.hardwareConcurrency || 1,
      isMobile: /Mobi|Android|iPhone|iPad|iPod/i.test(ua),
      isIOS: /iPhone|iPad|iPod/i.test(ua)
    };

    this._caps = caps;
    return caps;
  };

  Chatbot.prototype.probeWebGPUAdapter = async function () {
    var caps = this.detectCapabilities();
    if (caps.webgpuProbed) return caps.webgpuAdapter;
    if (!caps.webgpu) {
      caps.webgpuProbed = true;
      return false;
    }
    try {
      var adapter = await navigator.gpu.requestAdapter();
      caps.webgpuAdapter = Boolean(adapter);
    } catch (_) {
      caps.webgpuAdapter = false;
    }
    caps.webgpuProbed = true;
    return caps.webgpuAdapter;
  };

  Chatbot.prototype.supportsLocalInference = function () {
    var c = this.detectCapabilities();
    if (!c.webgpuAdapter) return false;
    // Llama 3.2 1B q4 needs ~1.2GB GPU memory. Skip on mobile with unknown or low RAM.
    // iOS doesn't expose navigator.deviceMemory (returns 0), so treat unknown as insufficient.
    if (c.isMobile && (!c.deviceMemory || c.deviceMemory < 4)) return false;
    return true;
  };

  Chatbot.prototype.supportsWasmInference = function () {
    var c = this.detectCapabilities();
    if (!c.wasm) return false;
    // Tiny model (~500MB). Need a baseline of memory headroom.
    if (c.deviceMemory && c.deviceMemory < 2) return false;
    return true;
  };

  Chatbot.prototype.hasRemoteTransport = function () {
    return Boolean(this.config.transport && this.config.transport.endpoint);
  };

  Chatbot.prototype.getRemoteResponse = function (messages, botEl) {
    if (!this.hasRemoteTransport()) {
      throw new Error("Remote transport is not configured.");
    }

    var provider = (this.config.transport.provider || "openai").toLowerCase();

    if (provider === "gemini") {
      if (this.config.transport.stream) {
        return this.streamGemini(messages, botEl);
      }
      return this.requestGemini(messages);
    }

    if (this.config.transport.stream) {
      return this.streamOpenAI(messages, botEl);
    }

    return this.requestOpenAI(messages);
  };

  Chatbot.prototype.clearWebLLMCache = async function () {
    // Clear Cache API entries
    try {
      var cacheNames = await caches.keys();
      for (var i = 0; i < cacheNames.length; i += 1) {
        var name = cacheNames[i];
        if (name.indexOf("webllm") >= 0 || name.indexOf("mlc") >= 0) {
          await caches.delete(name);
          if (this.config.debug) {
            console.log("Cleared Cache API:", name);
          }
        }
      }
    } catch (err) {
      if (this.config.debug) {
        console.warn("Could not clear Cache API", err);
      }
    }
    // Clear IndexedDB databases used by WebLLM
    try {
      if (typeof indexedDB.databases === "function") {
        var databases = await indexedDB.databases();
        for (var j = 0; j < databases.length; j += 1) {
          var dbName = databases[j].name || "";
          if (dbName.indexOf("webllm") >= 0 || dbName.indexOf("mlc") >= 0 || dbName.indexOf("tvmjs") >= 0) {
            indexedDB.deleteDatabase(dbName);
            if (this.config.debug) {
              console.log("Cleared IndexedDB:", dbName);
            }
          }
        }
      }
    } catch (err) {
      if (this.config.debug) {
        console.warn("Could not clear IndexedDB", err);
      }
    }
  };

  Chatbot.prototype.ensureLocalEngine = async function () {
    if (this.localEngine) {
      return this.localEngine;
    }

    if (!this.supportsLocalInference()) {
      throw new Error("WebGPU is not available for local inference.");
    }

    this.showLoadingProgress(true);
    this.updateSubtitle("Downloading model...");

    if (!this.webllmModule) {
      this.webllmModule = await import(this.config.local.moduleUrl);
    }

    var createEngine = this.webllmModule && this.webllmModule.CreateMLCEngine;
    if (typeof createEngine !== "function") {
      this.showLoadingProgress(false);
      throw new Error("Could not load WebLLM module.");
    }

    var self = this;
    var modelList = this.webllmModule.prebuiltAppConfig
      ? this.webllmModule.prebuiltAppConfig.model_list
      : undefined;
    var initOpts = {
      appConfig: {
        model_list: modelList,
        cacheBackend: this.config.local.cacheBackend || "indexeddb"
      },
      initProgressCallback: function (progress) {
        if (progress && typeof progress.progress === "number") {
          var percent = Math.round(progress.progress * 100);
          self.setProgress(percent);
          if (percent < 100) {
            self.updateSubtitle("Loading model... " + percent + "%");
          } else {
            self.updateSubtitle("Initializing model...");
          }
        } else if (progress && progress.text) {
          self.updateSubtitle(progress.text.length > 40 ? progress.text.slice(0, 40) + "..." : progress.text);
        }
      }
    };

    try {
      this.localEngine = await createEngine(this.config.local.model, initOpts);
    } catch (err) {
      var msg = err && err.message ? err.message : "";
      if (msg.toLowerCase().indexOf("quota") >= 0) {
        // Clear stale cache and retry once
        this.updateSubtitle("Clearing cache & retrying...");
        await this.clearWebLLMCache();
        try {
          this.localEngine = await createEngine(this.config.local.model, initOpts);
        } catch (retryErr) {
          this.showLoadingProgress(false);
          var retryMsg = retryErr && retryErr.message ? retryErr.message : "";
          if (retryMsg.toLowerCase().indexOf("quota") >= 0) {
            this.updateSubtitle("Storage full");
            throw new Error("Browser storage quota exceeded. Try clearing site data in browser settings (Settings → Privacy → Clear browsing data → Cached images and files).");
          }
          this.updateSubtitle("Load failed");
          throw retryErr;
        }
      } else {
        this.showLoadingProgress(false);
        this.updateSubtitle("Load failed");
        throw err;
      }
    }

    this.showLoadingProgress(false);
    this.updateSubtitle("Local model ready ✓");
    return this.localEngine;
  };

  Chatbot.prototype.showLoadingProgress = function (active) {
    if (!this.nodes.progressWrap) return;
    if (active) {
      this.nodes.progressWrap.classList.add("active");
      this.nodes.subtitle.classList.add("loading");
    } else {
      this.nodes.progressWrap.classList.remove("active", "indeterminate");
      this.nodes.subtitle.classList.remove("loading");
    }
  };

  Chatbot.prototype.setProgress = function (percent) {
    if (!this.nodes.progressBar) return;
    if (percent <= 0) {
      this.nodes.progressWrap.classList.add("indeterminate");
      this.nodes.progressBar.style.width = "30%";
    } else {
      this.nodes.progressWrap.classList.remove("indeterminate");
      this.nodes.progressBar.style.width = Math.min(percent, 100) + "%";
    }
  };

  Chatbot.prototype.getLocalResponse = async function (messages, botEl) {
    var engine = await this.ensureLocalEngine();
    var request = {
      messages: messages,
      stream: Boolean(this.config.local.stream),
      temperature: this.config.local.temperature,
      top_p: this.config.local.topP
    };

    if (request.stream) {
      var responseText = "";
      var streamEl = this.replaceWithBotMessage(botEl, "");
      var completion = await engine.chat.completions.create(request);
      for await (var chunk of completion) {
        if (this.abortController && this.abortController.signal.aborted) break;
        var delta = chunk && chunk.choices && chunk.choices[0] && chunk.choices[0].delta
          ? chunk.choices[0].delta.content
          : "";
        if (delta && streamEl.parentNode) {
          responseText += delta;
          streamEl.textContent = responseText;
          this.nodes.body.scrollTop = this.nodes.body.scrollHeight;
        }
      }
      return normalizeText(responseText);
    }

    var result = await engine.chat.completions.create(request);
    var text = result && result.choices && result.choices[0] && result.choices[0].message
      ? result.choices[0].message.content
      : "";
    return normalizeText(text);
  };

  Chatbot.prototype.ensureWasmEngine = async function () {
    if (this.wasmEngine && this.wasmTokenizer) {
      return { generator: this.wasmEngine, tokenizer: this.wasmTokenizer };
    }

    if (!this.supportsWasmInference()) {
      throw new Error("WASM inference is not supported on this device.");
    }

    this.showLoadingProgress(true);
    this.updateSubtitle("Loading lite model...");

    if (!this.transformersModule) {
      this.transformersModule = await import(this.config.wasm.moduleUrl);
    }

    var mod = this.transformersModule;
    if (mod && mod.env) {
      mod.env.allowLocalModels = false;
      mod.env.useBrowserCache = true;
    }

    var self = this;
    var progressCallback = function (info) {
      if (!info) return;
      if (info.status === "progress" && typeof info.progress === "number") {
        var percent = Math.round(info.progress);
        self.setProgress(percent);
        if (percent < 100) {
          self.updateSubtitle("Loading lite... " + percent + "%");
        } else {
          self.updateSubtitle("Initializing lite...");
        }
      } else if (info.status === "ready") {
        self.updateSubtitle("Lite model ready ✓");
      }
    };

    var pipelineOpts = {
      dtype: this.config.wasm.dtype || "q4",
      device: this.config.wasm.device || "wasm",
      progress_callback: progressCallback
    };

    try {
      this.wasmEngine = await mod.pipeline("text-generation", this.config.wasm.model, pipelineOpts);
      this.wasmTokenizer = this.wasmEngine.tokenizer;
    } catch (err) {
      this.showLoadingProgress(false);
      this.updateSubtitle("Lite load failed");
      throw err;
    }

    this.showLoadingProgress(false);
    this.updateSubtitle("Local Lite · Ready ✓");
    return { generator: this.wasmEngine, tokenizer: this.wasmTokenizer };
  };

  Chatbot.prototype.getWasmResponse = async function (messages, botEl) {
    var ctx = await this.ensureWasmEngine();
    var generator = ctx.generator;
    var tokenizer = ctx.tokenizer;
    var stream = Boolean(this.config.wasm.stream);

    var generateOpts = {
      max_new_tokens: this.config.wasm.maxNewTokens || 256,
      temperature: this.config.wasm.temperature,
      top_p: this.config.wasm.topP,
      do_sample: true,
      return_full_text: false
    };

    if (stream && this.transformersModule && this.transformersModule.TextStreamer) {
      var responseText = "";
      var streamEl = this.replaceWithBotMessage(botEl, "");
      var self = this;
      var streamer = new this.transformersModule.TextStreamer(tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: function (chunk) {
          if (self.abortController && self.abortController.signal.aborted) {
            throw WASM_ABORT_SENTINEL;
          }
          if (!chunk || !streamEl.parentNode) return;
          responseText += chunk;
          streamEl.textContent = responseText;
          self.nodes.body.scrollTop = self.nodes.body.scrollHeight;
        }
      });
      generateOpts.streamer = streamer;
      try {
        await generator(messages, generateOpts);
      } catch (err) {
        if (err !== WASM_ABORT_SENTINEL) throw err;
      }
      return normalizeText(responseText);
    }

    var out = await generator(messages, generateOpts);
    var text = "";
    if (Array.isArray(out) && out.length > 0) {
      var item = out[0];
      if (typeof item.generated_text === "string") {
        text = item.generated_text;
      } else if (Array.isArray(item.generated_text)) {
        // Chat-template output — last message is the assistant turn
        var last = item.generated_text[item.generated_text.length - 1];
        text = last && last.content ? last.content : "";
      }
    }
    return normalizeText(text);
  };

  Chatbot.prototype.buildGeminiEndpoint = function (stream) {
    var model = this.config.transport.model || "gemini-2.0-flash";
    var apiKey = this.config.transport.apiKey || "";
    var base = this.config.transport.endpoint;

    if (base) {
      // If user provides a full endpoint, use it directly
      if (base.indexOf("key=") === -1 && apiKey) {
        var sep = base.indexOf("?") >= 0 ? "&" : "?";
        return base + sep + "key=" + apiKey;
      }
      return base;
    }

    // Build from model + apiKey
    var action = stream ? "streamGenerateContent?alt=sse&" : "generateContent?";
    return "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":" + action + "key=" + apiKey;
  };

  Chatbot.prototype.messagesToGeminiContents = function (messages) {
    var contents = [];
    var systemInstruction = null;

    for (var i = 0; i < messages.length; i += 1) {
      var msg = messages[i];
      if (msg.role === "system") {
        // Gemini uses systemInstruction for system messages
        if (!systemInstruction) {
          systemInstruction = { parts: [{ text: msg.content }] };
        } else {
          systemInstruction.parts.push({ text: msg.content });
        }
      } else {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        });
      }
    }

    return { contents: contents, systemInstruction: systemInstruction };
  };

  Chatbot.prototype.requestGemini = async function (messages) {
    var endpoint = this.buildGeminiEndpoint(false);
    var geminiBody = this.messagesToGeminiContents(messages);

    var body = { contents: geminiBody.contents };
    if (geminiBody.systemInstruction) {
      body.systemInstruction = geminiBody.systemInstruction;
    }

    var response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: this.abortController.signal,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      var errText = await response.text().catch(function() { return ""; });
      throw new Error("Gemini HTTP " + response.status + ": " + errText.slice(0, 200));
    }

    var data = await response.json();
    var text = "";
    if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
      var parts = data.candidates[0].content.parts;
      for (var j = 0; j < parts.length; j += 1) {
        if (parts[j].text) {
          text += parts[j].text;
        }
      }
    }
    return normalizeText(text);
  };

  Chatbot.prototype.streamGemini = async function (messages, botEl) {
    var endpoint = this.buildGeminiEndpoint(true);
    var geminiBody = this.messagesToGeminiContents(messages);

    var body = { contents: geminiBody.contents };
    if (geminiBody.systemInstruction) {
      body.systemInstruction = geminiBody.systemInstruction;
    }

    var response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: this.abortController.signal,
      body: JSON.stringify(body)
    });

    if (!response.ok || !response.body) {
      throw new Error("Gemini streaming not available (HTTP " + response.status + ")");
    }

    var reader = response.body.getReader();
    var decoder = new TextDecoder("utf-8");
    var fullText = "";
    var buffer = "";

    while (true) {
      var result = await reader.read();
      if (result.done) {
        break;
      }

      buffer += decoder.decode(result.value, { stream: true });
      var lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (var i = 0; i < lines.length; i += 1) {
        var line = lines[i].trim();
        if (!line || line.indexOf("data:") !== 0) {
          continue;
        }

        var payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") {
          continue;
        }

        try {
          var data = JSON.parse(payload);
          if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
            var parts = data.candidates[0].content.parts;
            for (var j = 0; j < parts.length; j += 1) {
              if (parts[j].text) {
                fullText += parts[j].text;
                botEl.textContent = fullText;
                this.nodes.body.scrollTop = this.nodes.body.scrollHeight;
              }
            }
          }
        } catch (err) {
          if (this.config.debug) {
            console.warn("Could not parse Gemini stream chunk", err);
          }
        }
      }
    }

    return normalizeText(fullText);
  };

  Chatbot.prototype.requestOpenAI = async function (messages) {
    var response = await fetch(this.config.transport.endpoint, {
      method: "POST",
      headers: this.buildHeaders(),
      signal: this.abortController.signal,
      body: JSON.stringify(
        Object.assign({}, this.config.transport.requestBody || {}, {
          model: this.config.transport.model,
          stream: false,
          messages: messages
        })
      )
    });

    if (!response.ok) {
      throw new Error("HTTP " + response.status + " from model endpoint");
    }

    var data = await response.json();
    var text = data && data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : "";
    return normalizeText(text);
  };

  Chatbot.prototype.streamOpenAI = async function (messages, botEl) {
    var response = await fetch(this.config.transport.endpoint, {
      method: "POST",
      headers: this.buildHeaders(),
      signal: this.abortController.signal,
      body: JSON.stringify(
        Object.assign({}, this.config.transport.requestBody || {}, {
          model: this.config.transport.model,
          stream: true,
          messages: messages
        })
      )
    });

    if (!response.ok || !response.body) {
      throw new Error("Streaming is not available from model endpoint");
    }

    var reader = response.body.getReader();
    var decoder = new TextDecoder("utf-8");
    var fullText = "";
    var buffer = "";

    while (true) {
      var result = await reader.read();
      if (result.done) {
        break;
      }

      buffer += decoder.decode(result.value, { stream: true });
      var lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (var i = 0; i < lines.length; i += 1) {
        var line = lines[i].trim();
        if (!line || line.indexOf("data:") !== 0) {
          continue;
        }

        var payload = line.slice(5).trim();
        if (payload === "[DONE]") {
          continue;
        }

        try {
          var data = JSON.parse(payload);
          var delta = data && data.choices && data.choices[0] && data.choices[0].delta
            ? data.choices[0].delta.content
            : "";
          if (delta) {
            fullText += delta;
            botEl.textContent = fullText;
            this.nodes.body.scrollTop = this.nodes.body.scrollHeight;
          }
        } catch (err) {
          if (this.config.debug) {
            console.warn("Could not parse stream chunk", err);
          }
        }
      }
    }

    return normalizeText(fullText);
  };

  Chatbot.prototype.buildHeaders = function () {
    var headers = Object.assign(
      {
        "Content-Type": "application/json"
      },
      this.config.transport.headers || {}
    );

    if (this.config.transport.apiKey) {
      headers.Authorization = "Bearer " + this.config.transport.apiKey;
    }

    return headers;
  };

  Chatbot.prototype.clearConversation = function () {
    this.history = [];
    this.nodes.body.innerHTML = "";
    if (this.config.welcomeMessage) {
      this.pushMetaMessage(this.config.welcomeMessage);
    }
    this.persistHistory();
    this.emit("clear");
  };

  Chatbot.prototype.reconfigure = function (overrides) {
    if (!overrides) return;
    this.config = deepMerge(this.config, overrides);
    if (overrides.adapter === null) {
      this.config.adapter = null;
    }
    this.emit("reconfigure", overrides);
  };

  Chatbot.prototype.persistHistory = function () {
    if (!this.config.persistConversation) {
      return;
    }

    try {
      var payload = {
        id: this.id,
        messages: this.history.slice(-this.config.maxHistoryMessages)
      };
      localStorage.setItem(this.config.storageKey + ":" + this.id, JSON.stringify(payload));
    } catch (err) {
      if (this.config.debug) {
        console.warn("Could not persist history", err);
      }
    }
  };

  Chatbot.prototype.restoreHistory = function () {
    if (!this.config.persistConversation) {
      return;
    }

    try {
      var raw = localStorage.getItem(this.config.storageKey + ":" + this.id);
      if (!raw) {
        return;
      }
      var data = JSON.parse(raw);
      var items = Array.isArray(data.messages) ? data.messages : [];
      this.history = items.filter(function (item) {
        return item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string";
      });

      for (var i = 0; i < this.history.length; i += 1) {
        var entry = this.history[i];
        this.pushMessage(entry.role === "user" ? "user" : "bot", entry.content);
      }
    } catch (err) {
      if (this.config.debug) {
        console.warn("Could not restore history", err);
      }
    }
  };

  Chatbot.prototype.ingestMany = async function (sources) {
    for (var i = 0; i < sources.length; i += 1) {
      await this.ingest(sources[i]);
    }
    this.emit("ingested", { chunkCount: this.ingestedChunks.length });
  };

  Chatbot.prototype.ingest = async function (source) {
    var normalized = await this.normalizeSource(source);
    if (!normalized || !normalized.text) {
      return 0;
    }

    var pieces = chunkText(
      normalized.text,
      this.config.retrieval.chunkSize,
      this.config.retrieval.chunkOverlap
    );

    for (var i = 0; i < pieces.length; i += 1) {
      var part = pieces[i];
      var tokens = tokenize(part);
      var tokenMap = Object.create(null);

      for (var j = 0; j < tokens.length; j += 1) {
        var token = tokens[j];
        tokenMap[token] = (tokenMap[token] || 0) + 1;
      }

      this.ingestedChunks.push({
        source: normalized.meta,
        text: part,
        tokenMap: tokenMap
      });
    }

    return pieces.length;
  };

  Chatbot.prototype.normalizeSource = async function (source) {
    if (!source) {
      return null;
    }

    if (typeof source === "string") {
      return {
        text: source,
        meta: { title: "Inline source" }
      };
    }

    if (source.type === "page") {
      return {
        text: document.body ? document.body.innerText : "",
        meta: { title: source.title || "Current page" }
      };
    }

    if (source.selector) {
      var node = document.querySelector(source.selector);
      return {
        text: node ? node.textContent || "" : "",
        meta: { title: source.title || source.selector }
      };
    }

    if (source.url) {
      var response = await fetch(source.url, { method: "GET" });
      if (!response.ok) {
        throw new Error("Could not ingest URL: " + source.url);
      }
      var contentType = response.headers.get("content-type") || "";
      var text = "";
      if (contentType.indexOf("application/json") >= 0) {
        var json = await response.json();
        text = JSON.stringify(json);
      } else {
        text = await response.text();
      }

      return {
        text: text,
        meta: { title: source.title || source.url, url: source.url }
      };
    }

    if (typeof source.text === "string") {
      return {
        text: source.text,
        meta: { title: source.title || "Text source" }
      };
    }

    return null;
  };

  Chatbot.prototype.destroy = function () {
    if (this.abortController) {
      this.abortController.abort();
    }
    if (this.nodes.root && this.nodes.root.parentNode) {
      this.nodes.root.parentNode.removeChild(this.nodes.root);
    }
    INSTANCES.delete(this.id);
    this.emit("destroy");
  };

  function init(config) {
    var bot = new Chatbot(config);
    INSTANCES.set(bot.id, bot);
    return bot.init();
  }

  function get(id) {
    return INSTANCES.get(id);
  }

  function destroy(id) {
    var bot = INSTANCES.get(id);
    if (!bot) {
      return;
    }
    bot.destroy();
  }

  window.VNBChatbot = {
    init: init,
    get: get,
    destroy: destroy,
    defaults: JSON.parse(JSON.stringify(DEFAULTS))
  };

  if (window.VNBChatbotConfig && window.VNBChatbotConfig.autoInit !== false) {
    window.VNBChatbot.init(window.VNBChatbotConfig);
  }
})();
