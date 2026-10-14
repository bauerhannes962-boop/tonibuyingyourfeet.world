# Toni’s Footverse / Socksino — Version 25

Die Website ist lokal ohne Build oder Installation nutzbar. `index.html` öffnen. `casino.html` leitet alte Spiellinks auf die Hauptseite weiter.

## Spielhalle

Zwölf Spiele mit kostenlosen Feet Coins ohne Geldwert und ohne echte Preise:

- Blackjack: ein Deck, Ass 1/11, Dealer steht auf jeder 17, Ziehen/Stehen/Verdoppeln. Natürlicher Blackjack zahlt 2,5× inklusive Einsatz, normaler Sieg 2×, Gleichstand Einsatz zurück. Keine Teilung oder Versicherung. Laufende Hände bleiben gespeichert.
- Roulette: vollständiger europäischer Tisch mit 0–36 und 157 Setzmöglichkeiten. Einzelzahlen 36×, Splits 18×, Straßen/Trio 12×, Ecken/erste Vier 9×, Sechserlinien 6×, Dutzende/Kolonnen 3× und einfache Chancen 2× (inklusive Einsatz). Mehrere Chips kombinieren; zurücknehmen, leeren oder die letzte Runde wiederholen. Die Null verliert auf Außenchancen, kein La Partage. Der gesamte Tisch wird beim Start abgerechnet.
- Plinko: physikalischer Fall durch acht Pinreihen, neun Fächer mit 12 / 3 / 1,2 / 0,5 / 0,2 / 0,5 / 1,2 / 3 / 12×.
- Foot Flight: steigender Multiplikator mit manuellem Cashout vor dem zufälligen Absturz. Der Flug läuft zeitlich auch nach Neuladen weiter; verspätetes Sichern zählt als Verlust.
- Limbo: Ziele 2 / 5 / 10×, Gewinnchancen 48 / 19,2 / 9,6 %.
- Keno: drei aus 20 wählen, fünf unterschiedliche Zahlen ziehen. 0 / 1 / 2 / 3 Treffer zahlen 0 / 1 / 4 / 40×.
- Foot Road: endlose Straße, steigendes Zufallsrisiko, Autos ausschließlich von oben. Das sichtbare Auto beschleunigt beim sicheren Schritt von seiner aktuellen Position aus. Bei einem Treffer bleibt die Geschwindigkeit gleich. Keine aufklappbaren Regeln in dieser Ansicht.
- Sockpot: 🦶 ist mit 15× das höchste Dreier-Symbol, 💎 zahlt 10×. Glücksrad, Fuß oder Socke, Würfelwerk und Socken-Minen (sichere Felder zeigen Füße).

Ein neues Konto startet mit 100 Coins. Vorhandene Guthaben und Spielstände bleiben erhalten. Der zuletzt gewählte Einsatz bleibt gespeichert. Einsätze frei als ganze Zahl eingeben; darunter ½, ×2 und All-in. Nur bei exakt 0 Coins und ohne laufende Runde können 100 Coins nachgeladen werden. Es gibt keinen Reset-Knopf. Ein Konto darf eine laufende Spielart haben; bei Plinko können beliebig viele Bälle gestartet werden, solange das Guthaben reicht. Auszahlungen enthalten den Einsatz; Bruchteile werden abgerundet.

Die manuellen Animationsschalter wurden entfernt. Die Bewegungseinstellung des Betriebssystems wird weiter berücksichtigt.

## Animationen

