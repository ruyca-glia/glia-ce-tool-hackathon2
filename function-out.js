// static/js/glia-functions/client_offboarding.js
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
    let envelope = {};
    try {
      envelope = await request.json();
    } catch (e) {
      return Response.json({ error: "Failed to parse request body" }, { status: 400 });
    }
    let body = {};
    try {
      if (typeof envelope.payload === "string") {
        body = JSON.parse(envelope.payload);
      } else {
        body = envelope.payload || {};
      }
    } catch (e) {
      return Response.json({ error: "Failed to parse inner payload string" }, { status: 400 });
    }
    const siteId = body.site_id;
    const apiKey = body.api_token;
    const url = `https://api.glia.com/operator_authentication/tokens?api_token=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.salemove.v1+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    const data = await response.json();
    const TOKEN = data.token;
    console.log("My Bearer Token is:", TOKEN);
    if (!siteId) {
      return Response.json({
        error: "Missing required 'site_id'",
        debug_payload: body
        // Return this to help you debug if it fails again
      }, { status: 400 });
    }
    const params = new URLSearchParams();
    params.append("site_ids[]", siteId);
    params.append("include_support", "false");
    params.append("view", "full");
    const listResp = await fetch(`https://api.glia.com/operators?${params}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Accept": "application/vnd.salemove.v1+json"
      }
    });
    if (!listResp.ok) {
      return Response.json({ error: "Glia API List Failed", status: listResp.status });
    }
    const apiResponse = await listResp.json();
    let allOps = [];
    if (Array.isArray(apiResponse)) {
      allOps = apiResponse;
    } else if (apiResponse.operators && Array.isArray(apiResponse.operators)) {
      allOps = apiResponse.operators;
    } else {
      return Response.json({
        error: "Unexpected API format. Could not find operator array.",
        received_structure: apiResponse
      }, { status: 500 });
    }
    const targets = allOps.filter((op) => !isSuperManager(op));
    const kept = allOps.filter((op) => isSuperManager(op));
    const deletePromises = targets.map(async (op) => {
      const delResp = await fetch(`https://api.glia.com/operators/${op.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${TOKEN}`,
          "Accept": "application/vnd.salemove.v1+json"
        }
      });
      return {
        email: op.email,
        success: delResp.ok,
        code: delResp.status
      };
    });
    const results = await Promise.all(deletePromises);
    return Response.json({
      status: "Success",
      report: {
        site_id: siteId,
        total_found: allOps.length,
        super_managers_preserved: kept.length,
        deleted_count: results.filter((r) => r.success).length,
        details: results
      }
    });
  } catch (err) {
    return Response.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
export {
  onInvoke
};
