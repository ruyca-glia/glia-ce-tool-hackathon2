// /static/js/client-app.js

// 1. Define your Function URL 
const functionURL = 'https://api.glia.com/integrations/c8ee55e8-eebb-4934-bf1f-17fbdcfa69b2/endpoint';

// 2. Initialize the Glia Applet API
// This waits for the Glia environment to be ready
window.getGliaApi({ version: 'v1' }).then(glia => {
    
    console.log('Glia API Initialized'); // Check console for this!

    const button = document.getElementById('runFunction');
    const statusMsg = document.createElement('div'); // To show status on screen
    button.parentNode.appendChild(statusMsg);

    // 3. Attach the click listener INSIDE the Glia promise
    button.addEventListener('click', async () => {
        console.log('Button clicked. Fetching headers...');
        statusMsg.innerText = 'Running...';

        try {
            // A: Get the secure headers from Glia (Magic step!)
            const headers = await glia.getRequestHeaders();
            headers['Content-Type'] = 'application/json';

            // B: Call your Glia Function
            const response = await fetch(functionURL, {
                method: 'POST',
                headers: headers, // Use the auto-generated headers
                body: JSON.stringify({ 
                    payload: { action: 'manual_button_click' } 
                })
            });

            if (!response.ok) {
                throw new Error(`Function failed: ${response.status}`);
            }

            // C: Handle the result
            const data = await response.json();
            console.log('Function Response:', data);
            
            statusMsg.innerText = 'Success! Check Console.';
            statusMsg.style.color = 'green';

        } catch (error) {
            console.error('Error invoking function:', error);
            statusMsg.innerText = 'Error: ' + error.message;
            statusMsg.style.color = 'red';
        }
    });

}).catch(error => {
    // This catches if window.getGliaApi is missing (e.g., running locally)
    console.error('Glia API failed to load. Are you testing locally?', error);
    alert('Glia API not found. If you are running this locally, it will not work without a mock.');
});