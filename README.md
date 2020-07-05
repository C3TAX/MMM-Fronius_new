# MMM-Fronius_new
Live Daten vom Fronius Wechselrichter (Solarstrom)

Ein MagicMirror Modul, das die Daten eines Fronius Solarwechslerichters anzeigt.
Getestet mit einem fronius Symo 3.7-3-S Inverter.

Das Modul ziegt folgendes an und kann noch erweitert werden:

- Watt now
- Einspeisen / Beziehen
- Verbrauch
- Tagesertrag
- Gesamt Etrag
- Autonomie Grad in %

Wenn Strom Eingespeist wird ist die Schrift für Einspeisen grün und wenn Strom bezogen wird, ist die Schrift für Beziehen rot.

Das Modul ist ein Fork von peteyjaym (https://github.com/peteyjaym/MMM-fronius) welches ich etwas erweitert habe.
Das ist nicht sauber programmiert, funktioniert aber bei mir ohne Probleme. 

Wer möchte kann dies gern weiter entwickeln. Ich werde dies nicht mehr machen, da es für mich super funktioniert.

<H1><B>Install</B></H1>
<b>cd MagicMirror/modules `git clone https://github.com/C3TAX/MMM-fronius_new'</b><br>

<H2><b>Update</b></H2>
<b>cd MagicMirror/modules/MMM-fronius git pull</b><br>

<H1><b>Configuration</b></H1>
<b>just add the inverter ip as shown below:<br>
{<BR>
  module: 'MMM-fronius',<br>
  position: 'top_center',<br><br>
  config: {<br>
          ipaddfr: [ 'xx.xx.xx.xx', //inverter ip ],<br>
      }<br>
  },<br><br>

Es ist keine Konfiguration erforderlich, da alle Werte fest in der Hauptdatei codiert sind.
Fügen Sie einfach Ihre IP-Adresse des Wechselrichters hinzu.<br>

HINWEIS: Dies ist eine Quick & dirty Copy und Erweiterung die in keiner Weise optimiert ist.
Updates wird es nnicht geben, solange es bei mir läuft....
