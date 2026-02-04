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
            const labelToken = document.createElement('label');
            labelToken.innerText = "API Token for Client Assist";
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

            // Logic for Client Onboarding 
        } else if (selectedScript === 'client_onboarding'){
            dynamicContainer.style.display = 'block';

            // RADIO GROUP 1 
            const radioGroup1Container = document.createElement('p');
            radioGroup1Container.style.marginTop = '15px';
            radioGroup1Container.style.padding = '10px';
            radioGroup1Container.style.border = '1px solid #ccc';
            radioGroup1Container.style.borderRadius = "5px";

            const radioGroup1Label = document.createElement('label');
            radioGroup1Label.innerText = "Select Digital Package"; 
            radioGroup1Label.style.fontWeight = "bold";
            radioGroup1Label.style.display = "block";
            radioGroup1Label.style.marginBottom = "8px";
            radioGroup1Container.appendChild(radioGroup1Label);

            const group1Options = ["Digital 3", "Digital 5", "Digital 7"];
            group1Options.forEach((optionText, index) => {
                const wrapper = document.createElement('div');
                wrapper.style.display = 'inline-block';
                wrapper.style.marginRight = "15px;"

                const radioInput = document.createElement('input');
                radioInput.type = "radio";
                radioInput.name = "radio_group_1";
                radioInput.id = `group1_opt${index}`;
                radioInput.value = optionText.toLowerCase().replace(" ", "-");

                const radioLabel = document.createElement('label');
                radioLabel.htmlFor = `group1_opt${index}`;
                radioLabel.innerText = optionText; 
                radioLabel.style.marginLeft = "5px";
                radioLabel.style.cursor = "pointer";

                wrapper.appendChild(radioInput);
                wrapper.appendChild(radioLabel);
                radioGroup1Container.appendChild(wrapper);
            });

            // RADIO GROUP 2
            const radioGroup2Container = document.createElement('div');
            radioGroup2Container.style.marginTop = '15px';
            radioGroup2Container.style.padding = '10px';
            radioGroup2Container.style.border = '1px solid #ccc';
            radioGroup2Container.style.borderRadius = "5px";

            const radioGroup2Label = document.createElement('label');
            radioGroup2Label.innerText = "Select Voice Package"; 
            radioGroup2Label.style.fontWeight = "bold";
            radioGroup2Label.style.display = "block";
            radioGroup2Label.style.marginBottom = "8px";
            radioGroup2Container.appendChild(radioGroup1Label);

            const group2Options = ["Voice 3", "Voice 5", "Voice 7"];
            group2Options.forEach((optionText, index) => {
                const wrapper = document.createElement('div');

                wrapper.style.display = 'inline-block';
                wrapper.style.marginRight = "15px;"

                const radioInput = document.createElement('input');
                radioInput.type = "radio";
                radioInput.name = "radio_group_2";
                radioInput.id = `group2_opt${index}`;
                radioInput.value = optionText.toLowerCase().replace(" ", "-");

                const radioLabel = document.createElement('label');
                radioLabel.htmlFor = `group2_opt${index}`;
                radioLabel.innerText = optionText; 
                radioLabel.style.marginLeft = "5px";
                radioLabel.style.cursor = "pointer";

                wrapper.appendChild(radioInput);
                wrapper.appendChild(radioLabel);
                radioGroup2Container.appendChild(wrapper);
            });

            // append to DOM
            dynamicContainer.appendChild(radioGroup1Container);
            dynamicContainer.appendChild(radioGroup2Container);
        }
        else {
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

        // Caputre API Token ID if it exists in DOM
        const apiTokenInput = document.getElementById("api_token_input");
        if (apiTokenInput) {
            if (!apiTokenInput.value.trim()) {
                logOutput("ERROR: API Token is missing!");
                return;
            }
            payload.api_token = apiTokenInput.value.trim();
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