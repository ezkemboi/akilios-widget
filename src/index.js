import './widget.css';

(function () {
  const AKILIOS_WIDGET_SESSION_KEY = 'Akilios_Session_Id';
  const origin = window.location.origin;
  const referrer = document.referrer;

  // Support both static and dynamically injected scripts
  let clientId;
  try {
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

  function getOrCreateSessionId() {
    let sessionId = localStorage.getItem(AKILIOS_WIDGET_SESSION_KEY);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(AKILIOS_WIDGET_SESSION_KEY, sessionId);
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

  // Bubble icon
  const launcher = document.createElement('div');
  launcher.innerText = '💬';
  launcher.id = 'akilios-launcher';
  launcher.style = `
    display: none;
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--akilios-primary);
    color: var(--akilios-primary-contrast);
    border-radius: 9999px;
    padding: 14px 16px;
    cursor: pointer;
    font-size: 18px;
    z-index: 9998;
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

      console.log("Sending contactMe payload:", payload);
      return Promise.resolve(payload); // Replace with fetch() to your backend if needed
    }
  };

  window.AkiliOSWidget = AkiliOSWidget;

  // Safe event bindings
  if (launcher) launcher.addEventListener('click', AkiliOSWidget.open);
  if (closeBtn) closeBtn.addEventListener('click', AkiliOSWidget.close);
  if (minimizeBtn) minimizeBtn.addEventListener('click', AkiliOSWidget.minimize);
  if (sendBtn && messageInput && messagesContainer) {
    sendBtn.addEventListener('click', () => {
      const message = messageInput.value.trim();
      if (!message) return;

      const userMsg = document.createElement('div');
      userMsg.className = 'akilios-message akilios-message-user';
      
      const avatar = document.createElement('span');
      avatar.className = 'akilios-message-avatar';
      avatar.textContent = 'C';
      userMsg.appendChild(avatar);
      
      const bubble = document.createElement('div');
      bubble.className = 'akilios-message-bubble';
      bubble.textContent = message;
      
      const time = document.createElement('span');
      time.className = 'akilios-message-time';
      time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      bubble.appendChild(time);
      
      userMsg.appendChild(bubble);
      messagesContainer.appendChild(userMsg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      messageInput.value = '';

      setTimeout(() => {
        const agentMsg = document.createElement('div');
        agentMsg.className = 'akilios-message akilios-message-agent';
        agentMsg.innerHTML = `
          <span class="akilios-message-avatar">C</span>
          <div class="akilios-message-bubble">
            Thank you for your message!
            <span class="akilios-message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        `;
        messagesContainer.appendChild(agentMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 800);
    });
  }

  // Dispatch ready signal
  window.dispatchEvent(new CustomEvent("AkiliOSWidgetReady", {
    detail: { sessionId, clientId }
  }));
})();
