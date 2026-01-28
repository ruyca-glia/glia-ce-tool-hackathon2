// function-out.js

// --- CONFIGURATION ---
// Hardcoded token as requested.
const TOKEN = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjU3YjVmYTFjLTBhMzgtNDFkOS1hYWNiLWUyYzhmZmQxNTQyOCIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiYTA0ZDRmNzYtN2E5Mi00OGE0LTk5MDUtNzFiOTk4Mjg2YTlhIiwiYXV0aF9zY2hlbWEiOiJhcGlfdG9rZW4iLCJleHAiOjE3Njk2NDYxMTIsImlhdCI6MTc2OTY0MjUxMiwiaXNzIjoiU2FsZU1vdmUgT3BlcmF0b3IgQXV0aCIsInJvbGVzIjpbeyJvcGVyYXRvcl9pZCI6IjgwYzcyMGJiLWQ4NWQtNDZkNy04NDk0LTdkM2E0MzQ1OWRhMyIsInR5cGUiOiJvcGVyYXRvciJ9LHsiZW5hYmxlX3BvbGljeV9hdXRob3JpemF0aW9uIjp0cnVlLCJyb2xlIjoic3VwZXJfbWFuYWdlciIsInNpdGVfaWQiOiI0MmE4ZjEyNC1mNjgxLTQ2NzMtYmUzZC05YzNmMWQzNDliMWEiLCJ0eXBlIjoic2l0ZV9vcGVyYXRvciJ9XSwic3ViIjoib3BlcmF0b3I6ODBjNzIwYmItZDg1ZC00NmQ3LTg0OTQtN2QzYTQzNDU5ZGEzIn0.9XuoAdyfNGbe3Dh0zc_WslI2PSQ_HSfxS_QvXRIA9r-1h3b_YPKL3BzDStwicohrGHbEZTOPbnkqiaVqeC41tw";

/**
 * Identify Super Managers (via role string or assignments array)
 */
function isSuperManager(operator) {
  if (operator.role === 'super_manager') return true;
  if (operator.assignments && Array.isArray(operator.assignments)) {
    return operator.assignments.some(a => 
      (a.role === 'super_manager') || (a.role && a.role.name === 'super_manager')
    );
  }
  return false;
}

export async function onInvoke(request, env) {
  try {
    // 1. Parse JSON Body
    let body = {};
    try { body = await request.json(); } catch(e) { /* ignore */ }
    
    // Normalize Payload (sometimes Glia wraps it in 'payload')
    const action = body.action || body.payload?.action;
    const siteId = body.site_id || body.payload?.site_id;

    // 2. Validate Request

    if (!siteId) {
      return Response.json({ error: "Missing required 'site_id'" }, { status: 400 });
    }

    console.log(`Processing offboarding for Site: ${siteId}`);

    // 3. GET All Operators
    const params = new URLSearchParams({
      site_id: siteId,
      include_support: 'false',
      view: 'full' // Required to see roles
    });

    const listResp = await fetch(`https://api.glia.com/operators?${params}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Accept": "application/vnd.salemove.v1+json"
      }
    });

    if (!listResp.ok) {
      return Response.json({ error: "Glia API Error (List)", status: listResp.status });
    }

    const allOps = await listResp.json();

    // 4. FILTER: Keep Super Managers
    const targets = allOps.filter(op => !isSuperManager(op));
    const kept = allOps.filter(op => isSuperManager(op));

    // 5. DELETE (Disable) Targets
    const results = [];
    const errors = [];

    for (const op of targets) {
      const delResp = await fetch(`https://api.glia.com/operators/${op.id}`, {
        method: "DELETE", // API: This disables the user
        headers: {
          "Authorization": `Bearer ${TOKEN}`,
          "Accept": "application/json"
        }
      });

      if (delResp.ok) {
        results.push(op.email);
      } else {
        errors.push({ email: op.email, code: delResp.status });
      }
    }

    // 6. Return Report
    return Response.json({
      status: "Success",
      message: "Script execution finished.",
      report: {
        site_id: siteId,
        total_users_scanned: allOps.length,
        super_managers_preserved: kept.length,
        users_disabled: results.length,
        disabled_list: results,
        failures: errors
      }
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}