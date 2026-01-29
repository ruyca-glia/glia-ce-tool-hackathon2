// /static/js/client-app.js

const functionURLOffboarding = 'https://api.glia.com/integrations/d81f89fb-4fac-4416-9c7f-891342f4ac9b/endpoint';


document.addEventListener("DOMContentLoaded", () => {
    // UI References
    const confirmBtn = document.getElementById('confirm-btn');
    const runBtn = document.getElementById('run-btn');
    const resetBtn = document.getElementById('reset-btn');
    const scriptSelect = document.getElementById('script-select');
    const dynamicContainer = document.getElementById('dynamic-fields');
    const form = document.getElementById('script-form');
    const outputConsole = document.getElementById('output');


    console.log("Event listener loaded");
    // --- STEP 1: Confirm Selection ---
    confirmBtn.addEventListener('click', () => {
        const selectedScript = scriptSelect.value;
        console.log("selected script")
        console.log(selectedScript)
        // Reset dynamic area
        dynamicContainer.innerHTML = '';
        dynamicContainer.style.display = 'none';
        runBtn.disabled = true;

        if (!selectedScript) {
            alert("Please choose a script first.");
            return;
        }

        // Logic for "client_offboarding"
        if (selectedScript === 'client_offboarding') {
            dynamicContainer.style.display = 'block';
            
            // Create Label for SiteID
            const label = document.createElement('label');
            label.innerText = "Target Site ID (Required)";
            label.style.fontWeight = "bold";
            label.htmlFor = "site_id_input";

            // Create Label for API Token
            const labelToken = document.createElement('labelToken');
            labelToken.innerText = "API Token for Client Assit";
            labelToken.style.fontWeight = "bold";
            labelToken.htmlFor = "api_token_input";

            // Create Input for SiteID
            const input = document.createElement('input');
            input.type = "text";
            input.id = "site_id_input";
            input.placeholder = "e.g. 12345678-abcd-1234-abcd-1234567890ab";
            input.required = true;
            input.style.width = "100%";
            input.style.marginTop = "5px";

            // Create Input for API Token
            const inputToken = document.createElement('input');
            inputToken.type = "text";
            inputToken.id = "api_token_input";
            inputToken.placeholder = "e.g. fAFEnmsfUHk38fn3";
            inputToken.required = true;
            inputToken.style.width = "100%";
            inputToken.style.marginTop = "5px";

            // Append to DOM
            dynamicContainer.appendChild(label);
            dynamicContainer.appendChild(input);
            dynamicContainer.appendChild(labelToken);
            dynamicContainer.appendChild(inputToken);
            
            // Enable Run button immediately 
            runBtn.disabled = false;
        } else {
            // For other scripts that don't need input, just enable run
            runBtn.disabled = false;
        }
    });

    // --- Reset Handler ---
    resetBtn.addEventListener('click', () => {
        dynamicContainer.innerHTML = '';
        dynamicContainer.style.display = 'none';
        runBtn.disabled = true;
        logOutput("Waiting for script execution...", true);
    });

    // --- STEP 2: Run Script ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const scriptName = scriptSelect.value;
        const args = document.getElementById('args').value;
        
        logOutput(`Starting execution: ${scriptName}...`, true);

        // Prepare Payload
        let payload = {
            action: scriptName,
        };
        
        // Capture Site ID if it exists in DOM
        const siteIdInput = document.getElementById('site_id_input');
        if (siteIdInput) {
            if (!siteIdInput.value.trim()) {
                logOutput("ERROR: Site ID is missing!");
                return;
            }
            payload.site_id = siteIdInput.value.trim();
        }

        try {
            // 1. Initialize Glia
            if (!window.getGliaApi) throw new Error("Glia API not detected.");
            const glia = await window.getGliaApi({ version: 'v1' });
            
            // 2. Headers
            logOutput("Authenticating...");
            const headers = await glia.getRequestHeaders();
            headers['Content-Type'] = 'application/json';

            // 3. Network Request
            logOutput(`Sending request to Middleware...`);
            let response;

            // Check the value from the dropdown/input
            if (scriptName === 'client_offboarding') {
                response = await fetch(functionURLOffboarding, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(payload)
                });
            } else {
                // Handle case where script name doesn't match or add other scripts here
                logOutput("No matching script action found.");
                return;
            }
            
            if (!response.ok) throw new Error(`Server status: ${response.status}`);

            const data = await response.json();
            
            // 4. Display Results
            logOutput("----------------------------------------");
            logOutput("EXECUTION COMPLETE");
            logOutput("----------------------------------------");
            logOutput(JSON.stringify(data, null, 2));

        } catch (error) {
            console.error(error);
            logOutput(`\nCRITICAL ERROR: ${error.message}`);
        }
    });

    // Helper to write to the right-side console
    function logOutput(msg, clear = false) {
        if (clear) outputConsole.innerText = '';
        outputConsole.innerText += msg + "\n";
    }
});