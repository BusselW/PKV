"use strict";

/**
 * PKV Opdrachten Applicatie
 * Proceskostenvergoeding toevoegen systeem
 * @author Wesley van Bussel
 * @version 3.5
 */

// ========== Module Pattern Setup ==========
const PKVApp = (function() {
    // Toegang tot het globale configuratieobject gedefinieerd in configLijst.js
    const Config = window.PKV_Config;
    
    // Globale variabelen - private binnen de module
    let currentUserWindowsID = "";
    let currentUserGroups = [];
    let gemachtigdenOptions = [];
    let gemachtigdenValues = [];
    let autoSaveTimer = 0;
    let validationRules = { ...Config.validationDefaults };
    let isAutosaveRunning = false;
    let interactiveTour = null;
    let tippyInstances = [];
    
    // ========== Helper Functions ==========
    
    /**
     * Helper-functie voor loggen als de debug-modus is ingeschakeld.
     * @param {string} message - Logbericht
     * @param {*} [data] - Optionele data om te loggen
     */
    function logDebug(message, data) {
        if (Config.debugMode) {
            if (data !== undefined) {
                const logData = (typeof data === 'object' && data !== null) ? JSON.parse(JSON.stringify(data)) : data;
                console.log(`[PKV Debug] ${message}`, logData);
            } else {
                console.log(`[PKV Debug] ${message}`);
            }
        }
    }	
    
    /**
     * Toont een notificatie aan de gebruiker.
     * @param {string} message - Bericht om te tonen
     * @param {string} [type=''] - Type notificatie ('success', 'error', of leeg voor standaard)
     * @param {number} [duration=5000] - Duur in ms voordat de notificatie verdwijnt (0 voor geen auto-hide)
     */
    function showNotification(message, type = '', duration = 5000) {
        const notificationEl = document.getElementById("notification");
        if (!notificationEl) return;
        
        notificationEl.innerHTML = message;
        notificationEl.className = "notification";
        
        if (type) {
            notificationEl.classList.add(type);
        }
        
        if (duration > 0) {
            setTimeout(() => {
                if (notificationEl.innerHTML === message) {
                    notificationEl.innerHTML = "";
                    notificationEl.className = "notification";
                }
            }, duration);
        }
    }
    
    /**
     * Toont foutmeldingen in een centrale balk.
     * @param {string[]} errors - Array van foutmeldingen
     * @param {HTMLElement[]} elementsToHighlight - DOM-elementen die gemarkeerd moeten worden
     */
    function displayErrors(errors, elementsToHighlight = []) {
        const errorDiv = document.getElementById("errorMessage");
        if (!errorDiv) { 
            console.error("Error display DIV not found!"); 
            alert("Fout: " + errors.join("\n")); 
            return; 
        }
        
        errorDiv.innerHTML = "<strong>Fout(en):</strong><br>" + errors.join("<br>");
        errorDiv.classList.add('show');
        
        setTimeout(() => { 
            errorDiv.classList.remove('show'); 
        }, 7000);
        
        document.querySelectorAll('.input-error-highlight').forEach(el => el.classList.remove('input-error-highlight'));
        elementsToHighlight.forEach(el => {
            if (el && typeof el.classList !== 'undefined') {
                el.classList.add('input-error-highlight');
            }
        });
    }
    
    /**
     * Stelt een willekeurig bericht in de footer in.
     */
    function setFooterMessage() {
        const messages = [
			"Mulder"
        ];
        const footerMessageEl = document.getElementById("footerMessage");
        if (footerMessageEl) {
            footerMessageEl.innerHTML = `&hearts; Afdeling Mulder - ${messages[Math.floor(Math.random() * messages.length)]}`;
        }
    }
    
    // ========== User Management Functions ==========
    
    /**
     * Haalt de ID en groepslidmaatschappen van de huidige gebruiker op.
     */
    async function getCurrentUserData() {
        try {
            const userResponse = await fetch(`${Config.siteUrl}/_api/web/currentuser`, { 
                method: "GET", 
                headers: { "Accept": "application/json;odata=verbose" },
                signal: AbortSignal.timeout(8000)
            });
            
            if (!userResponse.ok) throw new Error(`Fout bij ophalen gebruiker (status: ${userResponse.status})`);
            
            const userData = await userResponse.json();
            currentUserWindowsID = userData.d.LoginName.replace(/^.*\\/, "");
            logDebug("Current user WindowsID:", currentUserWindowsID);
            
            const groupsResponse = await fetch(`${Config.siteUrl}/_api/web/currentuser/groups`, { 
                method: "GET", 
                headers: { "Accept": "application/json;odata=verbose" },
                signal: AbortSignal.timeout(8000)
            });
            
            if (!groupsResponse.ok) throw new Error(`Fout bij ophalen groepen (status: ${groupsResponse.status})`);
            
            const groupsData = await groupsResponse.json();
            currentUserGroups = groupsData.d.results.map(group => group.Title);
            logDebug("Fetched user groups:", currentUserGroups);
            
        } catch (error) {
            console.error("Error fetching current user data or groups:", error);
            const fallbackUser = promptForUsername(error);
            currentUserWindowsID = fallbackUser || "onbekend";
            currentUserGroups = [];
            
            const errorMsg = error.name === 'TimeoutError' 
                ? `SharePoint reageert niet. Gebruiker ingesteld als: <strong>${currentUserWindowsID}</strong>`
                : `Kon gebruikersgegevens niet ophalen. Gebruiker ingesteld als: <strong>${currentUserWindowsID}</strong>`;
            showNotification(errorMsg, "error", 0);
        } finally {
            updateBeoordelaarFields();
            setupHeaderButtons();
            await loadTempRecords(); // Wacht tot records geladen zijn
            checkAndOfferLocalDataSync(); // Controleer daarna op lokale data
        }
    }
    
    /**
     * Vraagt gebruiker om handmatige invoer van gebruikersnaam wanneer SharePoint onbereikbaar is.
     */
    function promptForUsername(error) {
        const isTimeout = error.name === 'TimeoutError';
        const message = isTimeout 
            ? "SharePoint reageert niet. Voer uw gebruikersnaam in voor de 'Naam Beoordelaar' kolom:"
            : "Kon uw gebruikersnaam niet ophalen van SharePoint. Voer handmatig in:";
        
        try {
            const manualUsername = prompt(message, "");
            return manualUsername ? manualUsername.trim() : null;
        } catch (e) {
            console.warn("Could not prompt for username:", e);
            return null;
        }
    }
    
    /**
     * Controleert groepslidmaatschappen van de gebruiker en toont conditionele knoppen in de header.
     */
    function setupHeaderButtons() {
        logDebug("Setting up conditional header buttons. User groups:", currentUserGroups);
    
        const adminContainer = document.getElementById('adminButtonContainer');
        if (adminContainer) {
            adminContainer.innerHTML = '';
            const isAdmin = Config.adminGroups.some(adminGroup => currentUserGroups.includes(adminGroup));
            if (isAdmin) {
                const adminButton = document.createElement('button');
                adminButton.id = 'adminButton';
                adminButton.className = 'button button-admin';
                adminButton.title = 'Admin Opties';
                adminButton.innerHTML = '<i class="material-icons">admin_panel_settings</i> Admin';
                adminButton.onclick = () => window.location.href = "https://som.org.om.local/sites/MulderT/PKV/CPW/Dashboard/dashboard.aspx";
                adminContainer.appendChild(adminButton);
            }
        }
    
        const validationContainer = document.getElementById('validationRulesButtonContainer');
        if (validationContainer) {
            validationContainer.innerHTML = '';
            const canEditRules = Config.validationRulesAdminGroups.some(adminGroup => currentUserGroups.includes(adminGroup));
            if (canEditRules) {
                const validationButton = document.createElement('button');
                validationButton.id = 'validationRulesButton';
                validationButton.className = 'button button-secondary';
                validationButton.title = 'Validatieregels aanpassen';
                validationButton.innerHTML = '<i class="material-icons">rule</i> Validatieregels';
                validationButton.onclick = () => window.location.href = 'pages/validatie.aspx';
                validationContainer.appendChild(validationButton);
            }
        }
    }
    
    /**
     * Werkt de kolom "Naam Beoordelaar" bij in alle rijen.
     */
    function updateBeoordelaarFields() {
        document.querySelectorAll("#dataTable tbody tr").forEach(row => {
            const beoordelaarCell = row.cells[5];
            if (beoordelaarCell) {
                let textNode = Array.from(beoordelaarCell.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                if (textNode) {
                    textNode.textContent = currentUserWindowsID;
                } else {
                    beoordelaarCell.prepend(document.createTextNode(currentUserWindowsID));
                }
                const hiddenInput = beoordelaarCell.querySelector("input[type='hidden']") || document.createElement("input");
                hiddenInput.type = "hidden";
                hiddenInput.value = currentUserWindowsID;
                if (!hiddenInput.parentNode) beoordelaarCell.appendChild(hiddenInput);
            }
        });
    }
    
    // ========== Configuration and Setup Functions ==========
    
    /**
     * Haalt validatieconfiguratie op uit de BeheerPKV-lijst.
     */
    async function fetchValidationConfig() {
        logDebug("Fetching validation configuration from list:", Config.lists.beheer);
        const fnBeheer = Config.fieldInternalNames.beheer;
        const selectQuery = `$select=${Object.values(fnBeheer).join(',')}`;
        const url = `${Config.siteUrl}/_api/web/lists/GetByTitle('${Config.lists.beheer}')/items?${selectQuery}&$top=1`;
        
        try {
            const response = await fetch(url, { 
                headers: { "Accept": "application/json;odata=verbose" },
                signal: AbortSignal.timeout(10000)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            if (data.d.results && data.d.results.length > 0) {
                const configItem = data.d.results[0];
                logDebug("Fetched config item:", configItem);
                
                validationRules.registratienummerLength = configItem[fnBeheer.maxKaraktersZaakNR] ?? Config.validationDefaults.registratienummerLength;
                validationRules.cjibNummerLength = configItem[fnBeheer.lengteCJIB] ?? Config.validationDefaults.cjibNummerLength;
                validationRules.minimumBedrag = configItem[fnBeheer.minimumBedrag] ?? Config.validationDefaults.minimumBedrag;
                
                validationRules.isRegNrLengthValidationActive = configItem[fnBeheer.JNMaxKaraktersZaakNR] ?? true;
                validationRules.isCjibLengthValidationActive = configItem[fnBeheer.JNLengteCJIB] ?? true;
                validationRules.isMinimumAmountValidationActive = configItem[fnBeheer.JNMinimumBedragWaarde] ?? true;

                logDebug("Successfully updated validation rules from BeheerPKV:", validationRules);
                showNotification("Validatieregels succesvol geladen.", "success", 3000);
            } else {
                throw new Error("BeheerPKV lijst is leeg.");
            }
        } catch (error) {
            console.error("Error fetching validation config, using defaults:", error);
            validationRules = { ...Config.validationDefaults, isRegNrLengthValidationActive: true, isCjibLengthValidationActive: true, isMinimumAmountValidationActive: true };
            const errorMsg = `Kon validatieregels niet laden. Standaardregels worden gebruikt.`;
            showNotification(errorMsg, "error", 0);
        }
    }
    
    /**
     * Haalt de lijst met gemachtigden op uit SharePoint.
     */
     async function fetchGemachtigdenOptions() {
        const fnGemachtigden = Config.fieldInternalNames.gemachtigden;
        const url = `${Config.siteUrl}/_api/web/lists/GetByTitle('${Config.lists.gemachtigden}')/items?$select=${fnGemachtigden.naamPM},${fnGemachtigden.verbergen}&$top=5000`;

        try {
            const response = await fetch(url, { 
                headers: { "Accept": "application/json;odata=verbose" },
                signal: AbortSignal.timeout(10000)
            });
            if (!response.ok) throw new Error(`Fout bij ophalen van gemachtigden (status: ${response.status})`);
            
            const data = await response.json();
            let fetchedOptions = data.d.results
                .filter(item => !item[fnGemachtigden.verbergen])
                .sort((a, b) => (a[fnGemachtigden.naamPM] || '').localeCompare(b[fnGemachtigden.naamPM] || '', 'nl', { sensitivity: 'base' }));

            gemachtigdenOptions = fetchedOptions; 
            gemachtigdenValues = gemachtigdenOptions.map(opt => opt[fnGemachtigden.naamPM]);
            logDebug(`Gemachtigden options loaded: ${gemachtigdenOptions.length}`);
            
            if (gemachtigdenOptions.length === 0) {
                showNotification("Geen gemachtigden gevonden om de dropdown te vullen.", "warning", 4000);
            }

        } catch (error) {
            console.error("Error fetching gemachtigden:", error);
            const errorMsg = `Kon de keuzelijst voor gemachtigden niet laden.`;
            showNotification(errorMsg, "error", 0);
        }
    }
    
    // ========== UI and Event Handling Functions ==========
    
    /**
     * Stelt alle event listeners in voor de applicatie.
     */
    function setupEventListeners() {
        document.getElementById("addRowButton")?.addEventListener("click", addRow);
        document.getElementById("saveButton")?.addEventListener("click", saveData);
        document.getElementById("tempSaveButton")?.addEventListener("click", () => triggerAutoSave(false));
        document.getElementById("backButton")?.addEventListener("click", () => {
            const currentPath = window.location.pathname;
            const newPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
            window.location.href = window.location.origin + newPath;
        });
        
        document.querySelector("#dataTable tbody")?.addEventListener("input", function(e) {
            if (e.target.matches("input, select")) {
                resetAutoSaveTimer();
            }
            if (e.target.matches('input[placeholder*="cijfers"]')) {
                handleCjibInput(e.target);
            }
        });
        
        window.addEventListener("beforeunload", saveDataOnUnloadSync);
    }
    
    /**
     * Initialiseert de tooltips voor elementen met een `data-help` attribuut.
     */
    function initializeTooltips() {
        tippyInstances.forEach(instance => instance?.destroy());
        tippyInstances = [];
        document.querySelectorAll('[data-help]').forEach(element => {
            const helpText = element.dataset.help;
            if (helpText) {
                tippyInstances.push(tippy(element, {
                    content: helpText, placement: 'top', arrow: true, theme: 'pkv-theme',
                    delay: [200, 0], touch: ['hold', 500], animation: 'scale'
                }));
            }
        });
    }
    
    // ========== Table Manipulation Functions ==========
    
    /**
     * Werkt een specifiek select-element voor gemachtigden bij met de geladen opties.
     * @param {HTMLSelectElement} selectElement - Het dropdown-element.
     * @param {string} [selectedValue=""] - De waarde die geselecteerd moet worden.
     */
    function updateGemachtigdeSelectsDynamic(selectElement, selectedValue = "") {
        selectElement.innerHTML = "<option value=''>-- Kies Gemachtigde --</option>";
        
        let valueFoundInOptions = false;

        // Voeg de standaardopties toe
        gemachtigdenOptions.forEach(item => {
            const option = document.createElement("option");
            const pmValue = item[Config.fieldInternalNames.gemachtigden.naamPM];
            option.value = pmValue;
            option.textContent = pmValue;
            if (pmValue === selectedValue) {
                option.selected = true;
                valueFoundInOptions = true;
            }
            selectElement.appendChild(option);
        });

        // Als de opgeslagen waarde niet in de lijst staat, voeg deze dan alsnog toe en selecteer deze.
        if (selectedValue && !valueFoundInOptions) {
            const customOption = document.createElement("option");
            customOption.value = selectedValue;
            customOption.textContent = `${selectedValue} (Opgeslagen waarde)`;
            customOption.selected = true; // Selecteer deze expliciet
            selectElement.appendChild(customOption);
        }
    }

    /**
     * Voegt een nieuwe, lege rij toe aan de tabel.
     */
    function addRow() {
        const tbody = document.querySelector("#dataTable tbody");
        const tr = document.createElement("tr");
        
        tr.innerHTML = `
            <td data-label="Registratienummer"><input type="text" maxlength="${validationRules.registratienummerLength}" placeholder="${validationRules.registratienummerLength} karakters" data-help="Voer het ${validationRules.registratienummerLength} tekens lange registratienummer in."></td>
            <td data-label="CJIBNummer"><input type="text" placeholder="9 of 16 cijfers" maxlength="16" pattern="\\d*" data-help="Voer het CJIB-nummer in. 16-cijferige nummers worden automatisch ingekort."></td>
            <td data-label="Gemachtigde"><select class="gemachtigdeSelect" data-help="Selecteer de gemachtigde uit de lijst."></select></td>
            <td data-label="Bedrag (€)"><div class="bedrag-container"><span>&euro;</span><input type="text" class="bedragInt" placeholder="0" maxlength="5" pattern="\\d*"><span>,</span><input type="text" class="bedragDec" placeholder="00" maxlength="2" pattern="\\d*"></div></td>
            <td data-label="Naam Betrokkene"><input type="text" placeholder="Naam Betrokkene" data-help="Voer de volledige naam van de betrokkene in."></td>
            <td data-label="Naam Beoordelaar" class="naamBeoordelaar"><input type="hidden" value="${currentUserWindowsID}">${currentUserWindowsID}</td>
            <td data-label="Acties"><button class="button button-danger button-small button-icon-only" type="button" data-help="Verwijder deze rij"><i class="material-icons">delete</i></button></td>
        `;
        
        updateGemachtigdeSelectsDynamic(tr.querySelector(".gemachtigdeSelect"));
        
        tr.querySelector('button.button-danger').onclick = function() {
            if (confirm("Weet u zeker dat u deze rij wilt verwijderen?")) {
                const tempId = tr.dataset.tempId;
                tr.remove();
                if (tempId) deleteTempRecord(tempId);
                resetAutoSaveTimer();
            }
        };
        
        tbody.appendChild(tr);
        initializeTooltips();
    }

    /**
     * Voegt een rij toe op basis van een tijdelijk opgeslagen record.
     */
    function addRowFromTemp(item) {
        const tbody = document.querySelector("#dataTable tbody");
        const tr = document.createElement("tr");
        tr.dataset.tempId = item.Id;
        const fn = Config.fieldInternalNames.pkvTemp;
        
        let bedragValue = item[fn.bedrag]; 
        let bedragInt = "", bedragDec = "";
        if (bedragValue != null) {
            const parts = bedragValue.toString().split('.');
            bedragInt = parts[0] || "";
            bedragDec = (parts[1] || "").padEnd(2, '0').substring(0, 2);
        }

        const beoordelaarValue = item[fn.naamBeoordelaar] || currentUserWindowsID;
        
        tr.innerHTML = `
            <td data-label="Registratienummer"><input type="text" maxlength="${validationRules.registratienummerLength}" value="${item[fn.registratienummer] || ""}"></td>
            <td data-label="CJIBNummer"><input type="text" placeholder="9 of 16 cijfers" maxlength="16" pattern="\\d*" value="${item[fn.cjibNummer] || ""}"></td>
            <td data-label="Gemachtigde"><select class="gemachtigdeSelect"></select></td>
            <td data-label="Bedrag (€)"><div class="bedrag-container"><span>&euro;</span><input type="text" class="bedragInt" value="${bedragInt}" maxlength="5" pattern="\\d*"><span>,</span><input type="text" class="bedragDec" value="${bedragDec}" maxlength="2" pattern="\\d*"></div></td>
            <td data-label="Naam Betrokkene"><input type="text" value="${item[fn.naamBetrokkene] || ""}"></td>
            <td data-label="Naam Beoordelaar" class="naamBeoordelaar"><input type="hidden" value="${beoordelaarValue}">${beoordelaarValue}</td>
            <td data-label="Acties"><button class="button button-danger button-small button-icon-only" type="button"><i class="material-icons">delete</i></button></td>
        `;

        updateGemachtigdeSelectsDynamic(tr.querySelector(".gemachtigdeSelect"), (item[fn.gemachtigde] || "").trim());
        
        tr.querySelector('button.button-danger').onclick = function() {
            if (confirm("Weet u zeker dat u deze rij wilt verwijderen?")) {
                tr.remove();
                if (item.Id) deleteTempRecord(item.Id);
                resetAutoSaveTimer();
            }
        };

        tbody.appendChild(tr);
    }
    
    /**
     * Verwerkt de invoer voor het CJIB-nummer om alleen cijfers toe te staan en de lengte aan te passen.
     */
    function handleCjibInput(inputElement) {
        let value = inputElement.value.replace(/\D/g, '');
        if (value.length > validationRules.cjibNummerLength && value.length !== 16) {
            value = value.slice(0, validationRules.cjibNummerLength);
        }
        inputElement.value = value;
    }
    
    // ========== Auto-save Functions ==========
    
    /**
     * Herstart de timer voor automatisch opslaan.
     */
    function resetAutoSaveTimer() {
        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => triggerAutoSave(true), Config.autoSaveInterval);
    }
    
    /**
     * Start het proces voor automatisch opslaan.
     * @param {boolean} isAuto - Geeft aan of dit een automatische of handmatige trigger is.
     */
    async function triggerAutoSave(isAuto = true) {
        if (isAutosaveRunning) return;
        isAutosaveRunning = true;
        
        if (!isAuto) {
            showNotification("Bezig met tussentijds opslaan...", "", 0);
        }

        try {
            const { successCount, errorCount, errorMessages } = await tempSaveData();
            if (!isAuto) {
                if (errorCount > 0) {
                    displayErrors([`Kon ${errorCount} rij(en) niet tussentijds opslaan.`, ...errorMessages]);
                } else if (successCount > 0) {
                    showNotification(`${successCount} rij(en) succesvol tussentijds opgeslagen!`, "success");
                } else {
                    showNotification("Geen wijzigingen om tussentijds op te slaan.");
                }
            }
        } catch (error) {
            console.error("Error during temp save:", error);
            if (!isAuto) {
                showNotification(`Fout bij opslaan: ${error.message}`, "error", 0);
            }
            // Probeer lokaal op te slaan als SharePoint faalt
            saveToLocalStorage();
            showNotification("SharePoint onbereikbaar. Data is lokaal opgeslagen als back-up.", "error", 0);

        } finally {
            isAutosaveRunning = false;
        }
    }
    
    /**
     * Verzamelt en valideert de data van een enkele rij.
     */
    function collectAndValidateRowData(row, index, isTempSave = false) {
        let errors = [];
        let errorElements = [];
        const getEl = (sel) => row.querySelector(sel);
        const { isRegNrLengthValidationActive, isCjibLengthValidationActive, isMinimumAmountValidationActive, ...rules } = validationRules;
        
        const registratienummerInput = getEl("td:nth-child(1) input");
        const registratienummer = registratienummerInput?.value.trim().toUpperCase() || "";
        if (!isTempSave && isRegNrLengthValidationActive && registratienummer.length !== rules.registratienummerLength) {
            errors.push(`Rij ${index + 1}: Registratienummer moet ${rules.registratienummerLength} karakters zijn.`);
            errorElements.push(registratienummerInput);
        }
        
        const cjibnummerInput = getEl("td:nth-child(2) input");
        let cjibnummerStr = cjibnummerInput?.value.trim().replace(/\D/g, '') || "";
        if (cjibnummerStr.length === 16) {
            cjibnummerStr = cjibnummerStr.substring(7); // Behoud de laatste 9 cijfers
        }
        if (!isTempSave && isCjibLengthValidationActive && cjibnummerStr && cjibnummerStr.length !== rules.cjibNummerLength) {
            errors.push(`Rij ${index + 1}: CJIBNummer moet ${rules.cjibNummerLength} cijfers zijn.`);
            errorElements.push(cjibnummerInput);
        }
        
        const gemachtigdeSelect = getEl("td:nth-child(3) select");
        const gemachtigdeValue = gemachtigdeSelect?.value?.trim() || "";
        if (!isTempSave && !gemachtigdeValue) {
            errors.push(`Rij ${index + 1}: Gemachtigde is verplicht.`);
            errorElements.push(gemachtigdeSelect);
        }
        
        const bedragIntInput = getEl("td:nth-child(4) .bedragInt");
        const bedragDecInput = getEl("td:nth-child(4) .bedragDec");
        const bedragIntStr = bedragIntInput?.value.trim().replace(/\D/g, '') || "0";
        const bedragDecStr = (bedragDecInput?.value.trim().replace(/\D/g, '') || "00").padEnd(2, '0');
        const combinedBedrag = parseFloat(`${bedragIntStr}.${bedragDecStr}`);
        if (!isTempSave && isMinimumAmountValidationActive && combinedBedrag < rules.minimumBedrag) {
            errors.push(`Rij ${index + 1}: Bedrag moet minimaal ${rules.minimumBedrag.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })} zijn.`);
            errorElements.push(bedragIntInput.parentElement);
        }
        
        const naamBetrokkeneInput = getEl("td:nth-child(5) input");
        const naamBetrokkene = naamBetrokkeneInput?.value.trim() || "";
        if (!isTempSave && !naamBetrokkene) {
            errors.push(`Rij ${index + 1}: Naam Betrokkene is verplicht.`);
            errorElements.push(naamBetrokkeneInput);
        }
        
        return { errors, errorElements, registratienummer, cjibNummerForSave: cjibnummerStr || null, gemachtigdeValue, combinedBedrag, naamBetrokkene };
    }
    
    // ========== SharePoint API Functions ==========
    
    /**
     * Haalt een request digest op van SharePoint, nodig voor schrijfacties.
     */
    async function getRequestDigest() {
        const response = await fetch(`${Config.siteUrl}/_api/contextinfo`, { method: "POST", headers: { "Accept": "application/json;odata=verbose" } });
        if (!response.ok) throw new Error("Kon request digest niet ophalen.");
        const data = await response.json();
        return data.d.GetContextWebInformation.FormDigestValue;
    }

    /**
     * Haalt een request digest synchroon op (alleen voor beforeunload).
     */
    function getRequestDigestSync() {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${Config.siteUrl}/_api/contextinfo`, false);
        xhr.setRequestHeader("Accept", "application/json;odata=verbose");
        try {
            xhr.send(null);
            return xhr.status === 200 ? JSON.parse(xhr.responseText).d.GetContextWebInformation.FormDigestValue : null;
        } catch (e) { return null; }
    }
    
    /**
     * Laadt tijdelijk opgeslagen records voor de huidige gebruiker.
     */
    async function loadTempRecords() {
        if (!currentUserWindowsID || currentUserWindowsID === "onbekend") {
            if (document.querySelectorAll("#dataTable tbody tr").length === 0) addRow();
            return;
        }
        
        const fnTemp = Config.fieldInternalNames.pkvTemp;
        const url = `${Config.siteUrl}/_api/web/lists/GetByTitle('${Config.lists.pkvTemp}')/items?$select=Id,${Object.values(fnTemp).filter(n=>n!=='Id').join(',')}&$filter=${fnTemp.windowsID} eq '${currentUserWindowsID}'&$top=500`;
        
        try {
            const response = await fetch(url, { headers: { "Accept": "application/json;odata=verbose" }, signal: AbortSignal.timeout(10000) });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            
            const tbody = document.querySelector("#dataTable tbody");
            tbody.innerHTML = '';
            if (data.d.results.length > 0) {
                data.d.results.forEach(item => addRowFromTemp(item));
                showNotification(`Geladen: ${data.d.results.length} tijdelijk opgeslagen rij(en).`, '', 3000);
            } else {
                addRow();
            }
        } catch (error) {
            console.error("Error loading temp records:", error);
            showNotification(`Kon tijdelijke records niet laden. Controleer de verbinding.`, "error", 0);
            // Laad vanuit lokale opslag als die er is
            const localData = loadFromLocalStorage();
            if (localData && localData.length > 0) {
                const tbody = document.querySelector("#dataTable tbody");
                tbody.innerHTML = '';
                localData.forEach(item => addRowFromLocalData(item));
                showNotification("Data hersteld van lokale back-up.", "", 5000);
            } else if (document.querySelectorAll("#dataTable tbody tr").length === 0) {
                addRow();
            }
        }
    }
    
    // ========== Local Storage Backup Functions ==========

    /**
     * Slaat de huidige tabeldata op in de lokale opslag van de browser.
     */
    function saveToLocalStorage() {
        try {
            const rows = document.querySelectorAll("#dataTable tbody tr");
            const localData = [];
            
            rows.forEach((row, index) => {
                const { errors, errorElements, ...dataFields } = collectAndValidateRowData(row, index, true);
                const hasData = Object.values(dataFields).some(val => val !== null && val !== '' && val !== undefined && val !== 0);
                
                if (hasData) {
                    localData.push({ ...dataFields });
                }
            });
            
            if (localData.length > 0) {
                localStorage.setItem(`PKV_LocalData_${currentUserWindowsID}`, JSON.stringify(localData));
                logDebug("Data saved to localStorage backup.");
                return true;
            } else {
                localStorage.removeItem(`PKV_LocalData_${currentUserWindowsID}`);
            }
        } catch (error) {
            console.error("Error saving to localStorage:", error);
        }
        return false;
    }
    
    /**
     * Laadt data uit de lokale opslag.
     */
    function loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem(`PKV_LocalData_${currentUserWindowsID}`);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error("Error loading from localStorage:", error);
            return null;
        }
    }
    
    /**
     * Controleert of er lokale data is en biedt aan om te synchroniseren.
     */
    function checkAndOfferLocalDataSync() {
        const localData = loadFromLocalStorage();
        if (localData && localData.length > 0) {
            const syncButton = document.createElement('button');
            syncButton.id = 'syncLocalDataButton';
            syncButton.className = 'button button-warning';
            syncButton.innerHTML = '<i class="material-icons">sync</i> Sync Lokale Data';
            syncButton.onclick = syncLocalDataToSharePoint;
            
            document.getElementById('mainActionButtons')?.prepend(syncButton);
            showNotification(`${localData.length} lokaal opgeslagen rij(en) gevonden. Klik 'Sync' om te uploaden.`, "warning", 0);
        }
    }
    
    /**
     * Synchroniseert lokaal opgeslagen data naar SharePoint.
     */
    async function syncLocalDataToSharePoint() {
        const localData = loadFromLocalStorage();
        if (!localData || localData.length === 0) return;
        
        showNotification("Synchroniseren naar SharePoint...", "", 0);
        
        try {
            const fnTemp = Config.fieldInternalNames.pkvTemp;
            let successCount = 0;
            
            for (const itemData of localData) {
                const cjibNumberValue = itemData.cjibNummerForSave ? parseInt(itemData.cjibNummerForSave, 10) : null;
                if (!cjibNumberValue) continue; // Sla rijen zonder CJIB-nummer over

                const sharePointItem = {
                    __metadata: { type: `SP.Data.${Config.lists.pkvTemp}ListItem` },
                    [fnTemp.title]: `PKVTemp-LokaalSync-${Date.now()}`,
                    [fnTemp.registratienummer]: itemData.registratienummer,
                    [fnTemp.cjibNummer]: cjibNumberValue,
                    [fnTemp.gemachtigde]: itemData.gemachtigdeValue,
                    [fnTemp.bedrag]: !isNaN(itemData.combinedBedrag) ? itemData.combinedBedrag : null,
                    [fnTemp.naamBetrokkene]: itemData.naamBetrokkene,
                    [fnTemp.naamBeoordelaar]: currentUserWindowsID,
                    [fnTemp.windowsID]: currentUserWindowsID,
                    [fnTemp.aangemaaktPer]: new Date().toISOString()
                };
                
                const requestDigest = await getRequestDigest();
                const response = await fetch(`${Config.siteUrl}/_api/web/lists/GetByTitle('${Config.lists.pkvTemp}')/items`, {
                    method: "POST",
                    headers: { "Accept": "application/json;odata=verbose", "Content-Type": "application/json;odata=verbose", "X-RequestDigest": requestDigest },
                    body: JSON.stringify(sharePointItem)
                });
                
                if (response.ok) successCount++;
            }
            
            localStorage.removeItem(`PKV_LocalData_${currentUserWindowsID}`);
            document.getElementById('syncLocalDataButton')?.remove();
            showNotification(`${successCount} rij(en) succesvol gesynchroniseerd! De pagina wordt herladen.`, "success", 5000);
            setTimeout(() => window.location.reload(), 2000);
            
        } catch (error) {
            showNotification(`Fout bij synchroniseren: ${error.message}.`, "error", 0);
        }
    }

    /**
     * Voegt een rij toe op basis van lokaal opgeslagen data.
     */
    function addRowFromLocalData(item) {
        const tbody = document.querySelector("#dataTable tbody");
        const tr = document.createElement("tr");
        tr.dataset.localData = "true";
        
        let bedragInt = "", bedragDec = "";
        if (item.combinedBedrag != null) {
            const parts = item.combinedBedrag.toString().split('.');
            bedragInt = parts[0] || "";
            bedragDec = (parts[1] || "").padEnd(2, '0').substring(0, 2);
        }
        
        tr.innerHTML = `
            <td data-label="Registratienummer"><input type="text" maxlength="${validationRules.registratienummerLength}" value="${item.registratienummer || ""}"></td>
            <td data-label="CJIBNummer"><input type="text" placeholder="9 of 16 cijfers" maxlength="16" pattern="\\d*" value="${item.cjibNummerForSave || ""}"></td>
            <td data-label="Gemachtigde"><select class="gemachtigdeSelect"></select></td>
            <td data-label="Bedrag (€)"><div class="bedrag-container"><span>&euro;</span><input type="text" class="bedragInt" value="${bedragInt}"><span>,</span><input type="text" class="bedragDec" value="${bedragDec}"></div></td>
            <td data-label="Naam Betrokkene"><input type="text" value="${item.naamBetrokkene || ""}"></td>
            <td data-label="Naam Beoordelaar" class="naamBeoordelaar"><input type="hidden" value="${currentUserWindowsID}">${currentUserWindowsID}</td>
            <td data-label="Acties"><button class="button button-danger button-small button-icon-only" type="button"><i class="material-icons">delete</i></button></td>
        `;

        updateGemachtigdeSelectsDynamic(tr.querySelector(".gemachtigdeSelect"), item.gemachtigdeValue || "");
        tr.querySelector('button.button-danger').onclick = function() {
            if (confirm("Weet u zeker dat u deze rij wilt verwijderen?")) {
                tr.remove();
                saveToLocalStorage(); // Werk lokale opslag bij
            }
        };
        tbody.appendChild(tr);
    }
    
    /**
     * Slaat alle gevalideerde rijen definitief op in de hoofdlijst.
     */
    async function saveData() {
        const rows = document.querySelectorAll("#dataTable tbody tr");
        let itemsToSave = [], overallValidationMessages = [], overallValidationErrorElements = [];
        const fnFinal = Config.fieldInternalNames.proceskostenvergoeding;
        
        if (rows.length === 0) return displayErrors(["Er zijn geen rijen om op te slaan."]); 
        
        rows.forEach((row, index) => {
            const { errors, errorElements, ...dataFields } = collectAndValidateRowData(row, index, false);
            const isRowEmpty = !Object.values(dataFields).some(v => v);
            if (isRowEmpty) return;

            if (errors.length > 0) {
                overallValidationMessages.push(...errors);
                overallValidationErrorElements.push(...errorElements);
            } else {
                const item = {
                    __metadata: { type: `SP.Data.${Config.lists.proceskostenvergoeding}ListItem` },
                    [fnFinal.title]: `PKV-${dataFields.registratienummer || 'Nieuw'}-${new Date().toISOString().split('T')[0]}`,
                    [fnFinal.registratienummer]: dataFields.registratienummer,
                    [fnFinal.cjibNummer]: dataFields.cjibNummerForSave ? parseInt(dataFields.cjibNummerForSave, 10) : null,
                    [fnFinal.gemachtigde]: dataFields.gemachtigdeValue,
                    [fnFinal.bedrag]: dataFields.combinedBedrag,
                    [fnFinal.naamBetrokkene]: dataFields.naamBetrokkene,
                    [fnFinal.naamBeoordelaar]: currentUserWindowsID,
                    [fnFinal.isLease]: false, [fnFinal.isNieuw]: true,
                    [fnFinal.aangemaaktPer]: new Date().toISOString(),
                    [fnFinal.windowsID]: currentUserWindowsID,
                };
                itemsToSave.push({ item, tempId: row.dataset.tempId, rowElement: row });
            }
        });
        
        if (overallValidationMessages.length > 0) return displayErrors(overallValidationMessages, overallValidationErrorElements);
        if (itemsToSave.length === 0) return showNotification("Geen valide gegevens om op te slaan.");
        
        showNotification("Bezig met definitief opslaan...", "", 0);
        
        try {
            const requestDigest = await getRequestDigest();
            let successCount = 0;
            
            for (const { item, tempId, rowElement } of itemsToSave) {
                const response = await fetch(`${Config.siteUrl}/_api/web/lists/GetByTitle('${Config.lists.proceskostenvergoeding}')/items`, {
                    method: "POST",
                    headers: { "Accept": "application/json;odata=verbose", "Content-Type": "application/json;odata=verbose", "X-RequestDigest": requestDigest },
                    body: JSON.stringify(item)
                });
                if (response.ok) {
                    successCount++;
                    rowElement.remove();
                    if (tempId) await deleteTempRecord(tempId);
                } else {
                     const err = await response.json();
                     throw new Error(`Fout bij opslaan rij: ${err.error?.message?.value || response.statusText}`);
                }
            }
            
            showNotification(`${successCount} rij(en) succesvol toegevoegd!`, "success");
            if (document.querySelectorAll("#dataTable tbody tr").length === 0) addRow();
        } catch (error) {
            showNotification(`Fout bij opslaan: ${error.message}`, "error", 0);
        }
    }
    
    /**
     * Slaat de data van alle rijen tussentijds op in de PKVTemp-lijst.
     */
    async function tempSaveData() {
        const rows = document.querySelectorAll("#dataTable tbody tr");
        const fnTemp = Config.fieldInternalNames.pkvTemp;
        let successCount = 0, errorCount = 0;
        let errorMessages = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            row.style.backgroundColor = ''; // Reset error highlight
            const { errors, ...dataFields } = collectAndValidateRowData(row, i, true);
            const hasData = Object.values(dataFields).some(val => val !== null && val !== '' && val !== undefined && val !== 0);

            if (!hasData) {
                if (row.dataset.tempId) await deleteTempRecord(row.dataset.tempId);
                continue;
            }
            
            let itemForSP = {};
            try {
                const cjibNumberValue = dataFields.cjibNummerForSave ? parseInt(dataFields.cjibNummerForSave, 10) : null;
                const bedragValue = !isNaN(dataFields.combinedBedrag) ? dataFields.combinedBedrag : null;

                // Voor tussentijds opslaan, slaan we alleen op als het verplichte CJIB-nummer aanwezig is.
                if (cjibNumberValue === null || isNaN(cjibNumberValue)) {
                    // Sla deze rij over voor opslaan, maar markeer het niet als een harde fout.
                    // De gebruiker kan nog aan het typen zijn.
                    continue; 
                }

                itemForSP = {
                    __metadata: { type: `SP.Data.${Config.lists.pkvTemp}ListItem` },
                    [fnTemp.title]: `PKVTemp-${dataFields.registratienummer || 'Nieuw'}-${Date.now()}`,
                    [fnTemp.registratienummer]: dataFields.registratienummer,
                    [fnTemp.cjibNummer]: cjibNumberValue,
                    [fnTemp.gemachtigde]: dataFields.gemachtigdeValue,
                    [fnTemp.bedrag]: bedragValue,
                    [fnTemp.naamBetrokkene]: dataFields.naamBetrokkene,
                    [fnTemp.naamBeoordelaar]: currentUserWindowsID,
                    [fnTemp.windowsID]: currentUserWindowsID,
                    [fnTemp.aangemaaktPer]: new Date().toISOString()
                };
                
                const requestDigest = await getRequestDigest();
                const isUpdate = !!row.dataset.tempId;
                const url = isUpdate 
                    ? `${Config.siteUrl}/_api/web/lists/GetByTitle('${Config.lists.pkvTemp}')/items(${row.dataset.tempId})`
                    : `${Config.siteUrl}/_api/web/lists/GetByTitle('${Config.lists.pkvTemp}')/items`;
                
                const response = await fetch(url, {
                    method: "POST",
                    headers: { 
                        "Accept": "application/json;odata=verbose", 
                        "Content-Type": "application/json;odata=verbose", 
                        "X-RequestDigest": requestDigest, 
                        "IF-MATCH": isUpdate ? "*" : undefined, 
                        "X-HTTP-Method": isUpdate ? "MERGE" : undefined 
                    },
                    body: JSON.stringify(itemForSP)
                });

                if (response.ok) {
                    successCount++;
                    if (!isUpdate) {
                        const data = await response.json();
                        if (data.d?.Id) row.dataset.tempId = data.d.Id;
                    }
                } else {
                     const err = await response.json();
                     throw new Error(err.error?.message?.value || response.statusText);
                }
            } catch (error) {
                errorCount++;
                errorMessages.push(`Rij ${i + 1}: ${error.message}`);
                row.style.backgroundColor = '#fee2e2';
                console.error(`Failed to save row ${i + 1}:`, {
                    error: error.message,
                    sentItem: itemForSP
                });
            }
        }
        
        return { successCount, errorCount, errorMessages };
    }
    
    /**
     * Verwijderd een specifiek record uit de tijdelijke opslaglijst.
     */
    async function deleteTempRecord(tempId) {
        if (!tempId) return;
        try {
            const digest = await getRequestDigest();
            await fetch(`${Config.siteUrl}/_api/web/lists/GetByTitle('${Config.lists.pkvTemp}')/items(${tempId})`, {
                method: "POST",
                headers: { "X-RequestDigest": digest, "IF-MATCH": "*", "X-HTTP-Method": "DELETE" }
            });
        } catch (error) {
            console.error("Error deleting temp record:", error);
            // Niet tonen aan gebruiker, dit is een achtergrondproces
        }
    }
    
    /**
     * Slaat data synchroon op bij het sluiten van de pagina.
     */
    function saveDataOnUnloadSync() {
        const digest = getRequestDigestSync();
        if (!digest || document.querySelectorAll("#dataTable tbody tr").length === 0) {
            return;
        }

        const rows = document.querySelectorAll("#dataTable tbody tr");
        const fnTemp = Config.fieldInternalNames.pkvTemp;

        rows.forEach((row, index) => {
            const { errors, ...dataFields } = collectAndValidateRowData(row, index, true);
            const hasData = Object.values(dataFields).some(val => val !== null && val !== '' && val !== undefined && val !== 0);
            const tempId = row.dataset.tempId;

            const xhr = new XMLHttpRequest();
            let url, body, method = "POST", httpMethod;

            const cjibNumberValue = dataFields.cjibNummerForSave ? parseInt(dataFields.cjibNummerForSave, 10) : null;
            
            // Sla alleen op als er data is EN een geldig CJIB-nummer (verplicht veld)
            if (!hasData || !cjibNumberValue) {
                if (tempId) { // Als er geen data meer is maar wel een tempId, verwijder het item
                    url = `${Config.siteUrl}/_api/web/lists/GetByTitle('${Config.lists.pkvTemp}')/items(${tempId})`;
                    httpMethod = "DELETE";
                    body = null;
                } else {
                    return; // Geen data en geen tempId, niks te doen
                }
            } else {
                // Update of maak nieuwe temp item
                const item = {
                    __metadata: { type: `SP.Data.${Config.lists.pkvTemp}ListItem` },
                    [fnTemp.title]: `PKVTemp-Unload-${Date.now()}`,
                    [fnTemp.registratienummer]: dataFields.registratienummer,
                    [fnTemp.cjibNummer]: cjibNumberValue,
                    [fnTemp.gemachtigde]: dataFields.gemachtigdeValue,
                    [fnTemp.bedrag]: !isNaN(dataFields.combinedBedrag) ? dataFields.combinedBedrag : null,
                    [fnTemp.naamBetrokkene]: dataFields.naamBetrokkene,
                    [fnTemp.naamBeoordelaar]: currentUserWindowsID,
                    [fnTemp.windowsID]: currentUserWindowsID,
                    [fnTemp.aangemaaktPer]: new Date().toISOString()
                };
                body = JSON.stringify(item);

                if (tempId) {
                    url = `${Config.siteUrl}/_api/web/lists/GetByTitle('${Config.lists.pkvTemp}')/items(${tempId})`;
                    httpMethod = "MERGE";
                } else {
                    url = `${Config.siteUrl}/_api/web/lists/GetByTitle('${Config.lists.pkvTemp}')/items`;
                }
            }

            xhr.open(method, url, false); // false = synchroon
            xhr.setRequestHeader("Accept", "application/json;odata=verbose");
            xhr.setRequestHeader("X-RequestDigest", digest);
            if(body) xhr.setRequestHeader("Content-Type", "application/json;odata=verbose");
            if(httpMethod) xhr.setRequestHeader("X-HTTP-Method", httpMethod);
            if(httpMethod === "MERGE" || httpMethod === "DELETE") xhr.setRequestHeader("IF-MATCH", "*");
            
            try {
                xhr.send(body);
            } catch (e) {
                console.error("Sync XHR error on unload:", e);
            }
        });
    }
    
    // ========== Initialization & Public API ==========
    
    /**
     * Initialisatiefunctie
     */
    async function init() {
        showNotification("Applicatie laden...", "", 0);
        try {
            await fetchValidationConfig();
            await fetchGemachtigdenOptions();
            await getCurrentUserData(); // Laadt ook temp records
            
            setFooterMessage();
            setupEventListeners();
            initializeTooltips();
            resetAutoSaveTimer();
            
            logDebug("PKV Opdrachten application initialized successfully.");
            showNotification("Applicatie succesvol geladen.", "success", 2000);
        } catch (error) {
            console.error("Fatal error during initialization:", error);
            displayErrors([`Kritieke fout bij initialiseren: ${error.message}. Probeer de pagina te vernieuwen.`]);
        }
    }
    
    return { init };
})();

document.addEventListener("DOMContentLoaded", PKVApp.init);