- Plinko läuft in einer gemeinsamen Live-Simulation mit Ball-Ball-Kollisionen. Einsätze werden beim Drop reserviert; Landungen werden einzeln und genau einmal abgerechnet. Positionen werden gespeichert und nach Neuladen fortgesetzt. Physik: feste 1/240-Sekunden-Physikschritte, Schwerkraft, Dämpfung, elastische Kreis-Kollisionen an 36 Pins, Seitenwände und runde Fachtrennungen. Zufällig sind Startposition und Startimpuls. Es wird kein Ziel vorgegeben und keine Links-/Rechtsfolge abgespielt. Der berechnete Landebereich bestimmt die Auszahlung. Der Ball behält auch beim Ende der Animation seine tatsächliche Position. Kontakte leuchten auf, ein kurzer Bewegungsschweif folgt dem Ball.
- Blackjack: sichtbarer Stapel, einzeln ausgeteilte Karten mit gedruckten Symbolen und Bildkarten, 3D-Aufdecken, Dealer-Züge, Chips und Ergebnisanimationen.
- Roulette: 37 nummerierte Fächer in Radreihenfolge, Gegenlauf der Kugel, sichtbare Sprünge beim Absenken in das Ergebnisfach und Anzeige letzter Zahlen. Setzfelder markieren ihre Zahlen beim Überfahren; Chips fliegen auf den Tisch und Gewinnerfelder leuchten nach dem Lauf.
- Keno: gläserne Trommel und fünf einzeln ausgegebene Kugeln. Treffer werden erst bei der jeweiligen Ziehung gezeigt.
- Limbo: animierte Flugkurve, durchgehend erhaltene Flugspur und Fuß mit Steig- und Sinkbewegungen, sichtbare Ziellinie und erhaltenes Ziel nach dem Neuladen.
- Sockpot: Walzengehäuse mit Lampen, drei zeitversetzte Stopps, kurzer mechanischer Rückstoß und Hervorhebung passender Gewinnsymbole.
- Glücksrad: schrittweise tickender Zeiger, weiches Auslaufen, umlaufende Lampen und Ergebnisanzeige.
- Münze und Würfel: räumliche Seiten, Münzrand, echte Würfelaugen, Flug-/Rollbewegung, Bodenschatten und Nachfedern.
- Minen: doppelseitige Kacheln drehen einzeln um; abgeschlossene Runden zeigen danach das ganze Feld. Ungewählte Füße werden blasser dargestellt. Während der Animation ist keine weitere Auswahl möglich.
- Foot Road: zusätzliche Scheinwerfer und Geschwindigkeitsstreifen; die bestehende kontinuierliche Fahrzeugbewegung und Kollisionslogik bleiben erhalten.

Die Bühne und Bedienung sind für den Desktop gestaltet. Guthaben, Ergebnisse und Verlauf aktualisieren sich nach der Darstellung; das Rundenergebnis ist vorher bereits gespeichert, damit Neuladen keinen neuen Gewinn erzeugt. Bei reduzierter Bewegung werden dekorative Ergebnisanimationen übersprungen. Plinko und Foot Flight behalten ihren zeitlichen Spielablauf.

## Dateien und Veröffentlichung

Die Dateien wurden direkt lokal bearbeitet. Zum Aktualisieren des bestehenden Hostings die geänderten HTML-, CSS- und JavaScript-Dateien übernehmen. `CNAME`, `.nojekyll` und `assets/` erhalten. Die Website wurde damit noch nicht online veröffentlicht. Versionierte Links (`?v=25`) umgehen alte Styles/Skripte im Browsercache.

Das Vorschaubild liegt in `assets/footverse-share-v9.png`. Domain- und Kontaktwerte stehen in `config.js`; kanonische URLs und Open-Graph-URLs im HTML bei einem Domainwechsel zusätzlich anpassen.

Version 25 verfeinert außerdem Kartenlicht und Stapeltiefe, Würfelmaterial, Gewinnlichter der Walzen, Keno-Treffer, Szenenwechsel und Ergebnisübergänge. Dekoration pausiert außerhalb des sichtbaren Bereichs; unveränderte Walzen und Statuszeilen werden nicht unnötig neu aufgebaut. Foot Flight bleibt auch bei hohen Multiplikatoren in Bewegung.

## Night Walk und geheime Akten (Version 25)

Foot Road hat eine nächtliche Stadtkulisse, Leuchtreklame, Statusampel, sichtbar bleibende Fußspuren und eine Sichern-Animation. Der Status begleitet Warten, Überqueren, Treffer und Abschluss. Die bestehende Fahrzeugposition, Beschleunigung und Trefferlogik bleiben erhalten; verdeckter Verkehr pausiert.

Drei kosmetische Easter Eggs: fünf schnelle Klicks auf das Kopf-Logo, drei Vibe-Scans und der klassische Konami-Code außerhalb von Eingabefeldern. Das Sammelbuch im Footer zeigt Hinweise, speichert Entdeckungen lokal und kann Effekte wiederholen. Keine Änderung von Coins oder Gewinnchancen. Reduzierte Bewegung wird berücksichtigt.

Drop-Karten und Inhaltsabschnitte erscheinen beim Scrollen sanft; Tastaturfokus macht sie ebenfalls sichtbar. Spielauswahl und Karten haben verfeinerte Hover- und Fokuszustände.
