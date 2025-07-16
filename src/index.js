(function () {
    const AKILIOS_WIDGET_SESSION_KEY = 'Akilios_Session_Id';
    const origin = window.location.origin;
    const referrer = document.referrer;
    const clientId = document.currentScript?.getAttribute("akilios-client-id");
  
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
  
    // Chat Widget
    const widgetEl = document.createElement('div');
    widgetEl.id = 'akilios-widget-container';
    widgetEl.style.display = 'none';
    widgetEl.innerHTML = `
      <div style="position: fixed; bottom: 80px; right: 20px; width: 320px; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: sans-serif; z-index: 9999;">
        <div style="background: #3b82f6; color: white; padding: 12px 16px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
          <span>Customer Support</span>
          <div>
            <button id="akilios-minimize" style="background: none; border: none; color: white; margin-right: 8px; font-size: 18px;">−</button>
            <button id="akilios-close" style="background: none; border: none; color: white; font-size: 18px;">×</button>
          </div>
        </div>
        <div style="padding: 12px;">
          <div style="background: #f3f4f6; padding: 10px; border-radius: 10px; margin-bottom: 10px; font-size: 14px;">
            <strong>Hi!</strong> How can I help you today?
          </div>
          <input id="akilios-email" type="email" placeholder="Your email*" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #ddd; margin-bottom: 8px;" />
          <textarea id="akilios-message" placeholder="Type your message..." style="width: 100%; padding: 8px; height: 80px; border-radius: 6px; border: 1px solid #ddd;"></textarea>
          <button id="akilios-send" style="margin-top: 8px; width: 100%; padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 6px;">Send</button>
        </div>
        <div style="text-align: center; font-size: 12px; color: #999; padding-bottom: 8px;">Powered by AkiliOS</div>
      </div>
    `;
    document.body.appendChild(widgetEl);
  
    // Bubble (hidden initially)
    const launcher = document.createElement('div');
    launcher.innerText = '💬';
    launcher.id = 'akilios-launcher';
    launcher.style = `
      display: none;
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      border-radius: 9999px;
      padding: 14px 16px;
      cursor: pointer;
      font-size: 18px;
      z-index: 9998;
    `;
    document.body.appendChild(launcher);
  
    // Elements
    const closeBtn = widgetEl.querySelector('#akilios-close');
    const minimizeBtn = widgetEl.querySelector('#akilios-minimize');
    const sendBtn = widgetEl.querySelector('#akilios-send');
    const emailInput = widgetEl.querySelector('#akilios-email');
    const messageInput = widgetEl.querySelector('#akilios-message');
  
    // Widget API
    const AkiliOSWidget = {
      getSessionId: () => sessionId,
  
      open: function () {
        widgetEl.style.display = 'block';
        launcher.style.display = 'none';
      },
  
      close: function () {
        widgetEl.style.display = 'none';
        launcher.style.display = 'none';
      },

      minimize: function () {
        widgetEl.style.display = 'none';
        launcher.style.display = 'block';
      },
  
      showBubble: function () {
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
        return Promise.resolve(payload);
      }
    };
  
    // Bind globally
    window.AkiliOSWidget = AkiliOSWidget;
  
    // Events
    launcher.addEventListener('click', AkiliOSWidget.open);
    closeBtn.addEventListener('click', AkiliOSWidget.close);
    minimizeBtn.addEventListener('click', () => {
        window.AkiliOSWidget.minimize();
    });
  
    sendBtn.addEventListener('click', () => {
      const email = emailInput.value;
      const message = messageInput.value;
      AkiliOSWidget.contactMe({ email, message })
        .then(() => {
          alert('Message sent!');
          emailInput.value = '';
          messageInput.value = '';
          AkiliOSWidget.close();
        })
        .catch((err) => {
          alert('Failed to send: ' + err);
        });
    });
  
    // Ready event
    window.dispatchEvent(new CustomEvent("AkiliOSWidgetReady", {
      detail: { sessionId, clientId }
    }));
  })();
  