import "./widget.css";

(async function () {
  const AKILIOS_WIDGET_SESSION_KEY = "Akilios_Session_Id";
  const origin = window.location.origin;
  const referrer = document.referrer;
  const apiUrl = import.meta.env.VITE_API_ENDPOINT;

  // Get clientId from script tag
  let clientId =
    document.currentScript?.getAttribute("akilios-client-id") ||
    document
      .querySelector('script[src*="akilios-widget.js"]')
      ?.getAttribute("akilios-client-id");

  if (!clientId) {
    console.warn("[AkiliOSWidget] Missing client ID.");
    return;
  }

  /** ---- Helpers ---- **/
  function addHeaders() {
    return {
      "Content-Type": "application/json",
      "X-Session-Id": localStorage.getItem(AKILIOS_WIDGET_SESSION_KEY) || "",
      "X-Client-Id": clientId,
      "X-Submitted-At": new Date().toISOString(),
    };
  }

  async function generateClientSession() {
    const res = await fetch(`${apiUrl}/session`, {
      method: "POST",
      headers: addHeaders(),
      body: JSON.stringify({}),
    });
    return res.json();
  }

  async function getOrCreateSessionId() {
    const cached = localStorage.getItem(AKILIOS_WIDGET_SESSION_KEY);
    if (cached) return cached;

    const response = await generateClientSession();
    if (response.valid && response.sessionId) {
      localStorage.setItem(AKILIOS_WIDGET_SESSION_KEY, response.sessionId);
      return response.sessionId;
    }
    return null;
  }

  const sessionId = await getOrCreateSessionId();
  if (!sessionId) {
    console.warn("[AkiliOSWidget] No valid session. Widget not loaded.");
    return;
  }

  /** ---- DOM Injection ---- **/
  const widgetEl = document.createElement("div");
  widgetEl.id = "akilios-widget-container";
  widgetEl.style.display = "none";
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
        <form id="akilios-contact-form" class="akilios-contact-form">
          <input type="text" name="name" placeholder="Your Name" class="akilios-form-input" required />
          <input type="email" name="email" placeholder="Your Email" class="akilios-form-input" required />
          <input type="text" name="subject" placeholder="Subject" class="akilios-form-input" />
          <textarea name="message" placeholder="Your Message" class="akilios-form-textarea" required></textarea>
          <button type="submit" class="akilios-send-btn">Send Message</button>
        </form>
      </div>
      <div class="akilios-footer">Powered by AkiliOS</div>
    </div>
  `;
  document.body.appendChild(widgetEl);

  // Launcher button
  const launcher = document.createElement("button");
  launcher.id = "akilios-launcher";
  launcher.className = "akilios-launcher";
  launcher.innerText = "💬";
  launcher.style.display = "flex";
  document.body.appendChild(launcher);

  /** ---- Public API ---- **/
  const AkiliOSWidget = {
    getSessionId: () => sessionId,

    open() {
      widgetEl.style.display = "block";
      launcher.style.display = "none";
    },

    close() {
      widgetEl.style.display = "none";
      launcher.style.display = "flex"; // could be none later, now minimise
    },

    minimize() {
      widgetEl.style.display = "none";
      launcher.style.display = "flex";
    },

    async contactMe(formData) {
      if (
        !formData.email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        return Promise.reject("Email is required and must be valid.");
      }
      const payload = { clientId, sessionId, origin, referrer, ...formData };
      const res = await fetch(`${apiUrl}/contact`, {
        method: "POST",
        headers: addHeaders(),
        body: JSON.stringify(payload),
      });
      return res.json();
    },
  };

  /** ---- Events ---- **/
  const closeBtn = widgetEl.querySelector("#akilios-close");
  const minimizeBtn = widgetEl.querySelector("#akilios-minimize");
  const form = widgetEl.querySelector("#akilios-contact-form");

  launcher.addEventListener("click", AkiliOSWidget.open);
  closeBtn.addEventListener("click", AkiliOSWidget.close);
  minimizeBtn.addEventListener("click", AkiliOSWidget.minimize);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await AkiliOSWidget.contactMe(formData);
      // alert(response.message || "Message sent successfully!");
      form.reset();
      AkiliOSWidget.minimize();
    } catch (err) {
      // alert("❌ Failed to send. Please try again.");
    }
  });

  // Dispatch ready signal
  window.dispatchEvent(
    new CustomEvent("AkiliOSWidgetReady", {
      detail: { sessionId, clientId },
    })
  );

  window.AkiliOSWidget = AkiliOSWidget;
})();
