/**
 * Stappen voor de welkomsttour, per rol. `target` is de `href` van het
 * element dat gespot moet worden (matcht op `data-tour-href` in AppShell),
 * of `null` voor een gecentreerde intro-/slotkaart zonder spotlight.
 *
 * Ophogen van TOUR_VERSION laat de tour opnieuw zien aan iedereen, ook wie
 * hem al heeft afgerond — gebruik dit alleen bij een ingrijpende wijziging
 * in de navigatie.
 */
export const TOUR_VERSION = 1;

export interface TourStep {
  target: string | null;
  title: string;
  body: string;
}

function intro(naam: string | undefined, body: string): TourStep {
  return {
    target: null,
    title: `Welkom bij Welzijnsklik${naam ? `, ${naam}` : ""}!`,
    body,
  };
}

export function getTourSteps(rol: string, naam: string | undefined): TourStep[] {
  switch (rol) {
    case "COORDINATOR":
      return [
        intro(
          naam,
          "Even een korte rondleiding langs de belangrijkste plekken, zodat je meteen weet waar je moet zijn. Dit duurt zo'n 30 seconden."
        ),
        {
          target: "/coordinator",
          title: "Je dashboard",
          body: "Hier zie je in één oogopslag hoe het deze week gaat: activiteiten, openstaande hulpvragen en signalen die aandacht nodig hebben.",
        },
        {
          target: "/coordinator/bewoners",
          title: "Bewoners",
          body: "Elke bewoner heeft een eigen pagina met foto's, activiteiten en welzijnsgeschiedenis — alles overzichtelijk op één plek.",
        },
        {
          target: "/coordinator/aandacht",
          title: "Aandacht",
          body: "Welzijnsklik signaleert automatisch wanneer een bewoner minder bezoek krijgt dan zijn of haar eigen gebruikelijke ritme — relatief bepaald, niet vergeleken met anderen.",
        },
        {
          target: "/coordinator/welzijnscheck",
          title: "Welzijn",
          body: "Bekijk de maandelijkse welzijnschecks van vrijwilligers en signaleer vroegtijdig als het met een bewoner niet goed gaat.",
        },
        {
          target: "/coordinator/hulp-gevraagd",
          title: "Hulp gevraagd",
          body: "Bewoners en familie kunnen hier een hulpvraag plaatsen. Jij houdt overzicht en koppelt er een vrijwilliger aan.",
        },
        {
          target: "/coordinator/nieuwsbrieven",
          title: "Nieuwsbrief",
          body: "Stel in een paar klikken een nieuwsbrief samen met foto's van activiteiten, en verstuur die naar familie en/of vrijwilligers.",
        },
        {
          target: "/coordinator/meldingen",
          title: "Meldingen",
          body: "Nieuwe berichten, reacties en hulpvragen verschijnen hier — met een rood badge zodat je niets mist.",
        },
        {
          target: "/account",
          title: "Klaar om te beginnen!",
          body: "Hier beheer je je profiel en wachtwoord. Deze rondleiding kwijt? Klik gerust nog eens op het vraagteken rechtsboven.",
        },
      ];

    case "WELZIJNSMEDEWERKER":
      return [
        intro(
          naam,
          "Even een korte rondleiding langs de belangrijkste plekken, zodat je meteen weet waar je moet zijn. Dit duurt zo'n 30 seconden."
        ),
        {
          target: "/vrijwilliger",
          title: "Je dashboard",
          body: "Zie in één oogopslag je bijdrage deze week en de bewoners die je begeleidt.",
        },
        {
          target: "/vrijwilliger/bewoners",
          title: "Bewoners",
          body: "Als welzijnsmedewerker kun je alle bewoners opzoeken en hun activiteiten en geschiedenis inzien.",
        },
        {
          target: "/vrijwilliger/aandacht",
          title: "Aandacht",
          body: "Zie welke bewoners minder bezoek krijgen dan hun eigen gebruikelijke ritme, zodat je op tijd kunt bijsturen.",
        },
        {
          target: "/vrijwilliger/nieuw",
          title: "Nieuwe activiteit",
          body: "Leg in een paar tikken een bezoek of activiteit vast — met foto, zodat familie kan meegenieten.",
        },
        {
          target: "/vrijwilliger/welzijnscheck",
          title: "Welzijn",
          body: "Vul maandelijks een korte welzijnscheck in over hoe het met een bewoner gaat.",
        },
        {
          target: "/vrijwilliger/hulp-gevraagd",
          title: "Hulp gevraagd",
          body: "Bekijk openstaande hulpvragen van bewoners en familie, en bied je hulp aan.",
        },
        {
          target: "/vrijwilliger/berichten",
          title: "Chat",
          body: "Stuur en ontvang berichten van de coördinator en andere vrijwilligers.",
        },
        {
          target: "/account",
          title: "Klaar om te beginnen!",
          body: "Hier beheer je je profiel. Deze rondleiding kwijt? Klik gerust nog eens op het vraagteken rechtsboven.",
        },
      ];

    case "VRIJWILLIGER":
      return [
        intro(
          naam,
          "Even een korte rondleiding langs de belangrijkste plekken, zodat je meteen weet waar je moet zijn. Dit duurt zo'n 30 seconden."
        ),
        {
          target: "/vrijwilliger",
          title: "Je dashboard",
          body: "Zie in één oogopslag je bijdrage deze week: activiteiten, tijd besteed en de bewoners die je bezoekt.",
        },
        {
          target: "/vrijwilliger/agenda",
          title: "Agenda",
          body: "Bekijk je geplande bezoeken en activiteiten.",
        },
        {
          target: "/vrijwilliger/nieuw",
          title: "Nieuwe activiteit",
          body: "Leg in een paar tikken een bezoek vast — met foto, zodat familie kan meegenieten van het moment.",
        },
        {
          target: "/vrijwilliger/welzijnscheck",
          title: "Welzijn",
          body: "Vul maandelijks een korte welzijnscheck in over hoe het met de bewoner gaat.",
        },
        {
          target: "/vrijwilliger/hulp-gevraagd",
          title: "Hulp gevraagd",
          body: "Zie openstaande hulpvragen van bewoners en familie, en bied je hulp aan waar je kunt.",
        },
        {
          target: "/vrijwilliger/berichten",
          title: "Chat",
          body: "Stuur en ontvang berichten van de coördinator en andere vrijwilligers.",
        },
        {
          target: "/vrijwilliger/mijn-activiteiten",
          title: "Tijdslijn",
          body: "Een overzicht van alles wat je hebt vastgelegd, terug te vinden wanneer je maar wilt.",
        },
        {
          target: "/account",
          title: "Klaar om te beginnen!",
          body: "Hier beheer je je profiel. Deze rondleiding kwijt? Klik gerust nog eens op het vraagteken rechtsboven.",
        },
      ];

    case "FAMILIE":
      return [
        intro(
          naam,
          "Even een korte rondleiding langs de belangrijkste plekken, zodat je meteen weet waar je moet zijn. Dit duurt zo'n 20 seconden."
        ),
        {
          target: "/familie",
          title: "Tijdlijn",
          body: "Hier volg je foto's en verhalen van activiteiten die vrijwilligers hebben vastgelegd — het leven van je dierbare op de voet.",
        },
        {
          target: "/familie/agenda",
          title: "Agenda",
          body: "Zie welke bezoeken en activiteiten er gepland staan.",
        },
        {
          target: "/familie/hulp-gevraagd",
          title: "Hulp gevraagd",
          body: "Vraag hulp aan wanneer dat nodig is, bijvoorbeeld voor vervoer of een boodschap.",
        },
        {
          target: "/familie/help-mee",
          title: "Help mee",
          body: "Wil je zelf een keer meehelpen bij een activiteit? Meld je hier aan.",
        },
        {
          target: "/account",
          title: "Klaar om te beginnen!",
          body: "Pas hier je e-mailvoorkeuren en profiel aan. Deze rondleiding kwijt? Klik gerust nog eens op het vraagteken rechtsboven.",
        },
      ];

    default:
      return [];
  }
}
