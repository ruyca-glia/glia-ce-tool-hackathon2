// /static/js/client-app.js

const functionURLOffboarding = 'https://api.glia.com/integrations/d81f89fb-4fac-4416-9c7f-891342f4ac9b/endpoint';

const baseConfig = {
    "cobra": {
        "web_rtc_data_channels_allowed": "1",
        "read_inline_styles_from_memory": "0",
        "send_external_assets": "0",
        "salesforce_sites_support_enabled": "0",
        "send_initial_dom_in_chunks": "0",
        "debugging_logs_enabled": "0"
    },
    "cortex_ai": {
        "enable_learn_from_glia_knowledge_base": "1",
        "enable_intercept": "0",
        "enable_autocomplete": "0",
        "enable_screen_recording_analyst": "0",
        "enable_heads_up_for_agents": "0",
        "enable_gva_learn_from_interactions": "0",
        "enable_interaction_analysis": "0",
        "enable_forecast_analyst": "0",
        "enable_interaction_analyzer_survey": "0"
    },
    "engagement_api": {
        "use_new_engagements_endpoint_implementation": "1",
        "enable_escalation_search_endpoints": "0"
    },
    "engagement_restart": {
        "end_on_unauthentication": "0",
        "skip_on_unauthentication": "0",
        "visitor_tab_verification_enabled": "1"
    },
    "interaction_coordinator": {
        "control_all_inbound_interactions": "1",
        "control_external_authentication": "1",
        "control_consolidation": "1",
        "control_operator_surveys": "1",
        "control_monitoring_users": "1",
        "control_call_visualizer": "1",
        "control_direct_inbound": "1", 
        "track_cobrowsing": "1",
        "track_av_media_changes": "1"
    },
    "mental_load": {
        "mental_load_analysis_enabled": "0"
    },
    "omnibrowse": {
        "show_visitor_survey": "1"
    },
    "omnicall": {
        "webrtc_calls_via_sip_proxy": "0",
        "show_tab_in_advanced_admin": "0",
        "max_phone_numbers": "10",
        "message_group_speech_to_text_timeout": "2",
        "visitor_dual_channel_recording_format": "mp3",
        "gva_diagnostic_recordings_enabled": "0",
        "clone_verified_glia_number": "0",
        "default_operator_display_phone_number": "",
        "allow_unverified_operator_phone_numbers": "0",
        "automatic_speech_recognition_enabled": "0",
        "use_local_transcribe_service": "0",
        "store_automatic_speech_recognition_debug_recordings": "0",
        "store_automatic_speech_recognition_development_recordings": "0",
        "outbound_calls_via_sip_proxy": "0",
        "sip_outbound_routing_enabled": "1",
        "route_new_phone_numbers_to_sip_trunking": "0",
        "use_streaming_for_gva_audio": "0",
        "gva_audio_websocket_url": "",
        "duplicate_visitor_inbound_call_behavior": "forward",
        "automatic_speech_recognition_language": "en-US",
        "twilio_speech_to_text_model": "default"
    },
    "omniq": {
        "reporting_tab_enabled": "1",
        "disable_multiple_default_queues": "1",
        "disable_multi_queueing": "1"
    },
    "operator_api": {
        "enable_visitor_list": "1",
        "allow_multiple_tabs": "0",
        "pubsub_logs_enabled": "0"
    },
    "operator_app": {
        "secure_password_validation_enabled": "1",
        "outbound_sms_enabled": "0",
        "show_custom_javascript_field": "0",
        "autoplay_user_interaction_interval": "-1",
        "show_omniguide_admin": "0",
        "annotations_sample_interval": "100",
        "show_outbound_secure_messaging": "0",
        "enable_cortex_transfer_summary": "0",
        "enable_operator_snapshot_live_operators_view": "1",
        "enable_user_presence_webhook": "1",
        "enabled_channels": "facebook,whatsapp,slack",
        "enable_advanced_access_management": "0",
        "granular_admin_permissions_enabled": "1",
        "hide_set_visitor_queues_v1": "1",
        "enable_gva_docs_access": "0",
        "enable_mobile_live_observation": "1",
        "enable_audio_virtual_assistants": "0",
        "is_support_account": "0",
        "enable_service_credentials": "0",
        "enable_global_external_applets": "1",
        "serve_applets_from_glia_applets_com": "1",
        "audit_trails": "1",
        "enable_historical_operators_reporting_csv": "1",
        "engagement_ask_cortex_access_enabled": "0",
        "enable_wrap_up_automation": "0",
        "secure_conversations_follow_up_enabled": "0",
        "target_all_visitors_when_matching_by_external_id": "0",
        "enable_screen_recording_playback": "0",
        "show_historical_operator_reporting": "0",
        "enable_visitor_panel_new_design": "1",
        "separate_queues_for_calls_sms": "1",
        "show_historical_reporting": "0",
        "enable_media_specific_routing": "1",
        "enable_policy_authorization": "1",
        "enable_snapshot_queue_activity_view": "1",
        "screen_recording_enabled": "0"
    },
    "outbound_analyst": {
        "scheduler": "0"
    },
    "privacy_security": {
        "disable_glia_pii_masking": ""
    },
    "secure_async_messaging": {
        "enable_auth_for_alpha_chat_messaging_endpoint": "1",
        "secure_async_messaging_enabled": "0",
        "secure_conversations_email_notifications": "0",
        "copy_messages_on_transfer": "0"
    },
    "site_visitor_config": {
        "require_visitor_secret_for_access_token_renewal": "1"
    },
    "visitor_api": {
        "disconnect_idle_visitors": "1",
        "use_updated_webcomponents": "1",
        "check_asset_integrities": "0",
        "allow_embedding": "0",
        "iframe_identity_detection_timeout": "500",
        "pubsub_logs_enabled": "0",
        "visitor_presence_join_limited": "1",
        "enable_staffing_logs": "0",
        "use_buggy_iframe_reload": "0",
        "disable_repeat_updates_optimization": "0",
        "load_gva_custom_renderer": "0",
        "create_queue_tickets_via_http": "0",
        "use_ws_proxy": "1"
    },
    "visitor_app": {
        "watch_for_new_contact_operator_integrations": "1",
        "white_label_enabled": "0",
        "apply_styles_for_banno_integration": "0",
        "secure_conversations_redesign_enabled": "0",
        "resize_top_frame_viewport_on_android_firefox": "0",
        "automatically_minimize_chat_on_mobile": "0",
        "force_mobile_styles": "0"
    },
    "wfm_integrations": {
        "enable_creating_operator_status_exports_via_ui": "1"
    }
};

