# Toni’s Footverse / Socksino — Version 10

## Website öffnen
ZIP vollständig entpacken und index.html öffnen. Alle sechs Spiele sind direkt auf der Hauptseite im Abschnitt Socksino spielbar. casino.html leitet ältere Links automatisch zur Spielhalle auf der Hauptseite weiter. Keine Installation, kein Build und keine externen Bibliotheken erforderlich.

## Auf dem bestehenden Hosting aktualisieren
Den bisherigen Website-Inhalt im veröffentlichten Repository-Ordner durch den Inhalt dieser ZIP ersetzen. Beim bloßen Überschreiben bleiben entfernte Dateien auf dem Hosting liegen; die unter „Bereinigung und Fehlerbehebung“ aufgeführten drei Altdateien dann zusätzlich löschen. Repository-Verwaltung und persönliche Dateien nicht entfernen. Besonders wichtig sind casino.html, casino.css, casino.js, reel-motion.js, foot-road.js, foot-road.css, arcade-engine.js und der assets-Ordner. Nur index.html zu ersetzen reicht nicht. Die neuen Styles und Skripte werden mit ?v=10 verknüpft, damit zuvor gespeicherte Versionen nicht bevorzugt werden.

Die enthaltenen CNAME- und .nojekyll-Dateien bleiben für die gewünschte Domain tonibuyingyourfeet.world bestehen. Die ZIP nimmt selbst keine DNS-Änderung oder Veröffentlichung vor. Falls keine eigene Domain verwendet wird, CNAME weglassen und die absoluten Vorschau-Adressen im HTML anpassen.

## Design und Spielwährung
- Passend zur Hauptseite: lila Hintergrund, transparente Flächen, türkise Akzente und hellgrüne Buttons.
- Spielauswahl über dem Spielfeld; Spiel links und Einsatz rechts, auf Mobilgeräten untereinander.
- Guthaben, Einsätze, Gewinne und Verlauf heißen durchgehend Feet Coins. Bestehende Spielstände bleiben erhalten.

## Spielhalle
- Sechs lokal spielbare Minispiele direkt in index.html. Die Navigation springt zur Spielhalle auf derselben Seite.
- Foot Road: endlose Fahrspuren mit steigendem Zufallsrisiko, laufendem Fuß, Gegenverkehr und Cartoon-Kollision. Nach jedem sicheren Schritt Feet Coins sichern oder weitergehen. Kein automatisches Ende; Multiplikatoren wachsen mit dem Risiko.
- Sockpot: echte vertikal laufende Symbolstreifen. Die Walzen laufen zunächst gleichmäßig und bremsen sanft ab: links bei 2,2 Sekunden, Mitte bei 2,9 Sekunden, rechts bei 3,6 Sekunden. Paar oder Drilling treffen. Ergebnis und Kontostand erscheinen nach dem letzten Stopp.
- Glücksrad: acht Felder, 0× / 2× / 3× / 5×.
- Fuß oder Socke: Münzwurf, beide Seiten 50 %.
- Würfelwerk: 1–3 oder 4–6 wählen, jeweils 50 %.
- Socken-Minen: neun Felder, zwei Socken vermeiden, sieben Diamanten finden und freiwillig Punkte sichern.
- Gemeinsamer Punktestand, Rundenzahl, gewonnene Runden, größte Auszahlung und Verlauf der letzten sechs Runden.
- Anfangs 2.500 Feet Coins. Jederzeit kostenlos 1.000 Feet Coins nachladen. Zurücksetzen löscht Statistik und startet mit 2.500 Feet Coins.
- Einsätze: 10 / 25 / 50 / 100 Feet Coins. Jede Auszahlung enthält den Einsatz. Nettoänderungen stehen im Ergebnis und Verlauf.
- Nur kostenlose Punkte ohne Geldwert, Kauf, Auszahlung, echte Preise oder Einlösung für Bilder. Kein Auto-Play.

Animationen lassen sich im Socksino abschalten. Der FX-Schalter der Hauptseite und die Systemeinstellung für reduzierte Bewegung werden ebenfalls berücksichtigt. Beim Abschalten während eines Spins wird sofort das bereits ermittelte Ergebnis angezeigt.

