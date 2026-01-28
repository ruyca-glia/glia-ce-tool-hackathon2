// function-out.js

// --- CONFIGURATION ---
// Hardcoded token as requested.
const TOKEN = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjU3YjVmYTFjLTBhMzgtNDFkOS1hYWNiLWUyYzhmZmQxNTQyOCIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiYTA0ZDRmNzYtN2E5Mi00OGE0LTk5MDUtNzFiOTk4Mjg2YTlhIiwiYXV0aF9zY2hlbWEiOiJhcGlfdG9rZW4iLCJleHAiOjE3Njk2NDMwMjcsImlhdCI6MTc2OTYzOTQyNywiaXNzIjoiU2FsZU1vdmUgT3BlcmF0b3IgQXV0aCIsInJvbGVzIjpbeyJvcGVyYXRvcl9pZCI6IjgwYzcyMGJiLWQ4NWQtNDZkNy04NDk0LTdkM2E0MzQ1OWRhMyIsInR5cGUiOiJvcGVyYXRvciJ9LHsiZW5hYmxlX3BvbGljeV9hdXRob3JpemF0aW9uIjp0cnVlLCJyb2xlIjoic3VwZXJfbWFuYWdlciIsInNpdGVfaWQiOiI0MmE4ZjEyNC1mNjgxLTQ2NzMtYmUzZC05YzNmMWQzNDliMWEiLCJ0eXBlIjoic2l0ZV9vcGVyYXRvciJ9XSwic3ViIjoib3BlcmF0b3I6ODBjNzIwYmItZDg1ZC00NmQ3LTg0OTQtN2QzYTQzNDU5ZGEzIn0.jAwIeiSJYnnthD8qYMnrSo0VmF4uX00_9KDzcQyU78aPAkYMQGRTF9pwX7Sf1sLgNDZ3D4QyU-Q_GWCiRaaX3g";

/**
 * Checks if an operator has the 'super_manager' role.
 * Handles both top-level role strings and complex assignment arrays.
 */
function isSuperManager(operator) {
  // 1. Simple check (old API style)
  if (operator.role === 'super_manager') return true;

  // 2. Complex check (new API style with assignments)
  if (operator.assignments && Array.isArray(operator.assignments)) {
    return operator.assignments.some(a => 
      (a.role === 'super_manager') || (a.role && a.role.name === 'super_manager')
    );
  }
  return false;
}

export async function onInvoke(request, env) {
  try {
    // 1. Parse Request
    let body = {};
    try { body = await request.json(); } catch(e) { /* ignore */ }
    
    // We expect { action: "client_offboarding", site_id: "..." }
    const action = body.action || body.payload?.action;
    const siteId = body.site_id || body.payload?.site_id;

    if (action !== 'client_offboarding') {
      return Response.json({ message: "Action not recognized", action: action });
    }

    if (!siteId) {
      return Response.json({ error: "Missing site_id parameter" }, { status: 400 });
    }

    // 2. FETCH OPERATORS (GET)
    const query = new URLSearchParams({
      site_id: siteId,
      include_support: 'false',
      view: 'full' // Critical to see roles/assignments
    });

    const getUrl = `https://api.glia.com/operators?${query.toString()}`;
    const getResp = await fetch(getUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Accept": "application/vnd.salemove.v1+json"
      }
    });

    if (!getResp.ok) {
      return Response.json({ error: "Failed to fetch operators", status: getResp.status });
    }

    const allOperators = await getResp.json();
    
    // 3. FILTER (Keep Super Managers, Target the rest)
    const targets = allOperators.filter(op => !isSuperManager(op));
    
    const results = {
      total_found: allOperators.length,
      targets_count: targets.length,
      disabled_users: [],
      errors: []
    };

    // 4. DISABLE TARGETS (DELETE LOOP)
    // Note: API docs say DELETE actually just disables the user.
    for (const op of targets) {
      const deleteUrl = `https://api.glia.com/operators/${op.id}`;
      
      const delResp = await fetch(deleteUrl, {
        method: "DELETE", // This triggers the disable
        headers: {
          "Authorization": `Bearer ${TOKEN}`,
          "Accept": "application/json"
        }
      });

      if (delResp.ok) {
        results.disabled_users.push({ id: op.id, email: op.email, name: op.name });
      } else {
        results.errors.push({ id: op.id, status: delResp.status });
      }
    }

    return Response.json({
      status: "Success",
      message: `Disabled ${results.disabled_users.length} users.`,
      details: results
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}