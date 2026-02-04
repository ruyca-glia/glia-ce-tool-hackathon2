// ==========================================
// 1. GLOBAL CONFIGURATION & STATE
// ==========================================
const outputConsole = document.getElementById('output');
let latestIssues = [];

// Glia Function Endpoints
const jiraIssuesUrl = 'https://api.glia.com/integrations/709f8159-7814-432c-b5ac-154aef00f456/endpoint';
const auth0LookupUrl = 'https://api.glia.com/integrations/8c29e917-f94a-4639-bb8d-583882802ec1/endpoint';
const auth0UserMgmtUrl = 'https://api.glia.com/integrations/62d4f67f-129c-44b1-9fa7-67822311b09b/endpoint';
const auth0RoleSyncUrl = 'https://api.glia.com/integrations/1fa17d02-6d91-482a-8d4d-b8b122345cb7/endpoint';

// ==========================================
// 2. DATA PARSING & BUSINESS RULES (HELPERS)
// ==========================================

function extractEmails(text) {
    if (!text) return [];
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?:com|org|net)/g;
    return (text.match(emailRegex) || []).map(email => email.toLowerCase().trim());
}

function calculateUserRoles(email, baseRoles, uatEmails, prodEmails) {
    let finalRoles = [...baseRoles];
    const isGlia = email.endsWith('@glia.com');

    if (!isGlia) {
        finalRoles = finalRoles.filter(role => 
            !role.includes("internal_customer_success") && 
            !role.includes("internal_engineering_product")
        );
    }
    if (!uatEmails.includes(email)) finalRoles = finalRoles.filter(role => !role.includes("cms_exporter"));
    if (!prodEmails.includes(email)) finalRoles = finalRoles.filter(role => !role.includes("cms_publisher"));

    return finalRoles;
}

function calculateUserMetadata(email, botCodesRaw, timezone) {
    const isGlia = email.endsWith('@glia.com');
    const botCodes = botCodesRaw.split(',').map(s => s.trim()).filter(s => s !== "");

    return {
        clientIds: isGlia ? [] : botCodes,
        portal: { cms: botCodes },
        timezone: timezone
    };
}

// ==========================================
// 3. INITIALIZATION & UI RENDERING
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    clearActivePanels();
    getFunctionResponse();
});

async function getFunctionResponse() {
    logOutput("Starting Glia API call to fetch Jira tickets...", true);
    try {
        const glia = await window.getGliaApi({ version: 'v1' });
        const headers = await glia.getRequestHeaders();
        headers['Content-Type'] = 'application/json';

        const response = await fetch(jiraIssuesUrl, { method: 'POST', headers: headers, body: JSON.stringify({}) });
        const result = await response.json();
        if (result.success) {
            latestIssues = result.issues;
            populateTicketTable(latestIssues);
            logOutput("Table successfully updated with Jira data.");
        }
    } catch (error) { console.error("Jira fetch error:", error); }
}

