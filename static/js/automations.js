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
// 2. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Initial load of Jira tickets
    clearActivePanels();
    getFunctionResponse();
});

/** Fetches pending tickets from Jira via Glia Function */
async function getFunctionResponse() {
    logOutput("Starting Glia API call to fetch Jira tickets...");
    try {
        const glia = await window.getGliaApi({ version: 'v1' });
        const headers = await glia.getRequestHeaders();
        headers['Content-Type'] = 'application/json';

        const response = await fetch(jiraIssuesUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({})
        });

        const result = await response.json();

        if (result.success) {
            latestIssues = result.issues;
            populateTicketTable(latestIssues);
            logOutput("Table successfully updated with Jira data.");
        }
    } catch (error) {
        console.error("Critical error communicating with Jira API:", error);
    }
}

// ==========================================
// 3. UI RENDERING
// ==========================================

/** Populates the main table with Jira ticket data */
function populateTicketTable(issues) {
    const tableBody = document.getElementById("ticketTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    issues.forEach((issue, index) => {
        const priority = issue.customField !== "N/A" ? issue.customField.split(' - ')[0] : "N/A";
        const jiraLink = `https://glia.atlassian.net/browse/${issue.key}`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="${jiraLink}" target="_blank" style="font-weight:bold; color:var(--primary);">${issue.key}</a></td>
            <td>${priority}</td>
            <td>Grant GVA Access</td> 
            <td><span class="badge badge-info">Open</span></td>
            <td>
                <button class="btn btn-primary go-button" onclick="handleGoClick(${index})">
                    GO!
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/** Expands row to show ticket details and trigger button */
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
                    <label><input type="checkbox" class="approval-checkbox" onclick="handleApprovalCheck(this)"> Everything looks correct. Proceed.</label>
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

// ==========================================
// 4. AUTOMATION LOGIC (CORE)
// ==========================================

/** Main Orchestrator: Lookup user and branch to Update or Creation */
async function handleTriggerClick(button, index) {
    const issue = latestIssues[index];
    const fullEmailString = issue.formData["User’s Full Name + User Email"] || "";
    const email = fullEmailString.includes(" - ") ? fullEmailString.split(" - ")[1] : fullEmailString;

    button.disabled = true;
    button.innerHTML = 'Checking user... <div class="loader"></div>';

    try {
        const glia = await window.getGliaApi({ version: 'v1' });
        const headers = await glia.getRequestHeaders();
        headers['Content-Type'] = 'application/json';

        // Step 1: User Lookup
        const response = await fetch(auth0LookupUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ userEmail: email })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Server communication error");

        // Logic Branching
        if (data.found) {
            logOutput("✅ User found. Updating roles and metadata...");
            button.innerHTML = 'Updating Existing User...';
            await triggerUserUpdate(email, data.profile, issue, index, button);
            logOutput("Process complete for: " + issue.key);
        } else {
            logOutput("⚠️ User not found. Starting creation flow...");
            button.innerHTML = 'Creating New User...';
            await triggerUserCreation(email, issue, index, button);
            logOutput("Process complete for: " + issue.key);
        }
    } catch (error) {
        console.error("Error in automation flow:", error);
        button.innerHTML = 'Retry';
        button.disabled = false;
        alert("Automation failed: " + error.message);
    }
}

/** FLOW A: Update Existing User */
async function triggerUserUpdate(email, profile, issue, index, button) {
    logOutput("Triggering Update for:", email);
    try {
        const glia = await window.getGliaApi({ version: 'v1' });
        const headers = await glia.getRequestHeaders();
        headers['Content-Type'] = 'application/json';

        // 1. Metadata Sync (Bot codes/TZ)
        const response = await fetch(auth0UserMgmtUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ action: "update", email, profile, issue })
        });

        const data = await response.json();
        console.log(data);
        logOutput("Updated bot codes and Time Zones...");
        logOutput("Updating roles...");

        // 2. Role Sync
        const roleResponse = await fetch(auth0RoleSyncUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                userId: profile.user_id,
                roles: issue.formData["Roles needed to be added for Auth0"]
            })
        });

        const roleData = await roleResponse.json();

        if (roleResponse.ok && roleData.success) {
            logOutput("Updated roles successfully");
            button.innerHTML = 'Success ✅';
        } else {
            logOutput("Error updating roles...");
            logOutput("Failed executing automation. Report the issue, please.");
            button.innerHTML = 'Role Error ❌';
        }
    } catch (err) {
        console.error("Update process failed:", err);
    }
}

/** FLOW B: Create New User */
async function triggerUserCreation(email, issue, index, button) {
    logOutput("Triggering Creation for:", email);
    try {
        const glia = await window.getGliaApi({ version: 'v1' });
        const headers = await glia.getRequestHeaders();
        headers['Content-Type'] = 'application/json';

        // 1. Create User via Mgmt Function
        const response = await fetch(auth0UserMgmtUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ action: "add", email, issue })
        });

        const data = await response.json();
        console.log(data);
        logOutput("Updated bot codes and Time Zones...");
        logOutput("Updating roles...");

        // 2. Initial Role Assignment
        const roleResponse = await fetch(auth0RoleSyncUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                userId: data.auth0_user_id,
                roles: issue.formData["Roles needed to be added for Auth0"]
            })
        });

        const roleData = await roleResponse.json();

        if (roleResponse.ok && roleData.success) {
            logOutput("Updated roles successfully");
            button.innerHTML = 'Success ✅';
            alert(`User Created!\nPassword: ${data.generated_password}`);
        } else {
            logOutput("Error updating roles...");
            logOutput("Failed executing automation. Report the issue, please.");
            button.innerHTML = 'Role Error ❌';
        }
    } catch (err) {
        logOutput("Creation process failed:" + err);
    }
}

// ==========================================
// 5. UTILITIES
// ==========================================

function handleApprovalCheck(checkbox) {
    const container = checkbox.closest('.details-container');
    const triggerButton = container.querySelector('.trigger-button');
    triggerButton.disabled = !checkbox.checked;
}

function clearActivePanels() {
    const existingPanel = document.querySelector('.collapsible-row');
    if (existingPanel) {
        existingPanel.remove();
    }
}

// Helper to write to the right-side console
function logOutput(msg, clear = false) {
    if (clear) outputConsole.innerText = '';
    outputConsole.innerText += msg + "\n";
}