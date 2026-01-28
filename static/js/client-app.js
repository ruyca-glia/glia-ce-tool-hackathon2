// /static/js/client-app.js

const functionURL = 'https://api.glia.com/integrations/d81f89fb-4fac-4416-9c7f-891342f4ac9b/endpoint';

document.addEventListener("DOMContentLoaded", () => {
    const scriptSelect = document.getElementById('script-select');
    const form = document.getElementById('script-form');
    const outputConsole = document.getElementById('output');
    
    // Container for dynamic inputs
    const dynamicInputContainer = document.createElement('div');
    dynamicInputContainer.className = "form-group";
    dynamicInputContainer.id = "dynamic-inputs";
    // Insert it after the script selector dropdown
    scriptSelect.closest('.form-group').after(dynamicInputContainer);

    // --- A. Handle Dropdown Change ---
    scriptSelect.addEventListener('change', (e) => {
        // Clear previous dynamic inputs
        dynamicInputContainer.innerHTML = '';
        
        if (e.target.value === 'client_offboarding') {
            // Inject Site ID Input
            const label = document.createElement('label');
            label.innerText = "Target Site ID";
            label.setAttribute('for', 'site_id');
            
            const input = document.createElement('input');
            input.type = "text";
            input.id = "site_id";
            input.name = "site_id";
            input.placeholder = "e.g., 11111111-2222-3333-4444-555555555555";
            input.required = true; // Make it mandatory
            
            dynamicInputContainer.appendChild(label);
            dynamicInputContainer.appendChild(input);
        }
    });

    // --- B. Handle Form Submission ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop standard HTML form submit
        
        const selectedScript = scriptSelect.value;
        if (!selectedScript) return;

        logOutput(`Starting execution for: ${selectedScript}...`);

        try {
            // 1. Gather Data
            let payload = {
                action: selectedScript,
                args: document.getElementById('args').value
            };

            // If we are offboarding, grab the Site ID
            if (selectedScript === 'client_offboarding') {
                const siteId = document.getElementById('site_id').value;
                if (!siteId) throw new Error("Site ID is required for this script.");
                payload.site_id = siteId;
            }

            // 2. Initialize Glia (Lazy Load)
            if (!window.getGliaApi) throw new Error("Glia API not found.");
            
            logOutput("Initializing Glia API...");
            const glia = await window.getGliaApi({ version: 'v1' });
            
            logOutput("Fetching secure headers...");
            const headers = await glia.getRequestHeaders();
            headers['Content-Type'] = 'application/json';

            // 3. Call Middleware
            logOutput("Sending request to Middleware...");
            const response = await fetch(functionURL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`Server Error: ${response.status}`);

            const data = await response.json();
            
            // 4. Pretty Print Result
            logOutput("SUCCESS:\n" + JSON.stringify(data, null, 2));

        } catch (error) {
            console.error(error);
            logOutput(`ERROR: ${error.message}`);
        }
    });

    function logOutput(msg) {
        // Append text to the existing console output
        outputConsole.innerText = msg;
    }
});