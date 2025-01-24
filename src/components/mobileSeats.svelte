<script>
  import { selectedGroup, selectedConflict, selectedYear, selectedCountry } from "../lib/stores"; // Importeer de stores voor conflict en jaar
  import { getCountriesByGroup } from "../lib/countries";
  import { onMount } from "svelte";
  import * as d3 from "d3";

  let countries = [];
  let totalSeats = 193;
  let centerCountry = null;
  let csvLoaded = false;
  let chosenSeat = null;
  let selectedAdressee = null;



  let csvDataRussia2022 = [];
  let csvDataRussia2023 = [];
  let csvDataUkraine2022 = [];
  let csvDataUkraine2023 = [];

  let russiaSentences2023 = [];
  let ukraineSentences2023 = [];
  let russiaSentences2022 = [];
  let ukraineSentences2022 = [];

  let countryComment = [];



  // CSV-bestanden laden bij mount
  onMount(() => {
  Promise.all([
    // CSV-bestanden
    d3.csv('/sentiments-russia-2023.csv').then((data) => {
      csvDataRussia2023 = data;
    }),
    d3.csv('/sentiments-ukraine-2023.csv').then((data) => {
      csvDataUkraine2023 = data;
    }),
    d3.csv('/sentiments-russia-2022.csv').then((data) => {
      csvDataRussia2022 = data;
    }),
    d3.csv('/sentiments-ukraine-2022.csv').then((data) => {
      csvDataUkraine2022 = data;
    }),

    // JSON-bestanden
    d3.json('/speeches_2023_analysed.json').then((data) => {
      const speeches = data.speeches;
      speeches.forEach((speech) => {
        const speaker = speech.speaker_country;
        speech.referenced_countries.forEach((refCountry) => {
          if (refCountry.country === 'RUS') {
            refCountry.sentences.forEach((sentence, index) => {
              russiaSentences2023.push({
                speaker: speaker,
                sentence: sentence,
                sentiment: refCountry.sentiment[index],
              });
            });
          }
          if (refCountry.country === 'UA') {
            refCountry.sentences.forEach((sentence, index) => {
              ukraineSentences2023.push({
                speaker: speaker,
                sentence: sentence,
                sentiment: refCountry.sentiment[index],
              });
            });
          }
        });
      });
    }),
    d3.json('/speeches_2022_analysed.json').then((data) => {
      const speeches = data.speeches;
      speeches.forEach((speech) => {
        const speaker = speech.speaker_country;
        speech.referenced_countries.forEach((refCountry) => {
          if (refCountry.country === 'RUS') {
            refCountry.sentences.forEach((sentence, index) => {
              russiaSentences2022.push({
                speaker: speaker,
                sentence: sentence,
                sentiment: refCountry.sentiment[index],
              });
            });
          }
          if (refCountry.country === 'UA') {
            refCountry.sentences.forEach((sentence, index) => {
              ukraineSentences2022.push({
                speaker: speaker,
                sentence: sentence,
                sentiment: refCountry.sentiment[index],
              });
            });
          }
        });
      });
    }),
  ]).then(() => {
    csvLoaded = true;
    console.log('Alle data is geladen!');
  });
});



  $: group = $selectedGroup;
  $: conflict = $selectedConflict;
  $: year = $selectedYear;
  $: country = $selectedCountry;
  $: console.log('Geselecteerd land:', $selectedCountry); // Controleer of de waarde correct wordt geüpdatet


  $: {
    if (csvLoaded && group && conflict && year) {
      countries = getCountriesByGroup(group).map((country) => {
        let sentimentData = [];

        // Kies de juiste dataset op basis van conflict en jaar
        if (conflict === "RU") {
          sentimentData = year === "2023" ? csvDataRussia2023 : csvDataRussia2022;
        } else if (conflict === "UA") {
          sentimentData = year === "2023" ? csvDataUkraine2023 : csvDataUkraine2022;
        }

        const sentiment = sentimentData.find((data) => data.Speaker === country.name);
        return {
          ...country,
          sentiment: sentiment ? sentiment['Most Likely Sentiment'] : "neutral", // Zorg ervoor dat je de juiste kolomnaam gebruikt
        };
      });
      totalSeats = countries.length || 193;
    }
  }

  const getSentimentClass = (country) => {
    if (country.sentiment === "positive") {
      return "positive-speech";
    } else if (country.sentiment === "negative") {
      return "negative-speech";
    } else {
      return "neutral-speech";
    }
  };

  const handleSeatClick = (index) => {
  const clickedCountry = countries.find(
    (country) => country.seat === index + 1
  );

  if (clickedCountry?.name === $selectedCountry) {
    selectedAdressee = null;
    selectedCountry.set("");
    selectedGroup.set("all");
    group = "all";
    chosenSeat = null; // Reset geselecteerde stoel
    return;
  }

  selectedAdressee = null;
  selectedCountry.set(clickedCountry?.name || "");
  selectedGroup.set("all");
  group = "all";

  chosenSeat = index; // Stel de geselecteerde stoel in
  countryComment = getCommentForSelectedCountry();
};

