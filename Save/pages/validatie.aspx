<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <title>Validatieregels Beheren - PKV</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap" rel="stylesheet">
	<link rel="icon" type="image/svg+xml" href="../icoon/favicon.svg" />
    <!-- Referencing the existing stylesheet for consistency -->
    <link rel="stylesheet" type="text/css" href="../styles.css">
    <style>
        /* Extra styles specific to this dashboard page */
        body {
            background-color: #f4f6f9;
        }
        .main-content {
            padding-top: 20px;
        }
        .dashboard-card {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            padding: 25px 30px;
            margin-top: 20px;
        }
        .dashboard-card h3 {
            font-size: 1.6em;
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 15px;
            margin-top: 0;
            margin-bottom: 25px;
        }
        .rule-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .rule-item:last-child {
            border-bottom: none;
        }
        .rule-description {
            flex-grow: 1;
        }
        .rule-description label {
            font-size: 1.1em;
            font-weight: 500;
            color: #444;
            margin: 0;
        }
        .rule-description small {
            color: #777;
            font-size: 0.9em;
        }
        .rule-controls {
            display: flex;
            align-items: center;
            gap: 20px;
            min-width: 250px;
        }
        .rule-controls input[type="number"],
        .rule-controls input[type="text"] {
             width: 120px;
             text-align: right;
        }
        /* Toggle Switch Styles */
        .switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 34px;
        }
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 34px;
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 26px;
            width: 26px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        input:checked + .slider {
            background-color: #8e44ad;
        }
        input:focus + .slider {
            box-shadow: 0 0 1px #8e44ad;
        }
        input:checked + .slider:before {
            transform: translateX(26px);
        }
        .dashboard-footer {
            margin-top: 30px;
            text-align: right;
        }
        #dashboardNotification {
            text-align: left;
            margin-top: 20px;
            padding: 15px;
            border-radius: 6px;
            display: none; /* Hidden by default */
        }
    </style>
