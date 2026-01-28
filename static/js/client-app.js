// /static/js/client-app.js

const INVOKE_URL = 'https://api.glia.com/integrations/c8ee55e8-eebb-4934-bf1f-17fbdcfa69b2/endpoint';
const ACCESS_TOKEN = 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjU3YjVmYTFjLTBhMzgtNDFkOS1hYWNiLWUyYzhmZmQxNTQyOCIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiYTA0ZDRmNzYtN2E5Mi00OGE0LTk5MDUtNzFiOTk4Mjg2YTlhIiwiYXV0aF9zY2hlbWEiOiJhcGlfdG9rZW4iLCJleHAiOjE3Njk2MjkxOTYsImlhdCI6MTc2OTYyNTU5NiwiaXNzIjoiU2FsZU1vdmUgT3BlcmF0b3IgQXV0aCIsInJvbGVzIjpbeyJvcGVyYXRvcl9pZCI6IjgwYzcyMGJiLWQ4NWQtNDZkNy04NDk0LTdkM2E0MzQ1OWRhMyIsInR5cGUiOiJvcGVyYXRvciJ9LHsiZW5hYmxlX3BvbGljeV9hdXRob3JpemF0aW9uIjp0cnVlLCJyb2xlIjoic3VwZXJfbWFuYWdlciIsInNpdGVfaWQiOiI0MmE4ZjEyNC1mNjgxLTQ2NzMtYmUzZC05YzNmMWQzNDliMWEiLCJ0eXBlIjoic2l0ZV9vcGVyYXRvciJ9XSwic3ViIjoib3BlcmF0b3I6ODBjNzIwYmItZDg1ZC00NmQ3LTg0OTQtN2QzYTQzNDU5ZGEzIn0.eme095XX3ghRNhfjP3TehkZFw_-iOi1RngYaBjRvy57rL7mEhneNC59jhrv1NmnQBEYNGWnwUCcoqBh5NX3e5Q'; // The one with functions:invoke permission

document.getElementById('runFunction').addEventListener('click', async () => {
    console.log('Button clicked! Invoking Glia Function...');

    try {
        const response = await fetch(INVOKE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                payload: { action: 'button_click' }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Success! Glia Function says:', data);
        alert('Glia Function Invoked! Check console for operator data.');

    } catch (error) {
        console.error('Failed to invoke function:', error);
        alert('Error: ' + error.message);
    }
});