function populateTicketTable(issues) {
    const tableBody = document.getElementById("ticketTableBody");
    if (!tableBody) return;
    tableBody.innerHTML = "";
    issues.forEach((issue, index) => {
        const priority = issue.customField !== "N/A" ? issue.customField.split(' - ')[0] : "N/A";
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="https://glia.atlassian.net/browse/${issue.key}" target="_blank" style="font-weight:bold; color:var(--primary);">${issue.key}</a></td>
            <td>${priority}</td>
            <td>Grant GVA Access</td> 
            <td><span class="badge badge-info">Open</span></td>
            <td><button class="btn btn-primary go-button" onclick="handleGoClick(${index})">GO!</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function handleGoClick(index) {
    const issue = latestIssues[index];
    const formData = issue.formData || {};
    clearActivePanels();
    const ticketRow = document.querySelectorAll('.go-button')[index].closest('tr');
    const collapsibleRow = document.createElement('tr');
    collapsibleRow.className = 'collapsible-row';
    const masterUsers = extractEmails(formData["User’s Full Name + User Email"]);

    collapsibleRow.innerHTML = `
        <td colspan="5">
            <div class="details-container">
                <div class="details-grid">
                    <dt>Summary</dt><dd>${issue.summary}</dd>
                    <dt>Detected Users</dt><dd>${masterUsers.length} users: ${masterUsers.join(', ')}</dd>
                </div>
                <div class="approval-container">
                    <label><input type="checkbox" class="approval-checkbox" onclick="handleApprovalCheck(this)"> Verify ${masterUsers.length} users and proceed.</label>
                </div>
                <div class="trigger-button-container">
                    <button class="pure-button purple-button trigger-button" disabled onclick="handleTriggerClick(this, ${index})">Trigger Automation</button>
                </div>
            </div>
        </td>
    `;
    ticketRow.parentNode.insertBefore(collapsibleRow, ticketRow.nextSibling);
}

// ==========================================
// 4. AUTOMATION LOGIC (BATCH ORCHESTRATOR)
// ==========================================

async function handleTriggerClick(button, index) {
    const issue = latestIssues[index];
    const formData = issue.formData || {};
    const masterEmails = extractEmails(formData["User’s Full Name + User Email"]);
    const uatEmails = extractEmails(formData["Users who should be able to export to UAT"]);
    const prodEmails = extractEmails(formData["Users who should be able to publish to prod"]);
    const baseRoles = formData["Roles needed to be added for Auth0"] || [];
    const botCodes = formData["Bot Code"] || "";
    const timezone = (Array.isArray(formData["Timezone"]) ? formData["Timezone"][0] : "UTC").split(" for ")[0];

    button.disabled = true;
    logOutput(`========================================`, true);
    logOutput(`🚀 STARTING BATCH PROCESS FOR ${masterEmails.length} USERS`);
    logOutput(`Ticket: ${issue.key}`);
    logOutput(`========================================\n`);

    try {
        const glia = await window.getGliaApi({ version: 'v1' });
        const headers = await glia.getRequestHeaders();
        headers['Content-Type'] = 'application/json';

        for (let i = 0; i < masterEmails.length; i++) {
            const email = masterEmails[i];
            const userNum = i + 1;
            
            button.innerHTML = `Processing ${userNum}/${masterEmails.length}...`;
            logOutput(`[User ${userNum}/${masterEmails.length}] 📧 Email: ${email}`);

            // 1. Lookup
            const lookupRes = await fetch(auth0LookupUrl, { method: 'POST', headers, body: JSON.stringify({ userEmail: email }) });
            const lookupData = await lookupRes.json();

            // 2. Logic Calculation
            const userRoles = calculateUserRoles(email, baseRoles, uatEmails, prodEmails);
            const userMetadata = calculateUserMetadata(email, botCodes, timezone);
            const userPackage = { email, roles: userRoles, metadata: userMetadata, timezone };

            // 3. Branching
            if (lookupData.found) {
                logOutput(`   -> User already exists. Update in progress...`);
                await triggerUserUpdate(userPackage, lookupData.profile, issue, headers);
            } else {
                logOutput(`   -> User does not exist. Creation in progress...`);
                await triggerUserCreation(userPackage, issue, headers);
            }
            
            logOutput(`   -> ✅ Process completed! Validate the user in Auth0.`);
            logOutput(`----------------------------------------`);
        }

        button.innerHTML = 'All Complete ✅';
        logOutput(`\n✨ BATCH JOB FINISHED SUCCESSFULLY`);
    } catch (error) {
        logOutput(`\n❌ CRITICAL ERROR: ${error.message}`);
        button.innerHTML = 'Retry';
        button.disabled = false;
    }
}

async function triggerUserUpdate(user, profile, issue, headers) {
    const mgmtRes = await fetch(auth0UserMgmtUrl, { method: 'POST', headers, body: JSON.stringify({ action: "update", user, profile, issue }) });
    const mgmtData = await mgmtRes.json();
    logOutput(`   -> Created/Updated Bot Codes and Timezones`);

    logOutput(`   -> Syncing Roles...`);
    const roleRes = await fetch(auth0RoleSyncUrl, { method: 'POST', headers, body: JSON.stringify({ userId: profile.user_id, roles: user.roles }) });
    if (roleRes.ok) logOutput(`   -> Roles updated successfully`);
}

async function triggerUserCreation(user, issue, headers) {
    const mgmtRes = await fetch(auth0UserMgmtUrl, { method: 'POST', headers, body: JSON.stringify({ action: "add", user, issue }) });
    const mgmtData = await mgmtRes.json();
    logOutput(`   -> New account created. Metadata applied.`);

    logOutput(`   -> Syncing Roles...`);
    const roleRes = await fetch(auth0RoleSyncUrl, { method: 'POST', headers, body: JSON.stringify({ userId: mgmtData.auth0_user_id, roles: user.roles }) });
    if (roleRes.ok) logOutput(`   -> Roles assigned successfully`);
    logOutput(`   -> 🔑 Temporary Password generated for ${user.email}`);
}

// ==========================================
// 5. UTILITIES
// ==========================================

function handleApprovalCheck(checkbox) {
    checkbox.closest('.details-container').querySelector('.trigger-button').disabled = !checkbox.checked;
}

function clearActivePanels() {
    const existingPanel = document.querySelector('.collapsible-row');
    if (existingPanel) existingPanel.remove();
}

function logOutput(msg, clear = false) {
    if (clear) outputConsole.innerText = '';
    outputConsole.innerText += msg + "\n";
    outputConsole.scrollTop = outputConsole.scrollHeight;
}