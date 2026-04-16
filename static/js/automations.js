// ==========================================
// 1. GLOBAL CONFIGURATION & STATE
// ==========================================
const outputConsole = document.getElementById('output');
let latestIssues = [];
let finalReport = "";

// Glia Function Invoke Endpoints
const jiraIssuesUrl = 'https://api.glia.com/integrations/ad44ca10-a612-4a32-97b1-173bb719618e/endpoint';
const auth0LookupUrl = 'https://api.glia.com/integrations/8c29e917-f94a-4639-bb8d-583882802ec1/endpoint';
const auth0UserMgmtUrl = 'https://api.glia.com/integrations/62d4f67f-129c-44b1-9fa7-67822311b09b/endpoint';
const auth0RoleSyncUrl = 'https://api.glia.com/integrations/1fa17d02-6d91-482a-8d4d-b8b122345cb7/endpoint';
const kvStoreUrl = 'https://api.glia.com/integrations/51a7d532-f34b-4f41-afea-9b966f64a9c6/endpoint'; 

// ==========================================
// 2. DATA PARSING & BUSINESS RULES (HELPERS)
// ==========================================

function extractEmails(text) {
    if (!text) return [];
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?:com|org|net|bank)/g;
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

function calculateUserMetadata(email, botCodesRaw, timezone, existingProfile = null) {
    const isGlia = email.endsWith('@glia.com');
    const newCodes = botCodesRaw.split(',').map(s => s.trim()).filter(s => s !== "");

    const existingClientIds = existingProfile?.user_metadata?.clientIds || [];
    const existingCmsIds = existingProfile?.user_metadata?.portal?.cms || [];

    const mergedClientIds = [...new Set([...existingClientIds, ...newCodes])];
    const mergedCmsIds = [...new Set([...existingCmsIds, ...newCodes])];

    return {
        clientIds: isGlia ? [] : mergedClientIds,
        portal: { cms: mergedCmsIds },
        timezone: timezone
    };
}