const digitalFeatures ={ 
    "digital-3": {
        "omnicall.show_tab_in_advanced_admin": "1",
        "operator_app.outbound_sms_enabled": "1",
    }, 
    "digital-5": {
        "cortex_ai.enable_intercept": "1", 
        "cortex_ai.enable_autocomplete": "1", 
        "operator_app.show_omniguide_admin": "1",
        "operator_app.enable_gva_docs_access": "1",
        "visitor_api.load_gva_custom_renderer": "1",
    },
    "digital-7": {
        "cortex_ai.enable_heads_up_for_agents": "1",
        "cortex_ai.enable_interaction_analysis": "1",
        "cortex_ai.enable_forecast_analyst": "1",
        "cortex_ai.enable_interaction_analyzer_survey": "1",
        "operator_app.enable_wrap_up_automation": "1",
        "operator_app.enable_cortex_transfer_summary": "1",
        "operator_app.engagement_ask_cortex_access_enabled": "1",
    }
};

const voiceFeatures = {
    "voice-3": {
        "omnicall.show_tab_in_advanced_admin": "1"
    },
    "voice-5": {
        "cortex_ai.enable_intercept": "1", 
        "cortex_ai.enable_interaction_analyzer_survey": "1",
        "omnicall.automatic_speech_recognition_enabled": "1",
        "operator_app.outbound_sms_enabled": "1",
        "operator_app.show_omniguide_admin": "1",
        "operator_app.enable_gva_docs_access": "1",
        "operator_app.enable_wrap_up_automation": "1",
        "operator_app.enable_cortex_transfer_summary": "1",
        "operator_app.engagement_ask_cortex_access_enabled": "1",
    },
    "voice-7": {
        "cortex_ai.enable_heads_up_for_agents": "1",
        "cortex_ai.enable_interaction_analysis": "1",
        "cortex_ai.enable_forecast_analyst": "1",
        "cortex_ai.enable_interaction_analyzer_survey": "1",
    }
};

