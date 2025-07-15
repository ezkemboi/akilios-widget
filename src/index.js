(function () {
    const AKILIOS_WIDGET_SESSION_KEY = 'Akilios_Session_Id';
    const origin = window.location.origin;
    const referrer = document.referrer;
    const clientId = document.currentScript?.getAttribute("akilios-client-id");

    if(!clientId) {
        console.warn("[AkiliOSWidget] Missing client ID.");
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
                origin: origin,
                referrer: referrer
            }
            console.log('Session Payload', { sessionPayload })
            // APICall('POST', sessionPayload)
            localStorage.setItem(AKILIOS_WIDGET_SESSION_KEY, sessionId);
        }
        return sessionId;
    }

    const sessionId = getOrCreateSessionId(); // ✅ auto-run on load
    // set global API
    window.AkiliOSWidget = window.AkiliOSWidget || {};

    // Optionally expose session
    window.AkiliOSWidget.getSessionId = () => sessionId;
    // Optional: flag that widget is ready
    window.dispatchEvent(new CustomEvent("AkiliOSWidgetReady", {
        detail: { sessionId, clientId }
    }));

    // Add contactMe Function, - check if sessionId is there, only check to make sure that email is available
    window.AkiliOSWidget.contactMe = async function (formData) {
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            console.warn("[AkiliOSWidget] Invalid or missing email");
            return Promise.reject("Email is required and must be valid.");
        }
        // form validations of what is required -> 
        const payload = {
            clientId,
            sessionId,
            origin,
            referrer,
            ...formData,
            submittedAt: new Date().toISOString()
        };
        // call API later to register, make sure siteId is available and origin/referrer validated or whitelisted
        return payload; // will return response.json here when connected to the backend
    }
})(); // invoke the function