const getSeatClass = (index) => {
  const country = countries.find((country) => country.seat === index + 1);

  if (!country) return "seat-inactive"; // Geen land gevonden, inactieve stoel

  // Controleer of het land tot de geselecteerde groep behoort
  const isInSelectedGroup = group === "all" || country.groups.includes(group);

  if (!isInSelectedGroup) {
    return "seat-inactive"; // Land niet in de geselecteerde groep
  }

  // Als de geselecteerde groep "all" is, markeer de stoel op basis van sentiment
  if (group === "all") {
    const sentimentClass = getSentimentClass(country.name);
    // Stoelen zonder sentiment krijgen de klasse 'seat-inactive'
    return sentimentClass !== "seat-inactive" ? sentimentClass : "seat-inactive";
  }

  // Als de groep niet "all" is, controleer dan op sentiment
  const sentimentClass = getSentimentClass(country.name);

  return sentimentClass !== "seat-inactive" ? sentimentClass : "seat-active";
};


  const getCommentForSelectedCountry = () => {
  let countryComments = [];

  if ($selectedConflict === "RU") {
    countryComments =
      $selectedYear === "2023" ? russiaSentences2023 : russiaSentences2022;
  } else if ($selectedConflict === "UA") {
    countryComments =
      $selectedYear === "2023" ? ukraineSentences2023 : ukraineSentences2022;
  }

  return countryComments
    .filter((sentence) => sentence.speaker === $selectedCountry)
    .map((sentence) => ({
      sentence: sentence.sentence,
      sentiment: sentence.sentiment,
    }));
};


  const handleScroll = (event) => {
    const container = event.target;
    const center = container.offsetWidth / 2 + container.scrollLeft;

    let closestCountry = null;
    let closestDistance = Infinity;

    countries.forEach((country, index) => {
      const seatElement = container.querySelector(`[data-index="${index}"]`);
      if (seatElement) {
        const rect = seatElement.getBoundingClientRect();
        const seatCenter = rect.left + rect.width / 2;
        const distance = Math.abs(center - seatCenter);
        if (distance < closestDistance) {
          closestCountry = country;
          closestDistance = distance;
        }
      }
    });

    centerCountry = closestCountry;
  };

  console.log('Geselecteerd land:', $selectedCountry);
console.log('Commentaren:', countryComment);

</script>




<style>
  .seats-container {
    display: flex;
    justify-content: flex-start;
    padding: 0;
    list-style-type: none;
    overflow-x: auto;
    width: 100%;
    scroll-snap-type: x mandatory;
    gap: 3rem;
    padding-left: 10rem;
  }

  .seat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    scroll-snap-align: center;
    margin: 1rem;
  }

  .seat-svg {
    aspect-ratio: 1 / 1;
    width: 6rem;
  }

</style>


