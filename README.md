# Toni’s Footverse / Socksino — Version 22

Die Website ist lokal ohne Build oder Installation nutzbar. `index.html` öffnen. `casino.html` leitet alte Spiellinks auf die Hauptseite weiter.

## Spielhalle

Elf Spiele mit kostenlosen Feet Coins ohne Geldwert und ohne echte Preise:

- Blackjack: ein Deck, Ass 1/11, Dealer steht auf jeder 17, Ziehen/Stehen/Verdoppeln. Natürlicher Blackjack zahlt 2,5× inklusive Einsatz, normaler Sieg 2×, Gleichstand Einsatz zurück. Keine Teilung oder Versicherung. Laufende Hände bleiben gespeichert.
- Roulette: 37 gleichwahrscheinliche Zahlen, Rot/Schwarz 2×, Null 36×.
- Plinko: physikalischer Fall durch acht Pinreihen, neun Fächer mit 12 / 3 / 1,2 / 0,5 / 0,2 / 0,5 / 1,2 / 3 / 12×.
- Limbo: Ziele 2 / 5 / 10×, Gewinnchancen 48 / 19,2 / 9,6 %.
- Keno: drei aus 20 wählen, fünf unterschiedliche Zahlen ziehen. 0 / 1 / 2 / 3 Treffer zahlen 0 / 1 / 4 / 40×.
- Foot Road: endlose Straße, steigendes Zufallsrisiko, Autos ausschließlich von oben. Das sichtbare Auto beschleunigt beim sicheren Schritt von seiner aktuellen Position aus. Bei einem Treffer bleibt die Geschwindigkeit gleich. Keine aufklappbaren Regeln in dieser Ansicht.
- Sockpot, Glücksrad, Fuß oder Socke, Würfelwerk und Socken-Minen.

Ein neues Konto startet mit 100 Coins. Vorhandene Guthaben und Spielstände bleiben erhalten. Einsätze: 1, 5, 10, 25, 50 und 100 Coins. Nur bei exakt 0 Coins und ohne laufende Runde können 100 Coins nachgeladen werden. Es gibt keinen Reset-Knopf. Ein Konto darf nur eine laufende Runde gleichzeitig haben. Auszahlungen enthalten den Einsatz; Bruchteile werden abgerundet.

Die manuellen Animationsschalter wurden entfernt. Die Bewegungseinstellung des Betriebssystems wird weiter berücksichtigt.

## Animationen

- Plinko wurde vollständig ersetzt: feste 1/240-Sekunden-Physikschritte, Schwerkraft, Dämpfung, elastische Kreis-Kollisionen an 36 Pins, Seitenwände und runde Fachtrennungen. Zufällig sind Startposition und Startimpuls. Es wird kein Ziel vorgegeben und keine Links-/Rechtsfolge abgespielt. Der berechnete Landebereich bestimmt die Auszahlung. Der Ball behält auch beim Ende der Animation seine tatsächliche Position. Kontakte leuchten auf, ein kurzer Bewegungsschweif folgt dem Ball.
- Blackjack: sichtbarer Stapel, einzeln ausgeteilte Karten mit gedruckten Symbolen und Bildkarten, 3D-Aufdecken, Dealer-Züge, Chips und Ergebnisanimationen.
- Roulette: 37 nummerierte Fächer in Radreihenfolge, Gegenlauf der Kugel, Absenken in das Ergebnisfach und Anzeige letzter Zahlen.
- Keno: gläserne Trommel und fünf einzeln ausgegebene Kugeln. Treffer werden erst bei der jeweiligen Ziehung gezeigt.
- Limbo: animierte Flugkurve, Rakete, sichtbare Ziellinie und erhaltenes Ziel nach dem Neuladen.
- Sockpot: Walzengehäuse mit Lampen, drei zeitversetzte Stopps, kurzer mechanischer Rückstoß und Hervorhebung passender Gewinnsymbole.
- Glücksrad: schrittweise tickender Zeiger, weiches Auslaufen, umlaufende Lampen und Ergebnisanzeige.
- Münze und Würfel: räumliche Seiten, Münzrand, echte Würfelaugen, Flug-/Rollbewegung, Bodenschatten und Nachfedern.
- Minen: doppelseitige Kacheln drehen einzeln um; abgeschlossene Runden zeigen danach das ganze Feld. Ungewählte Diamanten werden blasser dargestellt. Während der Animation ist keine weitere Auswahl möglich.
- Foot Road: zusätzliche Scheinwerfer und Geschwindigkeitsstreifen; die bestehende kontinuierliche Fahrzeugbewegung und Kollisionslogik bleiben erhalten.

Die Bühne und Bedienung sind für den Desktop gestaltet. Guthaben, Ergebnisse und Verlauf aktualisieren sich nach der Darstellung; das Rundenergebnis ist vorher bereits gespeichert, damit Neuladen keinen neuen Gewinn erzeugt. Bei reduzierter Bewegung werden die endgültigen Ergebnisse direkt angezeigt.

## Dateien und Veröffentlichung

Die Dateien wurden direkt lokal bearbeitet. Zum Aktualisieren des bestehenden Hostings die geänderten HTML-, CSS- und JavaScript-Dateien übernehmen. `CNAME`, `.nojekyll` und `assets/` erhalten. Die Website wurde damit noch nicht online veröffentlicht. Versionierte Links (`?v=22`) umgehen alte Styles/Skripte im Browsercache.

Das Vorschaubild liegt in `assets/footverse-share-v9.png`. Domain- und Kontaktwerte stehen in `config.js`; kanonische URLs und Open-Graph-URLs im HTML bei einem Domainwechsel zusätzlich anpassen.
