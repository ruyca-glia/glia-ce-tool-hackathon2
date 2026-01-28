// /static/js/client-app.js

// 1. Configuration
const functionURL = 'https://api.glia.com/integrations/c8ee55e8-eebb-4934-bf1f-17fbdcfa69b2/endpoint';

// 2. Wait for the DOM to be ready (Standard practice)
document.addEventListener("DOMContentLoaded", () => {
    
    console.log("DOM Loaded. wiring up button...");
    const button = document.getElementById('runFunction');
    
    // Create a status message area so we don't have to rely only on console
    const statusMsg = document.createElement('div');
    statusMsg.style.marginTop = '10px';
    button.parentNode.appendChild(statusMsg);

    // 3. Attach the listener IMMEDIATELY
    button.addEventListener('click', async () => {
        console.log('Button clicked. Attempting to access Glia API...');
        statusMsg.innerText = 'Initializing Glia connection...';
        statusMsg.style.color = 'blue';

        try {
            // Check if Glia API is actually available in the window
            if (!window.getGliaApi) {
                throw new Error("Glia API not found. (Are you running locally?)");
            }

            // A: Initialize Glia API only when needed (Lazy Load)
            const glia = await window.getGliaApi({ version: 'v1' });
            
            // B: Get Secure Headers
            statusMsg.innerText = 'Fetching secure headers...';
            const headers = await glia.getRequestHeaders();
            headers['Content-Type'] = 'application/json';

            // C: Call Middleware Function
            statusMsg.innerText = 'Sending request to Middleware...';
            const response = await fetch(functionURL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ 
                    payload: { action: 'manual_button_click' } 
                })
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            // D: Handle Success
            const data = await response.json();
            console.log('Middleware Response:', data);
            
            statusMsg.innerText = 'Success! Data received.';
            statusMsg.style.color = 'green';

        } catch (error) {
            // This will now catch both "Glia missing" AND "Fetch failed"
            console.error('Process Failed:', error);
            statusMsg.innerText = error.message;
            statusMsg.style.color = 'red';
        }
    });
});