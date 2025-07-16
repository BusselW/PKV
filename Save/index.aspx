<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>PKV-opdrachten Toevoegen</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap" rel="stylesheet">
  
	<link rel="icon" type="image/svg+xml" href="icoon/favicon.svg" />

  <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.4.1/css/bootstrap.min.css" rel="stylesheet">
  
  <!-- Tooltips en Modals -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tippy.js@6/dist/tippy.css">
  
  <link rel="stylesheet" type="text/css" href="styles.css">

  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>  
  <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.4.1/js/bootstrap.min.js"></script>
</head>
<body>
  <div class="page-wrapper">
    <header class="header">
      <div class="header-top-row">
          <button id="backButton" class="button button-icon-only" title="Vorige pagina">
              <i class="material-icons">arrow_back</i>
          </button>
          <div class="logo">
              <h1>Toevoegen PKV-opdrachten</h1>
          </div>
          <div class="header-actions">
            <div id="adminButtonContainer" style="display: inline-block;"></div>
            <div id="validationRulesButtonContainer" style="display: inline-block;"></div>
            <button id="helpButton" class="button button-help" title="Help">
                <i class="material-icons">help_outline</i> Help
            </button>
            <button id="tourButton" class="button button-tour" title="Start Interactieve Handleiding">
                <i class="material-icons">play_circle_outline</i> Rondleiding
            </button>
          </div>
      </div>
      <nav class="nav">
          <ul class="nav-menu">
            <li><a href="https://som.org.om.local/sites/MulderT">Home</a></li>
            <li><a href="https://som.org.om.local/sites/MulderT/Kennis/SitePages/Home.aspx">Kennis</a></li>
            <li class="has-submenu">
              <a href="https://som.org.om.local/sites/MulderT/Onderdelen/SitePages/Home.aspx">Onderdelen</a>
              <ul class="submenu">
                <li class="has-submenu">
                  <a href="https://som.org.om.local/sites/MulderT/Onderdelen/MulderAdministratie/SitePages/Home.aspx">Administratie</a>
                  <ul class="submenu level3">
                    <li><a href="https://som.org.om.local/sites/MulderT/Onderdelen/MulderAdministratie/SitePages/Home.aspx">Algemeen</a></li>
                    <li><a href="https://som.org.om.local/sites/MulderT/Onderdelen/MulderAdministratie/Postverwerking/SitePages/Home.aspx">Verwerken</a></li>
                    <li><a href="https://som.org.om.local/sites/MulderT/Onderdelen/MulderAdministratie/Kanton/SitePages/Home.aspx">Beoordelen</a></li>
                    <li><a href="https://som.org.om.local/sites/MulderT/Onderdelen/MulderAdministratie/Hoorpoule/SitePages/Home.aspx">Hoorpoule</a></li>
                    <li><a href="https://som.org.om.local/sites/MulderT/Onderdelen/MulderAdministratie/Griffieren/SitePages/Home.aspx">Griffiers</a></li>
                    <li><a href="https://som.org.om.local/sites/MulderT/Onderdelen/MulderAdministratie/Verkeerstoren/SitePages/home.aspx">Verkeerstoren</a></li>
                    <li><a href="https://som.org.om.local/sites/MulderT/PKV/SitePages/Home.aspx">PKV</a></li>
                  </ul>
                </li>
                <li class="has-submenu">
                  <a href="https://som.org.om.local/sites/MulderT/Onderdelen/Beoordelen/SitePages/Algemeen.aspx">Beoordelen</a>
                  <ul class="submenu level3">
                    <li><a href="https://som.org.om.local/sites/MulderT/Onderdelen/Beoordelen/SitePages/Algemeen.aspx">Algemeen</a></li>
                    <li><a href="https://som.org.om.local/sites/MulderT/Onderdelen/Beoordelen/Flex/SitePages/Home.aspx">Flex</a></li>
                    <li><a href="https://som.org.om.local/sites/MulderT/Onderdelen/Beoordelen/Verkeersborden/SitePages/Home.aspx">Verkeersborden</a></li>
                    <li><a href="https://som.org.om.local/sites/MulderT/Onderdelen/Beoordelen/FlitsSV/SitePages/Home.aspx">SV Flits</a></li>
                    <li><a href="https://som.org.om.local/sites/MulderT/Onderdelen/Beoordelen/SVZichtPlicht/SitePages/Home.aspx">SV Zicht &amp; Plicht</a></li>
                    <li><a href="https://som.org.om.local/sites/muldert/onderdelen/beoordelen/rijgedrag/SitePages/Home.aspx">Rijgedrag</a></li>
                    <li><a href="https://som.org.om.local/sites/MulderT/Onderdelen/Beoordelen/Parkeren/SitePages/Home.aspx">Parkeren</a></li>
                    <li><a href="https://som.org.om.local/sites/MulderT/Onderdelen/Beoordelen/T&S/SitePages/Home.aspx">Teamleiders/senioren</a></li>
                  </ul>
                </li>
                <li><a href="https://som.org.om.local/sites/MulderT/Onderdelen/ZVAppel/SitePages/Home.aspx">ZV/Appelunit</a></li>
                <li><a href="https://som.org.om.local/sites/MulderT/Kwaliteitsteam/SitePages/Home.aspx">Kwaliteitsteam</a></li>
                <li><a href="https://som.org.om.local/sites/MulderT/Onderdelen/Servicedesk/SitePages/Home.aspx">Servicedesk</a></li>
                <li><a href="https://som.org.om.local/sites/MulderT/Onderdelen/Mulder_MT/SitePages/Home.aspx">Mulder MT</a></li>
              </ul>
            </li>
            <li><a href="https://som.org.om.local/sites/MulderT/Onderdelen/SitePages/Home.aspx">ICT</a></li>
            <li><a href="https://som.org.om.local/sites/MulderT/SBeheer/SitePages/HomeP.aspx">Sitebeheer</a></li>
            <li><a href="https://som.org.om.local/sites/MulderT/CPW/Zoeken/zoeken.aspx">Zoekmachine</a></li>
          </ul>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <h2 id="pageTitle">PKV-opdrachten Toevoegen</h2>
        
        <div class="table-container">
          <table id="dataTable" class="data-table">
            <thead>
              <tr>
                <th id="thRegNr" data-help="Registratienummer voor de PKV-opdracht">Registratienummer</th>
                <th id="thCjib" data-help="CJIB-nummer (9 of 16 cijfers)">CJIBNummer</th>
                <th id="thGem" data-help="Selecteer de juiste gemachtigde">Gemachtigde</th>
                <th id="thBedrag" data-help="Bedrag van de vergoeding (min. €320)">Bedrag (&euro;)</th>
                <th id="thNaamBetr" data-help="Naam van de betrokkene">Naam Betrokkene</th>
                <th id="thNaamBeoord" data-help="Automatisch ingevuld met uw gebruikersnaam">Naam Beoordelaar</th>
                <th id="thActies" data-help="Acties voor deze rij">Acties</th>
              </tr>
            </thead>
            <tbody>
              <!-- Rijen worden dynamisch toegevoegd door JavaScript -->
            </tbody>
          </table>
        </div>
        
        <div class="button-group" id="mainActionButtons">
          <button id="addRowButton" class="button" data-help="Voeg een nieuwe rij toe aan de tabel">
            <i class="material-icons">add</i> Rij toevoegen
          </button>
          <button id="tempSaveButton" class="button button-secondary" data-help="Sla uw werk tijdelijk op zonder te verzenden">
            <i class="material-icons">save</i> Tussentijds opslaan
          </button>
          <button id="oldButton" class="button old-button" data-help="Bekijk eerder ingevoerde PKV-opdrachten" 
                  onclick="window.open('https://som.org.om.local/sites/MulderT/PKV/CPW/DataDump/output/index.aspx', '_blank');">
            <i class="material-icons">open_in_new</i> Oude PKV-opdrachten inzien
          </button>
          <button id="saveButton" class="button right-button button-primary" data-help="Controleer en verzend alle goedgekeurde rijen">
            <i class="material-icons">send</i> PKV Opdrachten verzenden
          </button>
        </div>
        
        <div id="notification" class="notification"></div>
        <div id="errorMessage" class="error-message"></div>
      </div>
    </main>

    <footer class="footer">
      <div class="container">
        <p id="footerMessage">&hearts; Afdeling Mulder - </p>
      </div>
    </footer>
  </div>

  <!-- Help Modal -->
  <div id="helpModal" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <h4 class="modal-title">PKV Opdrachten Help</h4>
        </div>
        <div class="modal-body">
          <div class="help-tabs">
            <ul class="nav nav-tabs" role="tablist">
              <li role="presentation" class="active"><a href="#overview" aria-controls="overview" role="tab" data-toggle="tab">Overzicht</a></li>
              <li role="presentation"><a href="#fieldHelp" aria-controls="fieldHelp" role="tab" data-toggle="tab">Velden</a></li>
              <li role="presentation"><a href="#actions" aria-controls="actions" role="tab" data-toggle="tab">Acties</a></li>
              <li role="presentation"><a href="#validation" aria-controls="validation" role="tab" data-toggle="tab">Validatie</a></li>
            </ul>
            
            <div class="tab-content">
              <div role="tabpanel" class="tab-pane active" id="overview">
                <h3>PKV Opdrachten Systeem</h3>
                <p>Met deze applicatie voer je PKV-opdrachten in en kun je ze verzenden. <br><br>
				Goed om te weten: de pagina slaat de gegevens die je invult automatisch elke 60 seconden op. Zo is je werk beschermd tegen onverwacht verlies.</p>
                
                <h4>Goed om te weten::</h4>
                <ul>
                  <li>Voeg meerdere PKV-opdrachten toe in één sessie</li>
                  <li>Automatische validatie van alle invoervelden</li>
                  <li>Tussentijds opslaan van je werk</li>
                  <li>Verzenden van gevalideerde opdrachten</li>
                </ul>
                
                <p>Klik op <strong>Interactieve Rondleiding</strong> om een stapsgewijze uitleg van het systeem te starten.</p>
              </div>
              
              <div role="tabpanel" class="tab-pane" id="fieldHelp">
                <h3>Invoervelden</h3>
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Veld</th>
                      <th>Beschrijving</th>
                      <th>Validatieregels</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Registratienummer</td>
                      <td>Het unieke registratienummer voor deze PKV-opdracht</td>
                      <td>Exact 6 karakters, alleen letters en cijfers</td>
                    </tr>
                    <tr>
                      <td>CJIBNummer</td>
                      <td>Het CJIB-nummer gekoppeld aan deze opdracht</td>
                      <td>9 cijfers (16-cijferige nummers worden automatisch ingekort tot de laatste 9 cijfers)</td>
                    </tr>
                    <tr>
                      <td>Gemachtigde</td>
                      <td>De gemachtigde die deze opdracht behandelt</td>
                      <td>Selecteer een waarde uit de lijst</td>
                    </tr>
                    <tr>
                      <td>Bedrag</td>
                      <td>Het bedrag van de proceskostenvergoeding</td>
                      <td>Minimaal €320,00, maximaal 5 cijfers voor de komma, 2 cijfers na de komma</td>
                    </tr>
                    <tr>
                      <td>Naam Betrokkene</td>
                      <td>De naam van de betrokkene bij deze PKV-opdracht</td>
                      <td>Verplicht veld</td>
                    </tr>
                    <tr>
                      <td>Naam Beoordelaar</td>
                      <td>Uw Windows gebruikersnaam (automatisch ingevuld)</td>
                      <td>Automatisch gegenereerd</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div role="tabpanel" class="tab-pane" id="actions">
                <h3>Beschikbare Acties</h3>
                
                <div class="help-action-item">
                  <h4><i class="material-icons">add</i> Rij toevoegen</h4>
                  <p>Voegt een nieuwe lege rij toe aan de tabel voor een nieuwe PKV-opdracht.</p>
                </div>
                
                <div class="help-action-item">
                  <h4><i class="material-icons">save</i> Tussentijds opslaan</h4>
                  <p>Slaat uw huidige werk op zonder het definitief te verzenden. Dit gebeurt ook automatisch elke minuut.</p>
                </div>
                
                <div class="help-action-item">
                  <h4><i class="material-icons">open_in_new</i> Oude PKV-opdrachten inzien</h4>
                  <p>Opent een nieuw tabblad met een overzicht van eerder verzonden PKV-opdrachten.</p>
                </div>
                
                <div class="help-action-item">
                  <h4><i class="material-icons">send</i> PKV Opdrachten verzenden</h4>
                  <p>Controleert alle ingevoerde rijen op fouten en verzendt correct ingevulde rijen definitief naar de centrale database.</p>
                </div>
                
                <div class="help-action-item">
                  <h4><i class="material-icons">delete</i> Verwijder</h4>
                  <p>Verwijdert een specifieke rij uit de tabel. Als de rij al was opgeslagen, wordt deze ook uit de tijdelijke opslag verwijderd.</p>
                </div>
              </div>
              
              <div role="tabpanel" class="tab-pane" id="validation">
                <h3>Validatieregels</h3>
                <p>Bij het definitief verzenden worden de volgende regels gecontroleerd:</p>
                
                <ul class="validation-rules-list">
                  <li>Alle velden moeten correct ingevuld zijn volgens de veldspecifieke regels</li>
                  <li>Registratienummer: Exact 6 karakters, alleen letters en cijfers</li>
                  <li>CJIBNummer: Exact 9 cijfers (16-cijferige worden automatisch ingekort)</li>
                  <li>Gemachtigde: Moet geselecteerd zijn uit de lijst</li>
                  <li>Bedrag: Minimaal €320,00</li>
                  <li>Naam Betrokkene: Moet ingevuld zijn</li>
                </ul>
                
                <p>Bij tussentijds opslaan zijn de regels minder streng. Lege of onvolledige rijen kunnen tijdelijk worden opgeslagen.</p>
                
                <div class="validation-note">
                  <h4>Let op:</h4>
                  <p>Eventuele fouten worden bovenaan de pagina getoond in een rode balk. De bijbehorende velden worden rood gemarkeerd.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button id="startInteractiveTourBtn" type="button" class="btn btn-primary">Interactieve Rondleiding</button>
          <button type="button" class="btn btn-default" data-dismiss="modal">Sluiten</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/tippy.js@6/dist/tippy.umd.min.js"></script>
  <script src="configLijst.js"></script>
  <script src="scripts.js"></script>
</body>
</html>
