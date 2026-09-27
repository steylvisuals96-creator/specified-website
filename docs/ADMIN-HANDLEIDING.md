# Handleiding back-office Specified

Voor Tom en Simon (en wie jullie later een account geven).

**Inloggen:** https://specified-cms.vercel.app/admin/login
Na het inloggen kom je op het overzicht (`/dashboard`). Alles wat je dagelijks nodig hebt, staat in het menu links.

---

## 1. Je account

- Log in met je e-mailadres en wachtwoord. Na 5 foute pogingen wordt het account 15 minuten geblokkeerd; daarna kan je opnieuw proberen.
- Je blijft 8 uur ingelogd. Daarna vraagt de back-office opnieuw om je wachtwoord.
- Wachtwoord vergeten? Klik op het inlogscherm op "Forgot password?".
- Gebruik een eigen, lang wachtwoord (minstens 14 tekens) dat je nergens anders gebruikt. Een wachtwoordbeheerder (1Password, Bitwarden, Apple Wachtwoorden) maakt dat makkelijk.
- Deel nooit een account. Geef collega's een eigen account (zie 6).

## 2. Het overzicht

Bovenaan vier cijfers: open vacatures, nieuwe sollicitaties, interviews deze week en plaatsingen dit kwartaal. Klik op een cijfer om naar de lijst erachter te gaan.

Daaronder:
- **Pipeline**: hoeveel sollicitaties in elke fase zitten.
- **Vandaag in de agenda**: de afspraken van vandaag.
- **Nieuwe kandidaten** en **Laatst bijgewerkt**: snel verder waar je gebleven was.

Onderaan staat één regel over de systeemstatus. Staat daar een probleem, laat het dan weten aan SteylVisuals.

## 3. Kandidaten

**Zoeken en filteren** — Typ een naam, e-mailadres of functietitel in het zoekveld, of kies een sector, niveau of beschikbaarheid. De filters staan in de adresbalk: je kan een gefilterde lijst dus als link doorsturen naar een collega.

**Toevoegen** — Knop "Kandidaat toevoegen" rechtsboven.

**Een kandidaat openen** — Klik op de rij. Op de kandidaatpagina zie je:
- de **voortgangslijn** door de pipeline (nieuw, gescreend, in gesprek, voorgesteld aan klant, interview bij klant, geplaatst);
- de **knop voor de volgende stap** (bv. "Voorstellen aan klant"). Die zet de status een stap verder en schrijft dat automatisch in de tijdlijn;
- **Status wijzigen** voor elke andere status, ook "On hold" of "Niet weerhouden";
- **Bewerken** voor alle gegevens;
- **Notitie toevoegen**: typ en klik op "Notitie opslaan" (of Cmd/Ctrl + Enter);
- **Activiteit toevoegen** om een telefoon, e-mail of afspraak te loggen.

**Exporteren** — "CSV exporteren" op de kandidatenlijst geeft een bestand voor Excel.

## 4. Vacatures, sollicitaties en pipeline

- **Vacatures**: een vacature met status *Actief* en "zichtbaar op website" verschijnt binnen een minuut op specified-website.vercel.app/vacatures. Zet ze op *Ingevuld* of *On hold* om ze van de site te halen.
- **Sollicitaties** koppelen een kandidaat aan een vacature.
- **Pipeline**: het bord met alle lopende sollicitaties per fase. Sleep een kaart naar een andere kolom om de fase te wijzigen.
- **Bedrijven**: jullie klanten en prospects, met hun activiteiten.

De naam van een klant verschijnt nooit op de website; bezoekers zien alleen de sector en de grootte van het bedrijf.

## 5. Agenda en e-mails loggen

- Afspraken die je als activiteit van het type *Afspraak* logt, verschijnen in de **Agenda** en op het overzicht. Bij elke afspraak staan links om ze in Google Agenda of Outlook te zetten, of als .ics-bestand te downloaden.
- **E-mails automatisch loggen**: zet het BCC-adres uit *Instellingen* in BCC bij een mail aan een kandidaat of bedrijf. De mail verschijnt dan vanzelf als activiteit bij die persoon.

## 6. Website-inhoud

Onder **Website** in het menu:

- **Blog** — Nieuw artikel: titel, korte samenvatting, coverbeeld (upload of link) en de tekst. Zet de status op *Gepubliceerd* om het online te zetten. Een concept is niet zichtbaar voor bezoekers.
- **Team** — Naam, rol, bio, foto en LinkedIn. Zet "Actief / zichtbaar" uit om iemand van de site te halen zonder te verwijderen. De volgorde bepaalt wie eerst staat.
- **Media** — Beelden voor de site. Alleen jpg, png, webp, avif en gif; andere bestanden worden geweigerd.

Onder **Beheer → Instellingen** (alleen voor beheerders): de teksten van de homepage (de wisselende woorden in de titel, de twee dienstblokken, de sectorbalk, de sectietitels), contactgegevens, LinkedIn en de footer.

Een wijziging staat binnen ongeveer een minuut op de website.

## 7. Gebruikers en rollen

| Rol | Kan |
| --- | --- |
| **Beheerder** (Tom, Simon) | Alles: inhoud, instellingen en gebruikers. |
| **Recruitment consultant** | Kandidaten, vacatures, sollicitaties, bedrijven, agenda en blog. Geen instellingen of gebruikers. |

Een collega toevoegen: **Beheer → Gebruikers → Nieuwe gebruiker**. Geef de rol *Recruitment consultant*, tenzij de persoon ook instellingen en accounts moet beheren. Gaat iemand weg? Verwijder het account dezelfde dag.

SteylVisuals heeft een eigen onderhoudsaccount. Dat zie je niet in de lijst en het kan niet gewijzigd worden; zo kan niemand per ongeluk de toegang voor onderhoud afsluiten.

## 8. Geavanceerd beheer

"Geavanceerd beheer" (onderaan het menu) opent de onderliggende database-weergave (`/admin`). Die heb je normaal niet nodig; alles kan via het gewone menu. Enige uitzondering: **Documenten (privé)**, waar cv's en kandidaatfoto's bewaard worden. Die zijn nooit publiek bereikbaar.

## 9. Hulp nodig?

SteylVisuals — steylvisuals96@gmail.com

Stuur bij een probleem: wat je deed, wat je verwachtte, wat er gebeurde, en indien mogelijk een schermafbeelding.
