export async function onInvoke(request, env) {
  // Hardcoded token for the test phase
  const TOKEN = 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjU3YjVmYTFjLTBhMzgtNDFkOS1hYWNiLWUyYzhmZmQxNTQyOCIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiYTA0ZDRmNzYtN2E5Mi00OGE0LTk5MDUtNzFiOTk4Mjg2YTlhIiwiYXV0aF9zY2hlbWEiOiJhcGlfdG9rZW4iLCJleHAiOjE3Njk2MjQ4ODAsImlhdCI6MTc2OTYyMTI4MCwiaXNzIjoiU2FsZU1vdmUgT3BlcmF0b3IgQXV0aCIsInJvbGVzIjpbeyJvcGVyYXRvcl9pZCI6IjgwYzcyMGJiLWQ4NWQtNDZkNy04NDk0LTdkM2E0MzQ1OWRhMyIsInR5cGUiOiJvcGVyYXRvciJ9LHsiZW5hYmxlX3BvbGljeV9hdXRob3JpemF0aW9uIjp0cnVlLCJyb2xlIjoic3VwZXJfbWFuYWdlciIsInNpdGVfaWQiOiI0MmE4ZjEyNC1mNjgxLTQ2NzMtYmUzZC05YzNmMWQzNDliMWEiLCJ0eXBlIjoic2l0ZV9vcGVyYXRvciJ9XSwic3ViIjoib3BlcmF0b3I6ODBjNzIwYmItZDg1ZC00NmQ3LTg0OTQtN2QzYTQzNDU5ZGEzIn0.jHuF0_fESQEgYKEAjhf1TMeWafbdVL03e7khbTHLWK99G7NB6HKoSyd3Gs2rj8iF6Je2B3Q89jnDOvSt4lSGTw'; 
  const URL = 'https://api.glia.com/operators?include_engagements=false&include_disabled=false&include_offline=true&include_support=true&include_external=false&include_all_sites=false&view=full';

  try {
    const apiResponse = await fetch(URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.salemove.v1+json',
        'Content-Type': 'application/json'
      }
    });

    // Check if the response is okay (status 200-299)
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`Glia API Error: ${apiResponse.status} - ${errorText}`);
      return Response.json({ error: 'Failed to fetch operators', status: apiResponse.status });
    }

    const data = await apiResponse.json();

    // Log the response to the Glia console
    console.log('Operators list retrieved:', data);

    return Response.json({
      message: 'Operators fetched successfully',
      count: data.length, // Assuming the API returns an array
      operators: data
    });

  } catch (error) {
    console.error('Network or Execution Error:', error);
    return Response.json({ error: 'Internal Function Error' }, { status: 500 });
  }
}