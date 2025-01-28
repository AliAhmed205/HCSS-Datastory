
<script>
  import { selectedGroup } from "../lib/stores"; // Import de store voor groepen
  import { selectedCountry } from "../lib/stores"; // Import de store voor land
  import { selectedYear } from "../lib/stores"; // Import de store voor jaar
  import { selectedConflict } from "../lib/stores"; // Import de store voor conflict
  import { countryComment } from "../lib/stores"; // Import de store voor conflict
  import { getCommentForSelectedCountry } from "../lib/comment.js";
  import { getCountriesByGroup } from "../lib/countries";
  import { onMount } from "svelte";
  import * as d3 from "d3";

  let group = "";
  let countries = [];
  let conflict = $selectedConflict;
  let selected = ""; 
  let year = "2023"; 
  let dataLoaded = false;


  let russiaSentences2023 = [];
  let ukraineSentences2023 = [];

  let russiaSentences2022 = [];
  let ukraineSentences2022 = [];


  onMount(async () => {

    if (!$selectedCountry) {
    selectedCountry.set("Netherlands");
  }
    if (!$selectedYear) {
    selectedYear.set("2023");
  }
    if (!$selectedConflict) {
    selectedConflict.set("RUS");
  }

  await Promise.all([
    d3.json("/speeches_2023_analysed.json").then((data) => {
      const speeches = data.speeches;

      speeches.forEach((speech) => {
        const speaker = speech.speaker_country; // Haal de naam van de spreker op

        speech.referenced_countries.forEach((refCountry) => {
          if (refCountry.country === "RUS") {
            refCountry.sentences.forEach((sentence, index) => {
              russiaSentences2023.push({
                speaker: speaker,
                sentence: sentence,
                sentiment: refCountry.sentiment[index], // Zorg ervoor dat dit de juiste waarde is (bijv. "Positive", "Negative", "Neutral")
              });
            });
          }
          if (refCountry.country === "UA") {
            refCountry.sentences.forEach((sentence, index) => {
              ukraineSentences2023.push({
                speaker: speaker,
                sentence: sentence,
                sentiment: refCountry.sentiment[index], // Zorg ervoor dat dit de juiste waarde is (bijv. "Positive", "Negative", "Neutral")
              });
            });
          }
        });
      });
    }),
    d3.json("/speeches_2022_analysed.json").then((data) => {
      const speeches = data.speeches;

      speeches.forEach((speech) => {
        const speaker = speech.speaker_country; // Haal de naam van de spreker op

        speech.referenced_countries.forEach((refCountry) => {
          if (refCountry.country === "RUS") {
            refCountry.sentences.forEach((sentence, index) => {
              russiaSentences2022.push({
                speaker: speaker,
                sentence: sentence,
                sentiment: refCountry.sentiment[index], // Zorg ervoor dat dit de juiste waarde is (bijv. "Positive", "Negative", "Neutral")
              });
            });
          }
          if (refCountry.country === "UA") {
            refCountry.sentences.forEach((sentence, index) => {
              ukraineSentences2022.push({
                speaker: speaker,
                sentence: sentence,
                sentiment: refCountry.sentiment[index], // Zorg ervoor dat dit de juiste waarde is (bijv. "Positive", "Negative", "Neutral")
              });
            });
          }
        });
      });
    }),
    ])
    dataLoaded = true;
    handleCountryComment();
  handleCountryChange();
  handleConflictChange();

  })


  const handleGroupChange = () => {
    countries = getCountriesByGroup(group); // Update landenlijst
    selectedGroup.set(group); // Update geselecteerde groep
    if (!countries.some((country) => country.name === $selectedCountry)) {
      selectedCountry.set("Netherlands"); // Reset de landselectie
    }
  };

  const handleCountryComment = () => {
  if (dataLoaded) {
    countryComment.set(
      getCommentForSelectedCountry(
        russiaSentences2022,
        russiaSentences2023,
        ukraineSentences2022,
        ukraineSentences2023
      )
    );
  }
};


  const handleCountryChange = () => {
    if (conflict === "RUS" || conflict === "UA") {
      if (!group) {
        group = "all";
        selectedGroup.set(group);
      }
    } else {
      countries = [];
    }

    selectedConflict.set(conflict);
    selectedGroup.set(group || "all");
    selectedYear.set(year);

    handleCountryComment();
  };

  // Jaar wijzigen indien nodig
  const handleYearChange = (event) => {
    year = event.target.value;
    selectedYear.set(year); // Zet het geselecteerde jaar in de store
  };

  // Update de landenlijst wanneer een conflict wordt gekozen
  const handleConflictChange = () => {
   if ($selectedConflict === "RUS" || $selectedConflict === "UA") {
      countries = getCountriesByGroup("all");
   } else {
      countries = [];
   }

   if (!countries.some((country) => country.name === $selectedCountry)) {
      selectedCountry.set("Netherlands");
   }
};

