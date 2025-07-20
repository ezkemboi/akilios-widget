import './widget.css';

(function () {
  const AKILIOS_WIDGET_SESSION_KEY = 'Akilios_Session_Id';
  const origin = window.location.origin;
  const referrer = document.referrer;
  const apiUrl = import.meta.env.VITE_API_ENDPOINT;

  // Support both static and dynamically injected scripts
  let clientId;
  try {
    // validate clientId and set sessionId
    clientId =
      document.currentScript?.getAttribute("akilios-client-id") ||
      document.querySelector('script[src*="akilios-widget.js"]')?.getAttribute("akilios-client-id");
  } catch {
    clientId = null;
  }

  if (!clientId) {
    console.warn("[AkiliOSWidget] Missing client ID.");
    return;
  }

  function addHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Session-Id': localStorage.getItem(AKILIOS_WIDGET_SESSION_KEY) || undefined,
      'X-Client-Id': clientId,
      "X-Submitted-At": new Date().toISOString()
    }
  }

  async function generateClientSession() {
    const payload = {}
    // do validation here also for frontend
    return await fetch(`${apiUrl}/session`, {
      method: 'POST',
      headers: addHeaders(),
      body: JSON.stringify(payload)
    }).then(res => res.json());
  }

  // check on how to do cache inside CDN for clientId and sessionId
  async function getOrCreateSessionId() {
    let sessionId = localStorage.getItem(AKILIOS_WIDGET_SESSION_KEY);
    if (!sessionId) {
      const response = await generateClientSession();
      localStorage.setItem(AKILIOS_WIDGET_SESSION_KEY, response.sessionId);
    }
    return sessionId;
  }

  const sessionId = getOrCreateSessionId();

  // Inject widget container
  const widgetEl = document.createElement('div');
  widgetEl.id = 'akilios-widget-container';
  widgetEl.style.display = 'none';
  widgetEl.innerHTML = `
    <div class="akilios-widget">
      <div class="akilios-header">
        <span class="akilios-title">Customer Support</span>
        <div class="akilios-header-actions">
          <button id="akilios-minimize" class="akilios-header-btn">−</button>
          <button id="akilios-close" class="akilios-header-btn">×</button>
        </div>
      </div>
      <div class="akilios-body">
        <div id="akilios-messages" class="akilios-messages">
          <div class="akilios-message akilios-message-agent">
            <span class="akilios-message-avatar">C</span>
            <div class="akilios-message-bubble">Hi! How can I help you today?<span class="akilios-message-time">13:30</span></div>
          </div>
        </div>
        <div class="akilios-input-row">
          <input id="akilios-message" class="akilios-input" type="text" placeholder="Type your message..." autocomplete="off" />
          <button id="akilios-send" class="akilios-send-btn" title="Send">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="akilios-send-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l15.364-8.192a.75.75 0 011.086.67v15.044a.75.75 0 01-1.086.67L2.25 12zm0 0l7.5 3.75m-7.5-3.75l7.5-3.75" />
            </svg>
          </button>
        </div>
      </div>
      <div class="akilios-footer">Powered by AkiliOS</div>
    </div>
  `;
  document.body.appendChild(widgetEl);

  // Bubble (hidden initially)
  const launcher = document.createElement('div');
  launcher.innerText = '💬';
  launcher.id = 'akilios-launcher';
  launcher.className = 'akilios-launcher';
  launcher.style = `
    display: none;
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--akilios-primary, #2563eb);
    color: var(--akilios-primary-contrast, #fff);
    border-radius: 50%;
    width: 56px;
    height: 56px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.12);
    font-size: 28px;
    align-items: center;
    justify-content: center;
    display: flex;
    cursor: pointer;
    z-index: 9998;
    border: none;
    transition: background 0.2s;
  `;
  document.body.appendChild(launcher);

  // Query elements
  const closeBtn = widgetEl.querySelector('#akilios-close');
  const minimizeBtn = widgetEl.querySelector('#akilios-minimize');
  const sendBtn = widgetEl.querySelector('#akilios-send');
  const messageInput = widgetEl.querySelector('#akilios-message');
  const messagesContainer = widgetEl.querySelector('#akilios-messages');

  // Widget public API
  const AkiliOSWidget = {
    getSessionId: () => sessionId,

    open() {
      widgetEl.style.display = 'block';
      launcher.style.display = 'none';
    },

    close() {
      widgetEl.style.display = 'none';
      launcher.style.display = 'none';
    },

    minimize() {
      widgetEl.style.display = 'none';
      launcher.style.display = 'block';
    },

    showBubble() {
      launcher.style.display = 'block';
    },

    contactMe: async function (formData) {
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        console.warn("[AkiliOSWidget] Invalid or missing email");
        return Promise.reject("Email is required and must be valid.");
      }

      const payload = {
        clientId,
        sessionId,
        origin,
        referrer,
        ...formData,
        submittedAt: new Date().toISOString()
      };

      return await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: addHeaders(),
        body: JSON.stringify(payload)
      }).then(res => res.json());
    }
  };

  async function createConversation(payload) {
    return await fetch(`${apiUrl}/conversation`, {
      method: 'POST',
      headers: addHeaders(),
      body: JSON.stringify(payload)
    }).then(res => res.json());
  }

  function createBotBubble() {
    const botMsg = document.createElement("div");
    botMsg.className = "akilios-message akilios-message-agent";
    botMsg.innerHTML = `<span class="akilios-message-avatar">C</span><div class="akilios-message-bubble"></div>`;
    messagesContainer.appendChild(botMsg);
    return botMsg.querySelector(".akilios-message-bubble");
  }
  
  function appendTime(bubble) {
    const time = document.createElement("span");
    time.className = "akilios-message-time";
    time.textContent = new Date().toLocaleTimeString();
    bubble.appendChild(time);
  }
  
  function scrollMessagesToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async function streamChat(messageId) {
    // do validation here also for frontend
    const sessionId = localStorage.getItem(AKILIOS_WIDGET_SESSION_KEY);
    const eventSource = new EventSource(`${apiUrl}/chat-stream?messageId=${messageId}&sessionId=${sessionId}&clientId=${clientId}`);
    const bubble = createBotBubble();
    eventSource.onmessage = (e) => {
      bubble.textContent += e.data + " ";
      scrollMessagesToBottom();
    };
    eventSource.addEventListener("done", () => {
      appendTime(bubble);
      eventSource.close();
    });
  }

  window.AkiliOSWidget = AkiliOSWidget;

  // Safe event bindings
  if (launcher) launcher.addEventListener('click', AkiliOSWidget.open);
  if (closeBtn) closeBtn.addEventListener('click', AkiliOSWidget.close);
  if (minimizeBtn) minimizeBtn.addEventListener('click', () => {
    widgetEl.style.display = 'none';
    launcher.style.display = 'flex';
  });
  if (sendBtn && messageInput && messagesContainer) {
    sendBtn.addEventListener('click', async () => {
      const message = messageInput.value.trim();
      if (!message) return;
      // Add user's message to chat
      const userMsg = document.createElement('div');
      userMsg.className = 'akilios-message akilios-message-user';
      userMsg.innerHTML = `<span class="akilios-message-avatar">C</span><div class="akilios-message-bubble"></div>`;
      // Use textContent for user message to prevent XSS
      userMsg.querySelector('.akilios-message-bubble').textContent = message;
      // Add time
      const timeSpan = document.createElement('span');
      timeSpan.className = 'akilios-message-time';
      timeSpan.textContent = '13:31';
      userMsg.querySelector('.akilios-message-bubble').appendChild(timeSpan);
      messagesContainer.appendChild(userMsg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      messageInput.value = '';
      // respond to messages, need to see how to keep history
      const response = await createConversation({ message });
      if(response.success && response.messageId) {
        await streamChat(response.messageId)
      }
    });
  }

  // Send message on Enter key
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  // Dispatch ready signal
  window.dispatchEvent(new CustomEvent("AkiliOSWidgetReady", {
    detail: { sessionId, clientId }
  }));
})();