## Speicherung und laufende Runden
Der Spielstand liegt lokal unter footverse-arcade-v2. Ein alter toni-sockpot-v1-Stand wird beim ersten Besuch übernommen, sofern gültig. Die vier Sofortspiele rechnen ihre Ergebnisse vor der kosmetischen Animation ab, damit Neuladen nicht den Einsatz zurücksetzt. Eine aktive Minenrunde speichert Feld, Einsatz und geöffnete Felder und kann nach Neuladen fortgesetzt werden. Eine aktive Foot-Road-Runde speichert Einsatz, Fortschritt und den Zufallszustand. Die Runde startet mit einem zufälligen Seed aus der Browser-Kryptografie; jeder Schritt aktualisiert ihn deterministisch per xorshift32. Der nächste Zufallswert wird mit dem Kollisionsrisiko dieser Spur verglichen. Ein Neuladen würfelt nicht neu. Jeder Schritt wird vor der Animation gespeichert. Während einer Minen- oder Straßenrunde sind andere Einsätze gesperrt; entweder Punkte sichern oder die Runde ausdrücklich abbrechen.

Bei blockiertem Speicher funktioniert die Arcade weiter im aktuellen Besuch und zeigt den fehlenden Speicher an. Spiele sind lokale Spaßdaten, keine gegen Manipulation abgesicherten Konten. Gleichzeitige Änderungen in mehreren Tabs sind kein Mehrspielermodus. Spielstände lassen sich auf datenschutz.html löschen; dabei werden auch alte Sockpot-Daten entfernt.

## Foot Road
Das Grundprinzip orientiert sich an Straßenquerungs-Spielen wie Chicken Road. Grafik, Code, Multiplikatoren und Chancen wurden für das Footverse eigenständig umgesetzt; es werden keine Casino-Inhalte eingebettet.

Einsatz wählen → Fußweg starten → Nächste Spur → Feet Coins sichern oder weitergehen. Bei einer Kollision ist der Einsatz verloren. Die Runde läuft nur auf Klick weiter; Warten verbessert die Chance nicht.

Das Kollisionsrisiko auf Spur n ist 0,18 + 0,77 × (1 − exp(−(n−1)/12)): 18 % auf Spur 1, rund 40 % auf Spur 5 und 59 % auf Spur 10. Es nähert sich 95 %, eine Überlebenschance bleibt erhalten. Die Anzeige zeigt das Risiko der jeweils nächsten Spur. Späte Spuren sind dadurch selten erreichbar.

Die Multiplikatoren gleichen die zunehmende Gefahr aus: Der erste Wert basiert auf 0,96 / 0,82, jeder weitere auf dem vorherigen ungerundeten Wert geteilt durch die Überlebenschance. Angezeigt und ausgezahlt wird mit einem auf zwei Stellen abgerundeten Multiplikator. Die Auszahlung enthält den Einsatz und wird auf ganze Feet Coins abgerundet. Konto und Multiplikator sind technisch auf jeweils eine Milliarde begrenzt; die Auszahlung kann nur den noch freien Kontobetrag füllen. Das beendet die Straße nicht.

Fußbewegung, Kamera und das auslösende Auto werden über denselben Animationszeitgeber gesteuert. Der Fuß hebt sich beim Schritt, Autos und Laster fahren in wechselnden Richtungen, und bei einer Kollision folgen Aufprall, kurzes Wackeln und eine Cartoon-Pose. Für lange Runden werden immer dieselben 18 Spur-Elemente wiederverwendet. Eine unbegrenzte Anzahl an DOM-Elementen wird vermieden; Spurindizes nutzen sichere JavaScript-Ganzzahlen.

Direktlink: index.html#sockpot-road. Bestehende Kontostände bleiben erhalten. Aktive Straßenrunden aus Version 9 werden mit ihrem bisherigen Einsatz und Fortschritt auf die neuen Regeln übertragen.

## Discord und Vorschau
Der Kontakt steht in config.js, aktuell antcn. Das Angebotsformular erstellt nur Text, es versendet nichts automatisch. Bilder und endgültige Preise werden direkt auf Discord besprochen.

Startseite und Spielhalle enthalten statische Open-Graph-Metadaten. Das Vorschaubild heißt assets/footverse-share-v9.png, 1200 × 630 Pixel. Die absolute Bildadresse ist https://tonibuyingyourfeet.world/assets/footverse-share-v9.png. Titel der Startseite: „Toni hat das Internet falsch benutzt.“

