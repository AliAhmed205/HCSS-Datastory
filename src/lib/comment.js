import { get } from "svelte/store";
import {
  selectedCountry,
  selectedConflict,
  selectedYear,
} from "../lib/stores";

export function getCommentForSelectedCountry(
  russiaSentences2022,
  russiaSentences2023,
  ukraineSentences2022,
  ukraineSentences2023
) {
  const currentCountry = get(selectedCountry);
  const currentConflict = get(selectedConflict);
  const currentYear = get(selectedYear);

  let countryComments = [];

  // Controleer welk jaar en conflict is geselecteerd, en kies de juiste data
  if (currentConflict === "RUS") {
    if (currentYear === "2023") {
      countryComments = russiaSentences2023; // Haal de data voor Rusland in 2023
    } else if (currentYear === "2022") {
      countryComments = russiaSentences2022; // Haal de data voor Rusland in 2023
    }
  } else if (currentConflict === "UA") {
    if (currentYear === "2023") {
      countryComments = ukraineSentences2023; // Haal de data voor Oekraïne in 2023
    } else if (currentYear === "2022") {
      countryComments = ukraineSentences2022; // Haal de data voor Oekraïne in 2022
    }
  }

  // Zorg ervoor dat countryComments altijd een array is voordat je filtert
  if (!Array.isArray(countryComments)) {
    countryComments = [];
  }

  // Filter op land en geef de zinnen en hun sentiment weer
  return countryComments
    .filter((sentence) => sentence.speaker === currentCountry)
    .map((sentence) => ({
      sentence: sentence.sentence,
      sentiment: sentence.sentiment,
    }));
}