<section class="mobile-container">
  {#if countries.length === 0}
    <p>No countries available</p>
  {:else}
    <ul class="seats-container" on:scroll={handleScroll}>
      {#each countries as country, index}
        <li
        on:click={() => handleSeatClick(index)}
        class="{getSeatClass(index)} {chosenSeat === index ? 'chosen-chair' : ''}"
        data-index={index}
          data-center={centerCountry && centerCountry.seat === country.seat}
        >
          <svg
            class="seat-svg {getSentimentClass(country)}"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66.99 75.95"
          >
          <g>
            <path
              class="cls-1"
              d="M33.8,20.52c-.05-.27-.1-.55-.15-.82-3.61.94-7.22,1.82-10.81,2.83-1.81.51-2.5,1.95-2.5,3.74,0,1.85.04,3.7.06,5.55.03,2.06-.84,3.19-3.03,3.15-2.16-.05-4.32-.1-6.47.02-2.6.14-3.47,1.76-2.4,4.12.31.69.57,1.44.67,2.18.52,3.89,1.09,7.77,1.42,11.67.18,2.13.5,4.53-.25,6.4-1.29,3.24.52,5.24,2.17,7.19,10.64,12.5,31.12,12.51,41.98.17,1.63-1.85,2.38-3.84,2.29-6.31-.29-7.39-.58-14.77,2.04-21.92.77-2.1-.6-3.52-2.93-3.52-1.85,0-3.7.02-5.55.02-3.07,0-3.78-.7-3.79-3.84,0-1.77.27-3.59-.03-5.31-.19-1.12-.92-2.63-1.84-3.07-3.4-1.63-6.92-3.15-10.91-2.26ZM34.84,0c-9.06.71-17.89,1.31-26.71,2.15-2.08.2-4.17.99-6.09,1.86C.46,4.73-.02,6.22.85,7.92c1.62,3.15,3.09,6.37,4.87,9.42,1.25,2.14,3.1,3.59,5.92,3.02,2.56-.52,5.14-1.17,7.73-1.32,5.52-.32,11.06-.45,16.59-.46,3.99-.01,7.99.15,11.97.49,2.9.25,5.77.94,8.66,1.36,1.55.23,2.92-.19,3.76-1.66,2.05-3.59,4.19-7.13,6.1-10.79.77-1.49.39-3.09-1.28-3.95-1.22-.62-2.49-1.39-3.8-1.52-8.88-.93-17.78-1.7-26.52-2.51ZM66.99,55.11c-.21-3.02-.45-7.47-.9-11.91-.12-1.16-.72-2.36-1.39-3.34-.89-1.31-3.31-1.3-3.97.02-.81,1.62-1.79,3.38-1.85,5.11-.24,6.14-.3,12.29-.07,18.43.1,2.56.87,5.16,1.74,7.6.84,2.34,3.06,2.43,4.33.25.67-1.16,1.15-2.55,1.28-3.88.37-3.59.51-7.21.83-12.27ZM0,54.9c.48,5,.89,9.76,1.41,14.51.19,1.76,1.16,3.23,3.02,3.22,1.75-.01,2.59-1.41,2.88-3.1,1.55-9.11,1.7-18.23.29-27.37-.3-1.93-1.39-3.18-3.33-3.23-1.9-.04-2.63,1.42-2.83,3.07-.52,4.36-.98,8.72-1.44,12.89ZM13.82,32.41c3.36.03,3.63-.37,2.65-3.63-.31-1.03-.49-2.1-.66-3.16-.34-2.2-1.83-3.54-4.04-3.55-.61,0-1.23.06-1.84,0-2.16-.21-2.81.52-2.16,2.64.43,1.4,1.09,2.73,1.48,4.13.93,3.34,1.13,3.54,4.56,3.58ZM53.3,32.43c2.99,0,3.92-.69,4.78-3.54.38-1.25.63-2.55,1.15-3.73,1.08-2.45.69-3.17-2.05-3.13-1.22.02-2.48.13-3.62.51-.68.23-1.41.99-1.65,1.68-.56,1.66-.87,3.41-1.24,5.13-.54,2.56-.08,3.09,2.62,3.09Z"
            />
          </g>
        </svg>
          <h2 class="seat-label">{country.name}</h2>
        </li>
      {/each}
    </ul>
  {/if}
  </section>