// helper function 
function setNestedValue(obj, path, value){ 
    const keys = path.split('.');
    let current = obj;  

    for (let i = 0; i < keys.length - 1; i++){
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value; 
}

// build JSON for onboarding
function buildConfig(digitalSelection, voiceSelection){ 
    const config = JSON.parse(JSON.stringify(baseConfig));

    // Digital tiers, comulative
    const digitalTiers = ["digital-3", "digital-5", "digital-7"];
    const selectedDigitalIndex = digitalTiers.indexOf(digitalSelection);

    //apply features up to and including selected tier
    for (let i = 0; i <= selectedDigitalIndex; i++){
        const tierFeatures = digitalFeatures[digitalTiers[i]];
        for (const [path, value] of Object.entries(tierFeatures)){
            setNestedValue(config, path, value);
        }
    }

    // Voice tiers 
    const voiceTiers = ["voice-3", "voice-5", "voice-7"];
    const selectedVoiceIndex = voiceTiers.indexOf(voiceSelection);

    // apply 
    for (let i = 0; i <= selectedVoiceIndex; i++){
        const tierFeatures = voiceFeatures[voiceTiers[i]];
        for (const [path, value] of Object.entries(tierFeatures)){
            setNestedValue(config, path, value);
        }
    }
    return config;
}

// Copy to clipboard
async function copyToClipboard(text){
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        logOutput("Failed to copy: ", err);
        return false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // UI References
    const confirmBtn = document.getElementById('confirm-btn');
    const runBtn = document.getElementById('run-btn');
    const resetBtn = document.getElementById('reset-btn');
    const scriptSelect = document.getElementById('script-select');
    const dynamicContainer = document.getElementById('dynamic-fields');
    const form = document.getElementById('script-form');
    const outputConsole = document.getElementById('output');


    console.log("Event listener loaded");
    // --- STEP 1: Confirm Selection ---
    confirmBtn.addEventListener('click', () => {
        const selectedScript = scriptSelect.value;
        console.log("selected script")
        console.log(selectedScript)
        // Reset dynamic area
        dynamicContainer.innerHTML = '';
        dynamicContainer.style.display = 'none';
        runBtn.disabled = true;

        if (!selectedScript) {
            alert("Please choose a script first.");
            return;
        }

        // Logic for "client_offboarding"
        if (selectedScript === 'client_offboarding') {
            dynamicContainer.style.display = 'block';
            
            // Create Label for SiteID
            const label = document.createElement('label');
            label.innerText = "Target Site ID (Required)";
            label.style.fontWeight = "bold";
            label.htmlFor = "site_id_input";

            // Create Label for API Token
            const labelToken = document.createElement('label');
            labelToken.innerText = "API Token for Client Assist";
            labelToken.htmlFor = "api_token_input";

            // Create Input for SiteID
            const input = document.createElement('input');
            input.type = "text";
            input.id = "site_id_input";
            input.placeholder = "e.g. 12345678-abcd-1234-abcd-1234567890ab";
            input.required = true;
            input.style.width = "100%";
            input.style.marginTop = "5px";

            // Create Input for API Token
            const inputToken = document.createElement('input');
            inputToken.type = "text";
            inputToken.id = "api_token_input";
            inputToken.placeholder = "e.g. fAFEnmsfUHk38fn3";
            inputToken.required = true;
            inputToken.style.width = "100%";
            inputToken.style.marginTop = "5px";

            // Append to DOM
            dynamicContainer.appendChild(label);
            dynamicContainer.appendChild(input);
            dynamicContainer.appendChild(labelToken);
            dynamicContainer.appendChild(inputToken);
            
            // Enable Run button immediately 
            runBtn.disabled = false;

            // Logic for Client Onboarding 
        } else if (selectedScript === 'client_onboarding'){
            dynamicContainer.style.display = 'block';

            // RADIO GROUP 1 
            const radioGroup1Container = document.createElement('div');
            radioGroup1Container.style.marginTop = '15px';
            radioGroup1Container.style.padding = '10px';
            radioGroup1Container.style.border = '1px solid #ccc';
            radioGroup1Container.style.borderRadius = "5px";

            const radioGroup1Label = document.createElement('label');
            radioGroup1Label.innerText = "Select Digital Package"; 
            radioGroup1Label.style.fontWeight = "bold";
            radioGroup1Label.style.display = "block";
            radioGroup1Label.style.marginBottom = "8px";
            radioGroup1Container.appendChild(radioGroup1Label);

            const group1Options = ["Digital 3", "Digital 5", "Digital 7"];
            group1Options.forEach((optionText, index) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'radio-option';

                const radioInput = document.createElement('input');
                radioInput.type = "radio";
                radioInput.name = "radio_group_1";
                radioInput.id = `group1_opt${index}`;
                radioInput.value = optionText.toLowerCase().replace(" ", "-");

                const radioLabel = document.createElement('label');
                radioLabel.htmlFor = `group1_opt${index}`;
                radioLabel.innerText = optionText; 
                radioLabel.style.marginTop = "5px";
                radioLabel.style.cursor = "pointer";

                wrapper.appendChild(radioInput);
                wrapper.appendChild(radioLabel);
                radioGroup1Container.appendChild(wrapper);
            });

            // RADIO GROUP 2
            const radioGroup2Container = document.createElement('div');
            radioGroup2Container.style.marginTop = '15px';
            radioGroup2Container.style.padding = '10px';
            radioGroup2Container.style.border = '1px solid #ccc';
            radioGroup2Container.style.borderRadius = "5px";

            const radioGroup2Label = document.createElement('label');
            radioGroup2Label.innerText = "Select Voice Package"; 
            radioGroup2Label.style.fontWeight = "bold";
            radioGroup2Label.style.display = "block";
            radioGroup2Label.style.marginBottom = "8px";
            radioGroup2Container.appendChild(radioGroup2Label);

            const group2Options = ["Voice 3", "Voice 5", "Voice 7"];
            group2Options.forEach((optionText, index) => {
                const wrapper = document.createElement('div');

                wrapper.className = 'radio-option';

                const radioInput = document.createElement('input');
                radioInput.type = "radio";
                radioInput.name = "radio_group_2";
                radioInput.id = `group2_opt${index}`;
                radioInput.value = optionText.toLowerCase().replace(" ", "-");

                const radioLabel = document.createElement('label');
                radioLabel.htmlFor = `group2_opt${index}`;
                radioLabel.innerText = optionText; 
                radioLabel.style.marginLeft = "5px";
                radioLabel.style.cursor = "pointer";

                wrapper.appendChild(radioInput);
                wrapper.appendChild(radioLabel);
                radioGroup2Container.appendChild(wrapper);
            });

            // append to DOM
            dynamicContainer.appendChild(radioGroup1Container);
            dynamicContainer.appendChild(radioGroup2Container);

            // Enable Run button immediately 
            runBtn.disabled = false;
        }
        else {
            // For other scripts that don't need input, just enable run
            runBtn.disabled = false;
        }
    });

    // --- Reset Handler ---
    resetBtn.addEventListener('click', () => {
        dynamicContainer.innerHTML = '';
        dynamicContainer.style.display = 'none';
        runBtn.disabled = true;
        logOutput("Waiting for script execution...", true);
    });

    // --- STEP 2: Run Script ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const scriptName = scriptSelect.value;
        //const args = document.getElementById('args').value;
        
        logOutput(`Starting execution: ${scriptName}...`, true);

        // Prepare Payload
        let payload = {
            action: scriptName,
        };
        
        // Confirm if client_onboarding
        if (scriptName === 'client_onboarding'){
            // Log
            console.log("Entered the client_onboarding");
            // capture radio selections
            const radioGroup1 = document.querySelector('input[name="radio_group_1"]:checked');
            const radioGroup2 = document.querySelector('input[name="radio_group_2"]:checked');

            if (!radioGroup1){
                logOutput("ERROR: Please select a Digital Package");
                return;
            }

            if (!radioGroup2){
                logOutput("ERROR: Please select a Voice Package");
                return;
            }

            const digitalSelection = radioGroup1.value;
            const voiceSelection = radioGroup2.value;

            logOutput(`Building configuration for: ${digitalSelection} + ${voiceSelection}`);
            
            // Build JSON
            const finalConfig = buildConfig(digitalSelection, voiceSelection);
            const jsonString = JSON.stringify(finalConfig, null, 2);

            // Copy to clipboard
            //const copied = await copyToClipboard(jsonString);

            if (copied){
                logOutput("---------------------------");
                logOutput("SUCCESS: JSON configurtion copied to clipboard");
                logOutput("---------------------------");
                logOutput("Configuration preview:");
                logOutput(jsonString);
            } else {
                logOutput("ERROR: Failed to copy to clipboard. Here's the JSON");
                logOutput(jsonString);
            }

            return; // Do not proceed to API call
        }

        // Capture Site ID if it exists in DOM
        const siteIdInput = document.getElementById('site_id_input');
        if (siteIdInput) {
            if (!siteIdInput.value.trim()) {
                logOutput("ERROR: Site ID is missing!");
                return;
            }
            payload.site_id = siteIdInput.value.trim();
        }

        // Caputre API Token ID if it exists in DOM
        const apiTokenInput = document.getElementById("api_token_input");
        if (apiTokenInput) {
            if (!apiTokenInput.value.trim()) {
                logOutput("ERROR: API Token is missing!");
                return;
            }
            payload.api_token = apiTokenInput.value.trim();
        }



        try {
            // 1. Initialize Glia
            if (!window.getGliaApi) throw new Error("Glia API not detected.");
            const glia = await window.getGliaApi({ version: 'v1' });
            
            // 2. Headers
            logOutput("Authenticating...");
            const headers = await glia.getRequestHeaders();
            headers['Content-Type'] = 'application/json';

            // 3. Network Request
            logOutput(`Sending request to Middleware...`);
            let response;

            // Check the value from the dropdown/input
            if (scriptName === 'client_offboarding') {
                response = await fetch(functionURLOffboarding, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(payload)
                });
            } else {
                // Handle case where script name doesn't match or add other scripts here
                logOutput("No matching script action found.");
                return;
            }
            
            if (!response.ok) throw new Error(`Server status: ${response.status}`);

            const data = await response.json();
            
            // 4. Display Results
            logOutput("----------------------------------------");
            logOutput("EXECUTION COMPLETE");
            logOutput("----------------------------------------");
            logOutput(JSON.stringify(data, null, 2));

        } catch (error) {
            console.error(error);
            logOutput(`\nCRITICAL ERROR: ${error.message}`);
        }
    });

    // Helper to write to the right-side console
    function logOutput(msg, clear = false) {
        if (clear) outputConsole.innerText = '';
        outputConsole.innerText += msg + "\n";
    }
});
