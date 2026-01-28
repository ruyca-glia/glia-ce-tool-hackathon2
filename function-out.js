// static/js/glia-functions/client_offboarding.js
var TOKEN = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjU3YjVmYTFjLTBhMzgtNDFkOS1hYWNiLWUyYzhmZmQxNTQyOCIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiYTA0ZDRmNzYtN2E5Mi00OGE0LTk5MDUtNzFiOTk4Mjg2YTlhIiwiYXV0aF9zY2hlbWEiOiJhcGlfdG9rZW4iLCJleHAiOjE3Njk2NDMwMjcsImlhdCI6MTc2OTYzOTQyNywiaXNzIjoiU2FsZU1vdmUgT3BlcmF0b3IgQXV0aCIsInJvbGVzIjpbeyJvcGVyYXRvcl9pZCI6IjgwYzcyMGJiLWQ4NWQtNDZkNy04NDk0LTdkM2E0MzQ1OWRhMyIsInR5cGUiOiJvcGVyYXRvciJ9LHsiZW5hYmxlX3BvbGljeV9hdXRob3JpemF0aW9uIjp0cnVlLCJyb2xlIjoic3VwZXJfbWFuYWdlciIsInNpdGVfaWQiOiI0MmE4ZjEyNC1mNjgxLTQ2NzMtYmUzZC05YzNmMWQzNDliMWEiLCJ0eXBlIjoic2l0ZV9vcGVyYXRvciJ9XSwic3ViIjoib3BlcmF0b3I6ODBjNzIwYmItZDg1ZC00NmQ3LTg0OTQtN2QzYTQzNDU5ZGEzIn0.jAwIeiSJYnnthD8qYMnrSo0VmF4uX00_9KDzcQyU78aPAkYMQGRTF9pwX7Sf1sLgNDZ3D4QyU-Q_GWCiRaaX3g";
function isSuperManager(operator) {
  if (operator.role === "super_manager") return true;
  if (operator.assignments && Array.isArray(operator.assignments)) {
    return operator.assignments.some(
      (a) => a.role === "super_manager" || a.role && a.role.name === "super_manager"
    );
  }
  return false;
}
async function onInvoke(request, env) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch (e) {
    }
    const action = body.action || body.payload?.action;
    const siteId = body.site_id || body.payload?.site_id;
    if (action !== "client_offboarding") {
      return Response.json({ message: "Unknown action. Ignoring." });
    }
    if (!siteId) {
      return Response.json({ error: "Missing required 'site_id'" }, { status: 400 });
    }
    console.log(`Processing offboarding for Site: ${siteId}`);
    const params = new URLSearchParams({
      site_id: siteId,
      include_support: "false",
      view: "full"
      // Required to see roles
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
    const targets = allOps.filter((op) => !isSuperManager(op));
    const kept = allOps.filter((op) => isSuperManager(op));
    const results = [];
    const errors = [];
    for (const op of targets) {
      const delResp = await fetch(`https://api.glia.com/operators/${op.id}`, {
        method: "DELETE",
        // API: This disables the user
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
export {
  onInvoke
};
