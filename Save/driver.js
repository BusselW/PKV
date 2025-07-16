// driver.js
'use strict';

let appTour;       // Holds our Driver.js instance
let tourDefined = false;

/**
 * Build the steps for the PKV tour.
 */
function getPKVTourSteps() {
  const rules = validationRules;
  const minBedrag = rules.minimumBedrag
    .toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  const firstRow = document.querySelector('#dataTable tbody tr:first-child');

  // Selectors or fallbacks
  const sel = {
    regNr:     firstRow ? 'tbody tr:first-child td:nth-child(1) input'   : '#thRegNr',
    cjib:      firstRow ? 'tbody tr:first-child td:nth-child(2) input'   : '#thCjib',
    gem:       firstRow ? 'tbody tr:first-child td:nth-child(3) select'  : '#thGem',
    bedrag:    firstRow ? 'tbody tr:first-child td:nth-child(4) .bedrag-container' : '#thBedrag',
    naam:      firstRow ? 'tbody tr:first-child td:nth-child(5) input'   : '#thNaamBetr',
  };

  const steps = [
    {
      element: '#pageTitle',
      popover: {
        title: 'Welkom bij PKV Opdrachten!',
        description: 'Deze rondleiding helpt u op weg met het toevoegen van PKV-opdrachten.',
        side: 'bottom', align: 'start'
      }
    },
    {
      element: '#dataTable',
      popover: {
        title: 'Invoertabel',
        description: 'Hier voert u de details van elke opdracht in.',
        side: 'top', align: 'center'
      },
      stageOptions: { padding: 10 }
    },
    {
      element: `#${sel.regNr}`,
      popover: {
        title: 'Registratienummer',
        description: `Exact ${rules.registratienummerLength} tekens.`,
        side: 'bottom', align: 'start'
      }
    },
    {
      element: `#${sel.cjib}`,
      popover: {
        title: 'CJIB-nummer',
        description: `Vul ${rules.cjibNummerLength} cijfers in.`,
        side: 'bottom', align: 'start'
      }
    },
    {
      element: `#${sel.gem}`,
      popover: {
        title: 'Gemachtigde',
        description: 'Selecteer de gemachtigde.',
        side: 'right', align: 'start'
      }
    },
    {
      element: `#${sel.bedrag}`,
      popover: {
        title: 'Bedrag',
        description: `Minimaal ${minBedrag}.`,
        side: 'bottom', align: 'start'
      }
    },
    {
      element: `#${sel.naam}`,
      popover: {
        title: 'Naam Betrokkene',
        description: 'Vul de naam in.',
        side: 'left', align: 'start'
      }
    },
    {
      element: '#thNaamBeoord',
      popover: {
        title: 'Naam Beoordelaar',
        description: `Uw Windows ID: ${currentUserWindowsID || 'laden...'}`,
        side: 'bottom', align: 'start'
      }
    },
    {
      element: '#mainActionButtons',
      popover: {
        title: 'Actieknoppen',
        description: 'Beheer uw rijen en tussentijdse opslag.',
        side: 'top', align: 'start'
      },
      stageOptions: { padding: 10 }
    },
    {
      element: '#addRowButton',
      popover: {
        title: 'Rij Toevoegen',
        description: 'Nieuwe opdracht toevoegen.',
        side: 'top', align: 'center'
      }
    },
    {
      element: '#tempSaveButton',
      popover: {
        title: 'Tussentijds Opslaan',
        description: 'Sla op zonder te verzenden.',
        side: 'top', align: 'center'
      }
    },
    {
      element: '#oldButton',
      popover: {
        title: 'Oude Opdrachten',
        description: 'Bekijk eerder verwerkte opdrachten.',
        side: 'top', align: 'center'
      }
    },
    {
      element: '#saveButton',
      popover: {
        title: 'Verzenden',
        description: 'Definitief verzenden.',
        side: 'left', align: 'start'
      }
    },
    {
      element: '#backButton',
      popover: {
        title: 'Vorige Pagina',
        description: 'Keer terug naar de vorige pagina.',
        side: 'right', align: 'start'
      }
    }
  ];

  // If admin button was injected by scripts.js
  if (document.getElementById('adminButton')) {
    steps.splice(8, 0, {
      element: '#adminButton',
      popover: {
        title: 'Admin Opties',
        description: 'Extra opties voor beheerders.',
        side: 'left', align: 'start'
      }
    });
  }

  // Final “restart” step
  steps.push({
    element: '#help',
    popover: {
      title: 'Help opnieuw',
      description: 'Klik om deze rondleiding opnieuw te starten.',
      side: 'left', align: 'start'
    }
  });

  return steps;
}

/**
 * (Re)define and start the tour.
 */
function startPKVTour() {
  // Ensure Driver.js is loaded
  if (typeof Driver === 'undefined') {
    console.error('Driver.js library is not loaded!');
    alert('De rondleiding kon niet starten; Driver.js ontbreekt.');
    return;
  }

  // First time: create instance
  if (!appTour) {
    appTour = new Driver({
      showProgress: true,
      popoverClass: 'pkv-tour-popover',
      stagePadding: 8,
      overlayOpacity: 0.7,
      animate: true,
      allowClose: true,
      nextBtnText: 'Volgende »',
      prevBtnText: '« Vorige',
      doneBtnText: 'Einde',
      onDestroy: () => console.log('PKV Tour beëindigd.')
    });
  }

  // Define steps once
  if (!tourDefined) {
    appTour.defineSteps(getPKVTourSteps());
    tourDefined = true;
  }

  // Start the tour
  appTour.start();
}

// Bind only to your renamed button
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('help');
  if (btn) {
    btn.addEventListener('click', startPKVTour);
  } else {
    console.warn('#help button niet gevonden—controleer je HTML.');
  }
});
