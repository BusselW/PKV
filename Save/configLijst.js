// configLijst.js
// Configuration settings for the PKV Opdrachten application.
// Defines a global variable `PKV_Config`.

window.PKV_Config = {
    // Base URL of the SharePoint site
    siteUrl: "https://som.org.om.local/sites/MulderT/PKV",

    // Titles of the SharePoint lists used
    lists: {
        proceskostenvergoeding: "Proceskostenvergoeding", 
        pkvTemp: "PKVTemp",                         
        gemachtigden: "t_gemachtigdenlijst",
        beheer: "BeheerPKV"        
    },

    // Field internal names, structured by list
    fieldInternalNames: {
        proceskostenvergoeding: { 
            title: "Title",
            registratienummer: "Registratienummer",
            cjibNummer: "CJIB_x002d_nummer", 
            gemachtigde: "Gemachtigde",
            bedrag: "Bedrag",
            naamBetrokkene: "Naam_x0020_betrokkene", 
            naamBeoordelaar: "Naam_x0020_beoordelaar", 
            windowsID: "WindowsID",
            aangemaaktPer: "AangemaaktPer",
            isLease: "IsLease",
            isNieuw: "IsNieuw"
        },
        pkvTemp: { 
            title: "Title",
            id: "ID",
            registratienummer: "Registratienummer", 
            cjibNummer: "CJIBnummer", 
            gemachtigde: "Gemachtigde", 
            bedrag: "Bedrag", 
            naamBetrokkene: "NaamBetrokkene", 
            naamBeoordelaar: "NaamBeoordelaar", 
            windowsID: "WindowsID", 
            aangemaaktPer: "AangemaaktPer" 
        },
        gemachtigden: { 
            naamPM: "NaamPM", 
            verbergen: "VerbergenInBetaalopdrachten" 
        },
        beheer: { 
            lengteCJIB: "LengteCJIB", 
            maxKaraktersZaakNR: "MaxKaraktersZaakNR", 
            minimumBedrag: "MinimumbedragWaarde",
            // EDIT START: Added internal names for the new boolean fields from SharePoint.
            JNLengteCJIB: "JNLengteCJIB",
            JNMaxKaraktersZaakNR: "JNMaxKaraktersZaakNR",
            JNMinimumBedragWaarde: "JNMinimumBedragWaarde"
            // EDIT END
        }
    },

    // Default validation values (used if fetching from BeheerPKV fails)
    validationDefaults: {
        registratienummerLength: 6,
        cjibNummerLength: 9, 
        cjibAllowedLengths: [9, 16], 
        minimumBedrag: 0
    },

    // SharePoint Group Names that should see the general Admin button
    adminGroups: [
        "1. Sharepoint beheer",
        "1.1. Mulder MT",
        "2.5 Proceskostenvergoeding"
    ],
    
    // SharePoint Group Names that should see the 'Validatieregels' button
    validationRulesAdminGroups: [
        "1. Sharepoint beheer",
        "1.1 Mulder MT"
    ],

    // Autosave timer interval in milliseconds (e.g., 60000ms = 1 minute)
    autoSaveInterval: 60000,

    // Debug mode: true to enable more console logging
    debugMode: true // Set to false for production
};

// Log to confirm config is loaded (optional)
if (window.PKV_Config.debugMode) {
    console.log("PKV_Config loaded (v6 with dynamic validation fields):", JSON.parse(JSON.stringify(window.PKV_Config))); 
}