// ==========================================
// 3. INITIALIZATION & UI RENDERING
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    clearActivePanels();
    getFunctionResponse();
    fetchRecentExecutions(); // Load the KV Store table on load
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
    } catch (error) { 
        console.error("Critical error communicating with Jira API:", error); 
    }
}

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
            <td><button class="btn btn-primary go-button" onclick="handleGoClick(${index})">View More</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function handleGoClick(index) {
    const issue = latestIssues[index];
    const formData = issue.formData || {};
    clearActivePanels();

    const allButtons = document.querySelectorAll('.go-button');
    const ticketRow = allButtons[index].closest('tr');
    const collapsibleRow = document.createElement('tr');
    collapsibleRow.className = 'collapsible-row';

    const usersList = extractEmails(formData["User’s Full Name + User Email"]);
    const usersHtml = usersList.length > 0 ? `<ul>${usersList.map(email => `<li>${email}</li>`).join('')}</ul>` : "N/A";
    const rolesHtml = Array.isArray(formData["Roles needed to be added for Auth0"])
        ? `<ul>${formData["Roles needed to be added for Auth0"].map(r => `<li>${r}</li>`).join('')}</ul>` : "N/A";
    const timezoneDisplay = (Array.isArray(formData["Timezone"]) ? formData["Timezone"][0] : formData["Timezone"]) || "N/A";

    collapsibleRow.innerHTML = `
        <td colspan="5">
            <div class="details-container">
                <div class="details-grid">
                    <dt>Summary</dt><dd>${issue.summary}</dd>
                    <dt>Bot Code</dt><dd><code>${formData["Bot Code"] || 'N/A'}</code></dd>
                    <dt>Users Found</dt><dd>${usersHtml}</dd>
                    <dt>Roles</dt><dd>${rolesHtml}</dd>
                    <dt>Timezone</dt><dd>${timezoneDisplay}</dd>
                </div>
                <div class="approval-container">
                    <label><input type="checkbox" class="approval-checkbox" onclick="handleApprovalCheck(this)"> Everything looks correct. Proceed.</label>
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
// 4. AUTOMATION LOGIC & SUMMARY TABLE
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

    const batchSummary = []; 
    button.disabled = true;
    finalReport = ""; // Reset final report string
    
    logOutput(`========================================`, true);
    logOutput(`🚀 STARTING BATCH PROCESS FOR ${masterEmails.length} USERS`);
    logOutput(`Ticket: ${issue.key}`);
    logOutput(`========================================\n`);

    let executionStatus = "Success"; 

    try {
        const glia = await window.getGliaApi({ version: 'v1' });
        const headers = await glia.getRequestHeaders();
        headers['Content-Type'] = 'application/json';

        for (let i = 0; i < masterEmails.length; i++) {
            const email = masterEmails[i];
            const userNum = i + 1;
            let resultEntry = { email, action: "", status: "⌛" };
            
            button.innerHTML = `Processing ${userNum}/${masterEmails.length}...`;
            logOutput(`[User ${userNum}/${masterEmails.length}] 📧 Email: ${email}`);

            const lookupRes = await fetch(auth0LookupUrl, { method: 'POST', headers, body: JSON.stringify({ userEmail: email }) });
            const lookupData = await lookupRes.json();

            const userRoles = calculateUserRoles(email, baseRoles, uatEmails, prodEmails);
            const userMetadata = calculateUserMetadata(email, botCodes, timezone, lookupData.found ? lookupData.profile : null);
            const userPackage = { email, roles: userRoles, metadata: userMetadata, timezone };

            if (lookupData.found) {
                logOutput(`   -> User already exists. Merging metadata...`);
                resultEntry.action = "Update";
                await triggerUserUpdate(userPackage, lookupData.profile, issue, headers);
            } else {
                logOutput(`   -> User does not exist. Creating profile...`);
                resultEntry.action = "Creation";
                await triggerUserCreation(userPackage, issue, headers);
            }
            
            resultEntry.status = "✅";
            batchSummary.push(resultEntry);
            logOutput(`   -> ✅ Process completed!`);
            logOutput(`----------------------------------------`);
        }
        
        logOutput(`\nBATCH JOB FINISHED`);
        renderSummaryTable(batchSummary); 

        // Trigger KV Store Save Event
        await saveExecutionLog(issue.key, executionStatus, headers);

    } catch (error) {
        logOutput(`\n❌ CRITICAL ERROR: ${error.message}`);
        button.innerHTML = 'Retry';
        button.disabled = false;
        executionStatus = "Failed";
        
        // Trigger KV Store Save Event for Failed executions too
        try {
            const glia = await window.getGliaApi({ version: 'v1' });
            const headers = await glia.getRequestHeaders();
            headers['Content-Type'] = 'application/json';
            await saveExecutionLog(issue.key, executionStatus, headers);
        } catch(e) { console.error("Could not save failed log:", e); }
    }
}

function renderSummaryTable(summary) {
    let tableHtml = `
    <div style="margin-top: 20px; border-top: 2px solid #fff; padding-top: 10px;">
        <h4 style="color: #00d1b2;">Automation Summary Report</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px;">
            <thead>
                <tr style="border-bottom: 1px solid #555; text-align: left;">
                    <th style="padding: 5px;">User</th><th style="padding: 5px;">Action</th><th style="padding: 5px;">Status</th>
                </tr>
            </thead>
            <tbody>`;
    summary.forEach(item => {
        tableHtml += `<tr style="border-bottom: 1px solid #333;"><td style="padding: 5px;">${item.email}</td><td style="padding: 5px;">${item.action}</td><td style="padding: 5px; text-align: center;">${item.status}</td></tr>`;
    });
    tableHtml += `</tbody></table></div>`;
    const summaryDiv = document.createElement('div');
    summaryDiv.innerHTML = tableHtml;
    outputConsole.appendChild(summaryDiv);
    outputConsole.scrollTop = outputConsole.scrollHeight;
    concatTexts("Summary table rendered internally.");
}

async function triggerUserUpdate(user, profile, issue, headers) {
    const mgmtRes = await fetch(auth0UserMgmtUrl, { method: 'POST', headers, body: JSON.stringify({ action: "update", user, profile, issue }) });
    await mgmtRes.json();
    logOutput(`   -> Metadata merged: ${user.metadata.portal.cms.length} bot(s) total.`);
}

async function triggerUserCreation(user, issue, headers) {
    const mgmtRes = await fetch(auth0UserMgmtUrl, { method: 'POST', headers, body: JSON.stringify({ action: "add", user, issue }) });
    const mgmtData = await mgmtRes.json();
    logOutput(`   -> Metadata applied: ${user.metadata.portal.cms.join(', ')}`);
    logOutput(`   -> Syncing roles...`);
    const roleRes = await fetch(auth0RoleSyncUrl, { method: 'POST', headers, body: JSON.stringify({ userId: mgmtData.auth0_user_id, roles: user.roles }) });
    if (roleRes.ok) logOutput(`   -> Roles assigned successfully`);
}

// ==========================================
// 5. KV STORE LOGIC (RECENT EXECUTIONS)
// ==========================================

async function saveExecutionLog(ticketKey, status, headers) {
    let operatorName = "Client Engineer"; // Fallback name

    // 1. Get the current Glia Operator
    try {
        const gliaApi = await window.getGliaApi({ version: 'v1' });
        const operatorData = await gliaApi.getUser();
        
        // Assuming the SDK returns an object with a 'name' attribute.
        // Adjust '.name' if the Glia SDK returns it as '.firstName', '.displayName', etc.
        if (operatorData && operatorData.name) {
            operatorName = operatorData.name;
        }
    } catch (error) {
        console.warn("Could not retrieve Glia Operator info. Defaulting to fallback.", error);
    }

    // 2. Save to KV Store
    try {
        const payload = {
            action: "save_log",
            logData: {
                ticket: ticketKey,
                user: operatorName, // Dynamic user injected here
                status: status,
                output: finalReport
            }
        };

        const res = await fetch(kvStoreUrl, { method: 'POST', headers, body: JSON.stringify(payload) });
        const result = await res.json();
        
        if (result.success) {
            console.log("KV Store: Log saved successfully.", result.logId);
            fetchRecentExecutions(); 
        } else {
            console.error("KV Store Save Error:", result.error);
        }
    } catch (e) {
        console.error("Failed to call KV Store save:", e);
    }
}

async function fetchRecentExecutions() {
    try {
        const glia = await window.getGliaApi({ version: 'v1' });
        const headers = await glia.getRequestHeaders();
        headers['Content-Type'] = 'application/json';

        const res = await fetch(kvStoreUrl, { 
            method: 'POST', 
            headers, 
            body: JSON.stringify({ action: "get_recent" }) 
        });
        
        const data = await res.json();
        if (data.logs) {
            renderRecentExecutionsTable(data.logs);
        }
    } catch (e) {
        console.error("Failed to fetch recent executions:", e);
    }
}

function renderRecentExecutionsTable(logs) {
    const tbody = document.getElementById('recentExecutionsBody');
    if (!tbody) return;
    tbody.innerHTML = ''; 

    logs.forEach(log => {
        const dateObj = new Date(log.timestamp);
        const formattedDate = dateObj.toLocaleString();
        const badgeClass = log.status.toLowerCase() === 'success' ? 'badge-success' : 'badge-error';

        // Main Row
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${log.ticket}</strong></td>
            <td>${log.user}</td>
            <td><span class="badge ${badgeClass}">${log.status}</span></td>
            <td>${formattedDate}</td>
            <td>
                <button class="btn btn-small view-toggle-btn" onclick="toggleDetails(this)">View More</button>
            </td>
        `;
        tbody.appendChild(tr);

        // Collapsed Details Row
        const detailsTr = document.createElement('tr');
        detailsTr.className = 'ticket-details-row';
        detailsTr.style.display = 'none';
        detailsTr.innerHTML = `
            <td colspan="5" style="background-color: #1e1e1e; padding: 0;">
                <div style="padding: 15px;">
                    <span style="color: #4cd137; font-family: monospace; font-size: 12px; margin-bottom: 10px; display: block;">
                        Execution ID: ${log.id}
                    </span>
                    <pre style="margin: 0; padding: 15px; background-color: #000; color: #f8f8f2; font-family: 'Courier New', Courier, monospace; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; font-size: 13px;">${log.output}</pre>
                </div>
            </td>
        `;
        tbody.appendChild(detailsTr);
    });
}

// ==========================================
// 6. UTILITIES
// ==========================================

function handleApprovalCheck(checkbox) {
    const container = checkbox.closest('.details-container');
    const triggerButton = container.querySelector('.trigger-button');
    triggerButton.disabled = !checkbox.checked;
}

function clearActivePanels() {
    const existingPanel = document.querySelector('.collapsible-row');
    if (existingPanel) existingPanel.remove();
}

function logOutput(msg, clear = false) {
    if (clear) outputConsole.innerText = '';
    outputConsole.innerText += msg + "\n";
    outputConsole.scrollTop = outputConsole.scrollHeight;
    concatTexts(msg);
}

async function concatTexts(text){
    try {
        finalReport += text + "\n";
        return true;
    } catch (err) {
        console.error("Failed to concat text: ", err);
        return false;
    }
}

window.toggleDetails = function(button) {
    const currentRow = button.closest('tr');
    const detailsRow = currentRow.nextElementSibling; 

    if (detailsRow.style.display === 'none') {
        detailsRow.style.display = 'table-row';
        button.textContent = 'View Less';
        button.classList.add('btn-active'); 
    } else {
        detailsRow.style.display = 'none';
        button.textContent = 'View More';
        button.classList.remove('btn-active');
    }
};