</head>
<body>
    <div class="page-wrapper">
        <header class="header">
            <div class="header-top-row">
                 <button id="backButton" class="button button-icon-only" title="Terug naar Toevoegen" onclick="window.location.href='../index.aspx'">
                    <i class="material-icons">arrow_back</i>
                </button>
                <div class="logo">
                    <h1>Validatieregels Beheren</h1>
                </div>
                <div class="header-actions">
                    <!-- Placeholder for potential actions -->
                </div>
            </div>
        </header>

        <main class="main-content">
            <div class="container">
                <div id="loading-indicator">
                    <p style="text-align: center; font-size: 1.2em; color: #555;">Validatieregels laden...</p>
                </div>

                <div id="dashboard-content" class="dashboard-card" style="display: none;">
                    <h3>Dynamische Validatieregels</h3>
                    <div id="rules-container">
                        <!-- Rules will be dynamically inserted here by JavaScript -->
                    </div>
                     <div class="dashboard-footer">
                        <button id="saveValidationRules" class="button button-primary">
                            <i class="material-icons">save</i> Regels Opslaan
                        </button>
                    </div>
                     <div id="dashboardNotification"></div>
                </div>
            </div>
        </main>
    </div>

    <!-- Configuration and Page-specific Script -->
    <script src="../configLijst.js"></script>
    <script>
        // JavaScript for the Validation Rules Dashboard
        document.addEventListener("DOMContentLoaded", function() {
            const Config = window.PKV_Config;
            const fnBeheer = Config.fieldInternalNames.beheer;
            let currentConfigItemId = null; // To store the ID of the config item

            const loadingIndicator = document.getElementById("loading-indicator");
            const dashboardContent = document.getElementById("dashboard-content");
            const rulesContainer = document.getElementById("rules-container");
            const saveButton = document.getElementById("saveValidationRules");
            const notificationDiv = document.getElementById("dashboardNotification");

            /**
             * Shows a notification message on the dashboard.
             */
            function showNotification(message, type) {
                notificationDiv.textContent = message;
                notificationDiv.className = ''; // Reset classes
                notificationDiv.classList.add(type === 'success' ? 'notification success' : 'notification error');
                notificationDiv.style.display = 'block';

                setTimeout(() => {
                    notificationDiv.style.display = 'none';
                }, 5000);
            }

            /**
             * Fetches the single configuration item from the BeheerPKV list.
             */
            async function fetchConfig() {
                const url = `${Config.siteUrl}/_api/web/lists/GetByTitle('${Config.lists.beheer}')/items?$top=1`;
                try {
                    const response = await fetch(url, { headers: { "Accept": "application/json;odata=verbose" } });
                    if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
                    const data = await response.json();

                    if (data.d.results && data.d.results.length > 0) {
                        const configItem = data.d.results[0];
                        currentConfigItemId = configItem.Id;
                        renderDashboard(configItem);
                        loadingIndicator.style.display = 'none';
                        dashboardContent.style.display = 'block';
                    } else {
                        throw new Error(`De lijst '${Config.lists.beheer}' is leeg of kon niet worden gevonden.`);
                    }
                } catch (error) {
                    loadingIndicator.innerHTML = `<p style="color: red; text-align: center;">Fout bij laden: ${error.message}</p>`;
                }
            }

            /**
             * Renders the dashboard controls based on the fetched config data.
             */
            function renderDashboard(configItem) {
                rulesContainer.innerHTML = ''; // Clear existing content

                const rules = [
                    {
                        label: "Minimum Bedrag Validatie",
                        description: "Handhaaf een minimumbedrag voor PKV-opdrachten.",
                        toggleField: fnBeheer.JNMinimumBedragWaarde,
                        valueField: fnBeheer.minimumBedrag,
                        inputType: 'number',
                        step: '0.01',
                        placeholder: 'bv. 320.00'
                    },
                    {
                        label: "Lengte Registratienummer Validatie",
                        description: "Controleer of het registratienummer de juiste lengte heeft.",
                        toggleField: fnBeheer.JNMaxKaraktersZaakNR,
                        valueField: fnBeheer.maxKaraktersZaakNR,
                        inputType: 'number',
                        step: '1',
                        placeholder: 'bv. 6'
                    },
                    {
                        label: "Lengte CJIB-nummer Validatie",
                        description: "Controleer of het CJIB-nummer de juiste lengte heeft.",
                        toggleField: fnBeheer.JNLengteCJIB,
                        valueField: fnBeheer.lengteCJIB,
                        inputType: 'number',
                        step: '1',
                        placeholder: 'bv. 9'
                    }
                ];

                rules.forEach(rule => {
                    const isChecked = configItem[rule.toggleField];
                    const value = configItem[rule.valueField];

                    const ruleElement = document.createElement('div');
                    ruleElement.className = 'rule-item';
                    ruleElement.innerHTML = `
                        <div class="rule-description">
                            <label for="${rule.toggleField}">${rule.label}</label>
                            <small>${rule.description}</small>
                        </div>
                        <div class="rule-controls">
                            <input type="${rule.inputType}" class="form-control" id="${rule.valueField}" value="${value || ''}" 
                                   step="${rule.step}" placeholder="${rule.placeholder}" ${!isChecked ? 'disabled' : ''}>
                            <label class="switch">
                                <input type="checkbox" id="${rule.toggleField}" ${isChecked ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                        </div>
                    `;
                    rulesContainer.appendChild(ruleElement);

                    // Add event listener to toggle the input field's disabled state
                    const toggle = ruleElement.querySelector(`#${rule.toggleField}`);
                    const input = ruleElement.querySelector(`#${rule.valueField}`);
                    toggle.addEventListener('change', () => {
                        input.disabled = !toggle.checked;
                    });
                });
            }
            
            /**
             * Gets the Request Digest needed for SharePoint write operations.
             */
            async function getRequestDigest() {
                 const response = await fetch(`${Config.siteUrl}/_api/contextinfo`, {
                    method: "POST",
                    headers: { "Accept": "application/json;odata=verbose" }
                });
                if (!response.ok) throw new Error("Kon geen request digest ophalen.");
                const data = await response.json();
                return data.d.GetContextWebInformation.FormDigestValue;
            }

            /**
             * Saves the updated validation rules back to the SharePoint list.
             */
            async function saveChanges() {
                if (!currentConfigItemId) {
                    showNotification("Fout: Configuratie ID niet gevonden.", "error");
                    return;
                }

                saveButton.disabled = true;
                saveButton.innerHTML = '<i class="material-icons">sync</i> Opslaan...';

                const payload = {
                    __metadata: { 'type': `SP.Data.${Config.lists.beheer}ListItem` }
                };

                // Gather data from the form
                payload[fnBeheer.JNMinimumBedragWaarde] = document.getElementById(fnBeheer.JNMinimumBedragWaarde).checked;
                payload[fnBeheer.minimumBedrag] = parseFloat(document.getElementById(fnBeheer.minimumBedrag).value) || 0;
                
                payload[fnBeheer.JNMaxKaraktersZaakNR] = document.getElementById(fnBeheer.JNMaxKaraktersZaakNR).checked;
                payload[fnBeheer.maxKaraktersZaakNR] = parseInt(document.getElementById(fnBeheer.maxKaraktersZaakNR).value) || 0;

                payload[fnBeheer.JNLengteCJIB] = document.getElementById(fnBeheer.JNLengteCJIB).checked;
                payload[fnBeheer.lengteCJIB] = parseInt(document.getElementById(fnBeheer.lengteCJIB).value) || 0;
                
                try {
                    const digest = await getRequestDigest();
                    const url = `${Config.siteUrl}/_api/web/lists/GetByTitle('${Config.lists.beheer}')/items(${currentConfigItemId})`;

                    const response = await fetch(url, {
                        method: "POST",
                        headers: {
                            "Accept": "application/json;odata=verbose",
                            "Content-Type": "application/json;odata=verbose",
                            "X-RequestDigest": digest,
                            "IF-MATCH": "*",
                            "X-HTTP-Method": "MERGE"
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => null);
                        const errorMessage = errorData?.error?.message?.value || `Serverfout (status: ${response.status})`;
                        throw new Error(errorMessage);
                    }

                    showNotification("Validatieregels succesvol opgeslagen!", "success");

                } catch (error) {
                    showNotification(`Fout bij opslaan: ${error.message}`, "error");
                } finally {
                    saveButton.disabled = false;
                    saveButton.innerHTML = '<i class="material-icons">save</i> Regels Opslaan';
                }
            }

            // Initial fetch and setup
            fetchConfig();
            saveButton.addEventListener('click', saveChanges);
        });
    </script>
</body>
</html>
