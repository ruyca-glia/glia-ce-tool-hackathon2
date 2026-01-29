let latestIssues = []; // Global variable for list of issues
const automationUrl = 'https://api.glia.com/integrations/8c29e917-f94a-4639-bb8d-583882802ec1/endpoint';


//Logica para tabla de Tickets - Actions
// --- 1. MOCK DATA & CONFIG ---
const MOCK_TICKETS = 3;
const PRIORITIES = ["High", "Medium", "Low"];
const LOG_MESSAGES = [
    "Verifying Jira token... Success",
    "Fetching provided settings... Success",
    "Accessing AWS Secrets Vault... Success",
    "Accessing GVA Chat Adapter... Success",
    "Updating API key and Secret... Success",
    "Accessing GVA Core... Success",
    "Fetching config for glia-phone-gva-uat .... Success",
    "Updating Site ID and Human queue.... Success",
    "Refreshing Glia Support Operator API Key... Success",
    "Posting comment on Jira with success comment... Success",
    "Resolving Jira Ticket.... Success",
    "All complete!"
];

/** Populates the main table with mock ticket data */
function populateTicketTable(issues) {
    const tableBody = document.getElementById("ticketTableBody");
    if (!tableBody) return; // Guard clause para evitar errores
    
    tableBody.innerHTML = ""; 

    issues.forEach((issue, index) => {
        const priority = issue.customField !== "N/A" ? issue.customField.split(' - ')[0] : "N/A";
        const jiraLink = `https://glia.atlassian.net/browse/${issue.key}`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="${jiraLink}" target="_blank" style="font-weight:bold; color:var(--primary);">${issue.key}</a></td>
            <td>${priority}</td>
            <td>Grant GVA Access</td> <td><span class="badge badge-info">Open</span></td>
            <td>
                <button class="btn btn-primary go-button" onclick="handleGoClick(${index})">
                    GO!
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/** Handles all clicks inside the table body */
function handleTableClick(event) {
    const target = event.target;
    if (target.classList.contains('go-button')) {
        handleGoClick(target);
    } else if (target.classList.contains('trigger-button')) {
        handleTriggerClick(target);
    } else if (target.classList.contains('approval-checkbox')) { // <-- ADDED
        handleApprovalCheck(target);
    }
}

/**
 * Se activa al dar clic en GO! y llena el panel de detalles
 */
function handleGoClick(index) {
    const issue = latestIssues[index];
    const formData = issue.formData || {};
    clearActivePanels();

    const allButtons = document.querySelectorAll('.go-button');
    const ticketRow = allButtons[index].closest('tr');
    const collapsibleRow = document.createElement('tr');
    collapsibleRow.className = 'collapsible-row';

    const rolesHtml = Array.isArray(formData["Roles needed to be added for Auth0"])
        ? `<ul>${formData["Roles needed to be added for Auth0"].map(r => `<li>${r}</li>`).join('')}</ul>`
        : "N/A";

    collapsibleRow.innerHTML = `
        <td colspan="5">
            <div class="details-container">
                <div class="details-grid">
                    <dt>Summary</dt><dd>${issue.summary}</dd>
                    <dt>Bot Code</dt><dd><code>${formData["Bot Code"] || 'N/A'}</code></dd>
                    <dt>User Email</dt><dd>${formData["User’s Full Name + User Email"] || 'N/A'}</dd>
                    <dt>Roles</dt><dd>${rolesHtml}</dd>
                </div>
                
                <div class="approval-container">
                    <label><input type="checkbox" class="approval-checkbox" onclick="handleApprovalCheck(this)"> This looks great!</label>
                </div>
                
                <div class="trigger-button-container">
                    <button class="pure-button purple-button trigger-button" disabled onclick="handleTriggerClick(this, ${index})">
                        Trigger Automation
                    </button>
                </div>
            </div>
            <div class="logs-panel"></div>
        </td>
    `;
    ticketRow.parentNode.insertBefore(collapsibleRow, ticketRow.nextSibling);
}

/** * Triggers the Auth0 call with the users email
 */
async function handleTriggerClick(button, index) {
    const issue = latestIssues[index];
    const fullEmailString = issue.formData["User’s Full Name + User Email"] || "";
    
    // Extracting the email from the string "Name - email@glia.com"
    const email = fullEmailString.includes(" - ") 
        ? fullEmailString.split(" - ")[1] 
        : fullEmailString;

    // UI State
    button.disabled = true;
    button.innerHTML = 'Invoking... <div class="loader"></div>';

    try {
        // 1. Get Glia headers
        const glia = await window.getGliaApi({ version: 'v1' });
        const headers = await glia.getRequestHeaders();
        headers['Content-Type'] = 'application/json';

        // 2. API Call to auth0_retrieveuser function
        // const response = await fetch(automationUrl, {
        //     method: 'POST',
        //     headers: headers,
        //     body: JSON.stringify({ 
        //         userEmail: email,
        //         ticketKey: issue.key,
        //         botCode: issue.formData["Bot Code"]
        //     })
        // });

        const response = await fetch(automationUrl, {
            method: 'POST',
            headers: headers
        });


        const data = await response.json();

        if (response.ok) {
            // 3. Si la API responde bien, iniciamos la simulación visual de logs
            console.log(data)
        } else {
            throw new Error(data.error || "Fallo en la automatización");
        }

    } catch (error) {
        console.error("Error detonando automatización:", error);
        button.innerHTML = 'Error';
        alert("No se pudo iniciar la automatización: " + error.message);
    }
}

/** NEW: Enables or disables the Trigger button based on the checkbox state */
function handleApprovalCheck(checkbox) {
    const container = checkbox.closest('.details-container');
    const triggerButton = container.querySelector('.trigger-button');
    triggerButton.disabled = !checkbox.checked;
}

/** Finds and removes any open details panel to keep the UI clean */
function clearActivePanels() {
    const existingPanel = document.querySelector('.collapsible-row');
    if (existingPanel) {
        existingPanel.remove();
    }
}

// Get Info from Jira - Work in Progress 
const functionUrl = 'https://api.glia.com/integrations/709f8159-7814-432c-b5ac-154aef00f456/endpoint';

// Calling my function
async function getFunctionResponse() {
    console.log("Iniciando llamada a Glia API...");
    try {
        const glia = await window.getGliaApi({ version: 'v1' });
        const headers = await glia.getRequestHeaders();
        headers['Content-Type'] = 'application/json';

        const response = await fetch('https://api.glia.com/integrations/709f8159-7814-432c-b5ac-154aef00f456/endpoint', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({})
        });

        const resultado = await response.json();

        if (resultado.success) {
            latestIssues = resultado.issues; // Guardamos en la variable global
            populateTicketTable(latestIssues);
            console.log("Tabla actualizada con éxito.");
        }
    } catch (error) {
        console.error("Error crítico en la comunicación con la API:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Si queremos que cargue apenas entras a la vista de automatización:
    getFunctionResponse(); 
});