Eine Linkvorschau kann erst nach dem vollständigen Hochladen erscheinen, wenn Seite und Bild öffentlich erreichbar sind und der Zielkanal Vorschauen zulässt. Sie wurde nicht live geprüft. Bereits vorhandene Vorschauen können zwischengespeichert bleiben. Eine neue URL-Variante wie ?v=10 kann beim Testen helfen, garantiert aber keine sofortige Aktualisierung. Wenn die Domain geändert wird, og:url, canonical und alle Bild-URLs in index.html und casino.html anpassen. config.js allein aktualisiert diese statischen Metadaten nicht.

## Texte und Informationsseiten
Die öffentlichen Informationsseiten nennen keinen Hostinganbieter. Sie enthalten kurze humorvolle Texte sowie die tatsächliche Funktionsbeschreibung von Formular, Speicher und Audio. Die erfundene Unternehmensgeschichte ersetzt keine echten Betreiberangaben; diese wurden noch nicht geliefert.

## Bereinigung und Fehlerbehebung
- Entfernt: assets/footverse-share-v4.png, assets/footverse-share-v4.svg und assets/footverse-share-v5.svg. Zusätzlich ersetzt assets/footverse-share-v9.png das bisherige assets/footverse-share-v5.png; das alte PNG kann entfernt werden.
- Alte Arcade-Einstiegsstyles und Styles der früheren separaten Spielseite entfernt. casino.html enthält nur noch eine Weiterleitung mit Ersatzlink.
- Beschädigte gespeicherte Spielergebnisse werden verworfen, ohne gültiges Guthaben zu löschen.
- Radposition und Spielstand werden nach Änderungen in einem anderen Tab aktualisiert, auch nach dem Ende einer Animation.
- Das Löschen der Website-Spielstände während einer Runde wird übernommen.
- Abschalten der Animation beendet jetzt auch Rad, Münze und Würfel sofort.
- Alle HTML-Seiten laden die aktuellen Styles und Skripte mit ?v=10.

## Technische Prüfung
- 64.451 Foot-Road-Prüffälle: Zufallsverteilung an sechs Spuren, wachsendes Risiko, deterministische Fortsetzung, alle Einsätze, Auszahlungen und Migration.
- Erzwungene sichere Testläufe bis Spur 1.000 prüfen die endlose Mechanik; ein vorbereiteter Spielstand auf Spur 1.000.000 prüft große Spurindizes. Das sind technische Tests, keine Aussage über natürlich erreichbare Runden.
- Konstante Anzahl von 18 Spur-Elementen, Wiederverwendung bei Kamerafahrten, Schrittbewegung und Kollisionszeitpunkt.
- Foot-Road-Bedienung: erste Spur, Kollision, Gewinn sichern, Doppelklick, Neuladen, Unterbrechung, gegenseitige Sperre aktiver Minen-/Straßenrunden sowie Speicherlöschung während der Bewegung.
- 4.757 Regelfälle: alle Walzenkombinationen, Radfelder, Münz-/Würfel-Ergebnisse und alle Minenlayouts mit sicheren Feldkombinationen.
- Bedienabläufe gegen den tatsächlichen HTML-Aufbau: alle sechs Spiele, Sperre gegen Doppelklicks, Wahl der Spiele, Ergebnisanzeige, Radposition, Minen-Fortsetzung und Auszahlen.
- Blockierter Speicher, beschädigte Daten und Übernahme alter Spielstände.
- Laufende Symbolstreifen, stetige Bremskurve, exakte Zielsymbole, Stoppreihenfolge links/Mitte/rechts und Abbruch der Animation.
- Inline-Navigation, Direktlinks und die Weiterleitung älterer casino.html-Links.
- Hauptseiten-Skripte gemeinsam: Angebotsformular, Dialoge, Eingabe-/Validierungspfade, Kopieren mit Ersatzmethode, TXT-Download, Discord-Verknüpfungen, Scanner, Effekte, Audio-Bedienung und reduzierte Bewegung.
- Datenschutz-Löschung bei verfügbarem und blockiertem Speicher; Impressums-Kontakt.
- Syntax, HTML-Struktur, lokale Verknüpfungen und Sprungziele, Metadaten, Bild-/Audiodateien und Archivintegrität.

Die Bedienprüfung simuliert DOM-Ereignisse und ist kein visueller Browser-Test. Eine visuelle Browserprüfung und reale Zwischenablage-/Audio-/Downloadtests im Browser waren hier nicht verfügbar. Hosting, Domain und Discord-Vorschau wurden nicht live geprüft.