</script>

<section class="country-menu">
  <!-- Radio-buttons voor landenconflict -->
  <svg viewBox="0 0 161 162" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <rect width="161" height="162" fill="url(#pattern0_1_4188)"/>
    <defs>
    <pattern id="pattern0_1_4188" patternContentUnits="objectBoundingBox" width="1" height="1">
    <use xlink:href="#image0_1_4188" transform="matrix(0.0010133 0 0 0.00100705 -0.00310559 0)"/>
    </pattern>
    <image id="image0_1_4188" width="993" height="993" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA+EAAAPhCAMAAAChZ17UAAAAM1BMVEVMaXH////////////////////////////////////////////////////////////////x7/yuAAAAEHRSTlMAYNCg8BAwgEDAIOBwkLBQ3NzgogAAAAlwSFlzAAC4jAAAuIwBzPa7LwAAIABJREFUeJzt3QmWqkgURVF77FJz/qOtVT8blURFhIh37zt7ALUqwfOBICKYbT8B2KJwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4YAzCgecUTjgjMIBZxQOOKNwwBmFA84oHHBG4fC1WDbn7f/mzWmR9DxTeBar3W730TRNs/2ynl3bbL9LaJpmudvtVuJH5bBrzpubv3C2ni/V/6ohKNza6v+qj9vtfva6/b/gd7uD1gFa7T6O23t/7HwX4P+wLAq3tNotm/mgrrust9v/Uw9/oBbL5unfvM3WOIWb2Z2a891L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"/>
    </defs>
    </svg>    
  <div>  
    <legend>Select Russia or Ukraine</legend>
    <section>
    <label>
      <input
        type="radio"
        name="conflict"
        value="RUS"
        bind:group={conflict}
        on:change={() => {
          handleCountryChange();
          handleConflictChange();
        }}
      />
      <img src="./Flag_of_Russia.svg.webp" alt="Russia">
    </label>
    <label>
      <input
        type="radio"
        name="conflict"
        value="UA"
        bind:group={conflict}
        on:change={() => {
          handleCountryChange();
          handleConflictChange();
        }}
      />
      <img src="./Flag_of_Ukraine.svg.png" alt="Ukraine">
    </label>
  </section>
</div>

  <!-- Dropdown voor jaren -->
   <div>
  <label for="year">Select a year</label>
  <select
    bind:value={year}
    on:change={handleYearChange}
    disabled={!(conflict === "RUS" || conflict === "UA")}
  >
    <option value="" disabled>Kies een jaar</option>
    <option value="2022">2022</option>
    <option value="2023" selected>2023</option>
  </select>
</div>

  <!-- Dropdown voor groepen -->
   <div>
  <label for="group">Choose a group</label>
  <select
    id="group"
    bind:value={group}
    on:change={handleGroupChange}
    disabled={!(conflict === "RUS" || conflict === "UA")}
  >
    <option value="" disabled>Choose a group</option>
    <option value="all" selected={group === "all"}>All groups</option>
    <option value="securitycouncil">Security Council</option>
    <option value="g7">G7</option>
    <option value="european union">European Union</option>
    <option value="nato">NATO</option>
    <option value="brics">BRICS</option>
  </select>
</div>

<div>
  <!-- Dropdown voor landen -->
  <label for="country">Choose a country</label>
  <select
    id="country"
    bind:value={$selectedCountry} 
    on:change={handleCountryComment} 
    disabled={!(conflict === "RUS" || conflict === "UA")}
  >
    <option value="" disabled>-- List of countries --</option>
    {#each countries as country}
      <option value={country.name}>{country.name}</option>
    {/each}
  </select>
</section>
