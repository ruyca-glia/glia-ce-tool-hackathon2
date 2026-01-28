export async function onInvoke(request, env) {
  // Hardcoded token for the test phase
  const TOKEN = ''; 
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