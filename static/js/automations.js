
// Lógica para cambiar entre vistas
function showView(idVista, event) {
    if (event) event.preventDefault(); // Esto detiene la navegación del enlace

    // 1. Ocultar todas las vistas
    document.getElementById('main-view').classList.add('hidden');
    document.getElementById('onboarding-main-view').classList.add('hidden');
    document.getElementById('automation-main-view').classList.add('hidden');

    // 2. Mostrar la vista deseada
    document.getElementById(idVista).classList.remove('hidden');
}


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
    tableBody.innerHTML = ""; // Limpiar carga previa

    issues.forEach((issue, index) => {
        const priority = issue.customField !== "N/A" ? issue.customField.split(' - ')[0] : "N/A";
        const jiraLink = `https://glia.atlassian.net/browse/${issue.key}`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="${jiraLink}" target="_blank" style="font-weight:bold; color:var(--primary);">${issue.key}</a></td>
            <td>${priority}</td>
            <td>Grant GVA Access/td>
            <td><span class="badge badge-info">Open</span></td>
            <td>
                <button class="pure-button purple-button go-button" onclick="handleGoClick(${index})">
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
 * Se activa al dar clic en GO! y llena el panel de detalles con la data de Jira
 */
function handleGoClick(index) {
    // 1. Obtenemos el ticket específico de nuestra variable global
    const issue = latestIssues[index];
    const formData = issue.formData || {};

    // Limpiamos paneles abiertos antes de mostrar el nuevo
    clearActivePanels();

    // 2. Buscamos la fila para insertar el panel justo debajo
    const allButtons = document.querySelectorAll('.go-button');
    const ticketRow = allButtons[index].closest('tr');
    
    const collapsibleRow = document.createElement('tr');
    collapsibleRow.className = 'collapsible-row';

    // 3. Procesamos los Roles (que son un Array) para mostrarlos como lista
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
                    <dt>Timezone</dt><dd>${formData["Timezone"] || 'N/A'}</dd>
                </div>
                
                <div class="approval-container">
                    <label><input type="checkbox" class="approval-checkbox"> This looks great! </label>
                </div>
                
                <div class="trigger-button-container">
                    <button class="pure-button purple-button trigger-button" disabled onclick="handleTriggerClick(this)">
                        Trigger Automation
                    </button>
                </div>
            </div>
            <div class="logs-panel"></div>
        </td>
    `;
    ticketRow.parentNode.insertBefore(collapsibleRow, ticketRow.nextSibling);
}

/** Starts the logging simulation when "Trigger" is clicked */
function handleTriggerClick(button) {
    button.disabled = true;
    button.innerHTML = 'Processing... <div class="loader"></div>';

    const logsPanel = button.closest('td').querySelector('.logs-panel');
    logsPanel.innerHTML = `
            <div class="logs-container">
            <div class="progress-bar"><div class="progress-bar-inner"></div></div>
            <div class="log-lines"></div>
            </div>
        `;

    const logLinesContainer = logsPanel.querySelector('.log-lines');
    const progressBarInner = logsPanel.querySelector('.progress-bar-inner');
    let logIndex = 0;

    const logInterval = setInterval(() => {
        if (logIndex < LOG_MESSAGES.length) {
            const p = document.createElement('p');
            p.className = 'log-line';
            p.textContent = LOG_MESSAGES[logIndex];
            logLinesContainer.appendChild(p);

            const progress = ((logIndex + 1) / LOG_MESSAGES.length) * 100;
            progressBarInner.style.width = `${progress}%`;

            logIndex++;
        } else {
            clearInterval(logInterval);
            // Don't re-enable the button after one run
        }
    }, 500);
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
    const glia = await window.getGliaApi({ version: 'v1' });
    const headers = await glia.getRequestHeaders();
    headers['Content-Type'] = 'application/json';

    const response = await fetch(functionUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({})
    });

    const resultado = await response.json();

    if (resultado.success) {
        // 1. Guardamos los issues en nuestra variable global
        latestIssues = resultado.issues;

        // 2. Llamamos a la función para pintar la tabla
        populateTicketTable(latestIssues);

        console.log("Tabla actualizada con", resultado.total, "tickets.");
    } else {
        console.error("Error en la función:", resultado.error);
    }
}