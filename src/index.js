(function () {
    const AKILIOS_WIDGET_SESSION_KEY = 'Akilios_Session_Id';
    const clientId = document.currentScript?.getAttribute("akilios-client-id");
    if(!clientId) {
        console.warn("[AkiliOSWidget] Missing 'akilios-client-id' attribute in script tag.");
        return // can register backend failed session load for investigations
    }

    function APICall (method, payload) {
        const URL = '';
        fetch('url', ) // use async/await and try/catch , add headers
    }

    // Create or retrieve sessionId from localStorage
    function getOrCreateSessionId() {
        let sessionId = localStorage.getItem(AKILIOS_WIDGET_SESSION_KEY);
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            const sessionPayload = {
                clientId, 
                origin: location.origin,
                referrer: document.referrer
            }
            console.log('Session Payload', { sessionPayload })
            // APICall('POST', sessionPayload)
            localStorage.setItem(AKILIOS_WIDGET_SESSION_KEY, sessionId);
        }
        return sessionId;
    }

    const akiliosSessionId = getOrCreateSessionId(); // ✅ auto-run on load
    // set global API
    window.AkiliOSWidget = window.AkiliOSWidget || {};

    // Optionally expose session
    window.AkiliOSWidget.getSessionId = () => sessionId;
    // Optional: flag that widget is ready
    window.dispatchEvent(new CustomEvent("AkiliOSWidgetReady", {
        detail: { sessionId: akiliosSessionId, clientId }
    }));

    // Add contactMe Function, - check if sessionId is there, only check to make sure that email is available

    // call API later to register, make sure siteId is available and origin/referrer validated or whitelisted
})(); // invoke the function
