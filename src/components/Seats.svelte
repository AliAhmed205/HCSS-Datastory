<script>
  import {
    selectedGroup, selectedCountry, selectedConflict, selectedYear, countryComment
  } from "../lib/stores";
  import { getCountriesByGroup, getFlagUrl } from "../lib/countries";
  import { onDestroy, onMount } from "svelte";
  import * as d3 from "d3";
  import "../styles/style.css";
  import { getCommentForSelectedCountry } from "../lib/comment.js"

  import Legend from "../components/Legend.svelte";
  import CountrySelect from "./CountrySelect.svelte";

  let countryFlag = "";
  let sentimentCounts = {};
  let hoveredSeatCountryFlag = "";
  let seatPositions = [];
  let chosenSeat = null;
  let mostFrequentSentiment = '';
  let centerCountry = null;

  let selectedAdressee = null;

  let csvDataRussia2022 = [];
  let csvDataRussia2023 = [];

  let csvDataUkraine2022 = [];
  let csvDataUkraine2023 = [];

  let russiaSentences2023 = [];
  let russiaSentences2022 = [];
  
  let ukraineSentences2023 = [];
  let ukraineSentences2022 = [];

  const totalSeats = 193;
  const g7Seats = 7;
  const bricsSeats = 48;
  const natoSeats = 50;
  const g20Seats = 40;
  const centralRadius = 200;
  const ringGap = 120;

  onMount(() => {

    d3.csv("./sentiments-russia-2023.csv").then((data) => {
      csvDataRussia2023 = data;
    });
    d3.csv("./sentiments-russia-2022.csv").then((data) => {
      csvDataRussia2022 = data;
    });

    d3.csv("./sentiments-ukraine-2023.csv").then((data) => {
      csvDataUkraine2023 = data;
    });
    d3.csv("./sentiments-ukraine-2022.csv").then((data) => {
      csvDataUkraine2022 = data;
    });

    d3.json("./speeches_2023_analysed.json").then((data) => {
      const speeches = data.speeches;

      speeches.forEach((speech) => {
        const speaker = speech.speaker_country; 

        speech.referenced_countries.forEach((refCountry) => {
          if (refCountry.country === "RUS") {
            refCountry.sentences.forEach((sentence, index) => {
              russiaSentences2023.push({
                speaker: speaker,
                sentence: sentence,
                sentiment: refCountry.sentiment[index], 
              });
            });
          }
          if (refCountry.country === "UA") {
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
    });

    d3.json("./speeches_2022_analysed.json").then((data) => {
      const speeches = data.speeches;

      speeches.forEach((speech) => {
        const speaker = speech.speaker_country;

        speech.referenced_countries.forEach((refCountry) => {
          if (refCountry.country === "RUS") {
            refCountry.sentences.forEach((sentence, index) => {
              russiaSentences2022.push({
                speaker: speaker,
                sentence: sentence,
                sentiment: refCountry.sentiment[index],
              });
            });
          }
          if (refCountry.country === "UA") {
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

    });
  });

  let group = "";
  let hoveredSeat = null;
  let countries = [];
  let hoveredSeatCountryName = null;
  let tooltipPosition = { x: 0, y: 0 };
  let hideLabelTimeout;

  $: selectedGroup.subscribe((value) => {
    group = value;
    countries = getCountriesByGroup(group);
  });

  $: selectedCountry.subscribe((value) => {
  if (value) {
    chosenSeat = countries.findIndex(country => country.name === value);
  } else {
    chosenSeat = null; 
  }
});

$: {
  if ($selectedCountry && $selectedConflict && $selectedYear) {
    countryComment.set(
      getCommentForSelectedCountry(
        russiaSentences2022,
        russiaSentences2023,
        ukraineSentences2022,
        ukraineSentences2023
      )
    );
  } else {
    countryComment.set([]);
  }
}
$: {
    sentimentCounts = { 
      "negative": 0, 
      "positive": 0, 
      "neutral": 0 
    };
    $countryComment.forEach(comment => {
      if (comment.sentiment) {
        sentimentCounts[comment.sentiment]++;
      }
    });
    mostFrequentSentiment = Object.keys(sentimentCounts).reduce((a, b) => 
      sentimentCounts[a] > sentimentCounts[b] ? a : b
    );
  }

  
  const handleCountrySelection = (country) => {
  selectedCountry.set(country);
  };

  function scrollToCommentBox() {
    const commentBox = document.querySelector('#comment-box');
    if (commentBox) {
      commentBox.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll-effect
    }
  }

  const calculatePositions = (totalSeats, g7Seats, centralRadius, ringGap) => {
    let positions = [];
    let remainingSeats = totalSeats - g7Seats;

    for (let i = 0; i < g7Seats; i++) {
      const angle = (i / g7Seats) * 2 * Math.PI;
      const rotation = (angle * 180) / Math.PI + 90;
      positions.push({
        x: centralRadius * Math.cos(angle),
        y: centralRadius * Math.sin(angle),
        rotation: rotation,
      });
    }

    let currentRadius = centralRadius + ringGap;
    let seatsInCurrentRing = 20;

    while (remainingSeats > 0) {
      const seatsToAdd = Math.min(seatsInCurrentRing, remainingSeats);
      for (let i = 0; i < seatsToAdd; i++) {
        const angle = (i / seatsToAdd) * 2 * Math.PI;
        const rotation = (angle * 180) / Math.PI + 90;
        positions.push({
          x: currentRadius * Math.cos(angle),
          y: currentRadius * Math.sin(angle),
          rotation: rotation,
        });
      }
      remainingSeats -= seatsToAdd;
      currentRadius += ringGap;
      seatsInCurrentRing += 6;
    }

    return positions;
  };

  if (typeof document !== "undefined") {
    seatPositions = calculatePositions(
      totalSeats,
      g7Seats,
      centralRadius,
      ringGap
    );
  }

  const getSentimentClass = (address) => {
    let countryData = [];

    if ($selectedConflict === "RUS") {
      countryData =
        $selectedYear === "2023" ? csvDataRussia2023 : csvDataRussia2022;
    } else if ($selectedConflict === "UA") {
      countryData =
        $selectedYear === "2023" ? csvDataUkraine2023 : csvDataUkraine2022;
    } else {
      return "seat-inactive";
    }

    const dataForAddress = countryData.find((row) => row.Speaker === address);

    if (!dataForAddress) {
      return "seat-inactive"; // Geen gegevens voor dit adres
    }

    const avgPositive = parseFloat(dataForAddress["Avg Positive Probability"]);
    const avgNeutral = parseFloat(dataForAddress["Avg Neutral Probability"]);
    const avgNegative = parseFloat(dataForAddress["Avg Negative Probability"]);

    if (avgPositive > avgNeutral && avgPositive > avgNegative) {
      return "positive-speech";
    } else if (avgNegative > avgPositive && avgNegative > avgNeutral) {
      return "negative-speech";
    } else {
      return "neutral-speech";
    }
  };

const getSeatClass = (index) => {
  const country = countries.find((country) => country.seat === index + 1);

  if (!country) return "seat-inactive"; // Geen land gevonden, inactieve stoel

  if (country.name === $selectedCountry) {
    return "chosen-chair"; // Geselecteerde stoel
  }

  const isInSelectedGroup = group === "all" || country.groups.includes(group);

  if (!isInSelectedGroup) {
    return "seat-inactive"; 
  }

    if (group === "all") {
    const sentimentClass = getSentimentClass(country.name);
    return sentimentClass !== "seat-inactive" ? sentimentClass : "seat-inactive";
  }

  const sentimentClass = getSentimentClass(country.name);
  return sentimentClass !== "seat-inactive" ? sentimentClass : "seat-active";
};

const showSeatLabel = (index, event) => {
    clearTimeout(hideLabelTimeout);
    hoveredSeat = index;
    const seatElement = event.target.getBoundingClientRect();
    tooltipPosition = {
      x: seatElement.left + seatElement.width / 2,
      y: seatElement.top - 30,
    };

    const country = countries.find((country) => country.seat === index + 1);
    hoveredSeatCountryName = country ? country.name : null;

    if (country && country.name) {
      hoveredSeatCountryFlag =
        getFlagUrl(country.name) ||
        "https://upload.wikimedia.org/wikipedia/commons/2/2f/Flag_of_the_United_Nations.svg";
    } else {
      hoveredSeatCountryFlag =
        "https://upload.wikimedia.org/wikipedia/commons/2/2f/Flag_of_the_United_Nations.svg";
    }
  };

  const hideSeatLabel = () => {
    hideLabelTimeout = setTimeout(() => {
      hoveredSeat = null;
      hoveredSeatCountryName = null;
      hoveredSeatCountryFlag = "";
    }, 0);
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


const handleSeatClick = (index) => {
  const clickedCountry = countries.find((country) => country.seat === index + 1);
  
  if (clickedCountry?.name === $selectedCountry) {
    selectedAdressee = null;
    selectedCountry.set(""); // Clear the selection
    selectedGroup.set("all");
    group = "all";
    chosenSeat = null; // Reset selected seat
    return;
  }

  selectedCountry.set(clickedCountry?.name || "");
  selectedGroup.set("all");
  group = "all";
  chosenSeat = index; // Update selected seat dynamically

  // Set comment for selected country
  countryComment.set(getCommentForSelectedCountry(russiaSentences2022, russiaSentences2023, ukraineSentences2022, ukraineSentences2023));
};


  // Unsubscribe van store wanneer component wordt vernietigd
  onDestroy(() => {
    if (typeof unsubscribe === "function") unsubscribe();
  });

  const unsubscribeSelectedConflict = selectedConflict.subscribe((value) => {
  if (value === "RUS") {
    countryFlag = getFlagUrl("Russia");
  } else if (value === "UA") {
    countryFlag = getFlagUrl("Ukraine");
  } else {
    countryFlag = $selectedCountry
      ? getFlagUrl($selectedCountry)
      : "https://upload.wikimedia.org/wikipedia/commons/2/2f/Flag_of_the_United_Nations.svg";
  }
});
</script>
<section class="sphere-wrapper">
<CountrySelect />
  <article class="sphere">
    <Legend />
    <svg width="21rem" viewBox="-500 -450 1000 1000" style="overflow: visible;">

      <g transform="translate(0, 0)">
        <clipPath id="circle-clip">
          <circle cx="0" cy="0" r="105" />
        </clipPath>
        <image
          href={countryFlag}
          x="-175"
          y="-175"
          width="350"
          height="350"
          preserveAspectRatio="xMidYMid slice"
          clip-path="url(#circle-clip)"
        />
      </g>

      {#each seatPositions as { x, y, rotation }, index}
      <g
      transform="translate({x}, {y}) rotate({rotation}) scale(.8)"
      class="{getSeatClass(index)} {chosenSeat === index ? 'chosen-chair' : ''}"
      id="seat-{index}"
      on:mouseover={(event) => showSeatLabel(index, event)}
      on:mouseout={hideSeatLabel}
      on:click={() => handleSeatClick(index)}
        >
          <g>
            <path
              class="cls-1"
              d="M33.8,20.52c-.05-.27-.1-.55-.15-.82-3.61.94-7.22,1.82-10.81,2.83-1.81.51-2.5,1.95-2.5,3.74,0,1.85.04,3.7.06,5.55.03,2.06-.84,3.19-3.03,3.15-2.16-.05-4.32-.1-6.47.02-2.6.14-3.47,1.76-2.4,4.12.31.69.57,1.44.67,2.18.52,3.89,1.09,7.77,1.42,11.67.18,2.13.5,4.53-.25,6.4-1.29,3.24.52,5.24,2.17,7.19,10.64,12.5,31.12,12.51,41.98.17,1.63-1.85,2.38-3.84,2.29-6.31-.29-7.39-.58-14.77,2.04-21.92.77-2.1-.6-3.52-2.93-3.52-1.85,0-3.7.02-5.55.02-3.07,0-3.78-.7-3.79-3.84,0-1.77.27-3.59-.03-5.31-.19-1.12-.92-2.63-1.84-3.07-3.4-1.63-6.92-3.15-10.91-2.26ZM34.84,0c-9.06.71-17.89,1.31-26.71,2.15-2.08.2-4.17.99-6.09,1.86C.46,4.73-.02,6.22.85,7.92c1.62,3.15,3.09,6.37,4.87,9.42,1.25,2.14,3.1,3.59,5.92,3.02,2.56-.52,5.14-1.17,7.73-1.32,5.52-.32,11.06-.45,16.59-.46,3.99-.01,7.99.15,11.97.49,2.9.25,5.77.94,8.66,1.36,1.55.23,2.92-.19,3.76-1.66,2.05-3.59,4.19-7.13,6.1-10.79.77-1.49.39-3.09-1.28-3.95-1.22-.62-2.49-1.39-3.8-1.52-8.88-.93-17.78-1.7-26.52-2.51ZM66.99,55.11c-.21-3.02-.45-7.47-.9-11.91-.12-1.16-.72-2.36-1.39-3.34-.89-1.31-3.31-1.3-3.97.02-.81,1.62-1.79,3.38-1.85,5.11-.24,6.14-.3,12.29-.07,18.43.1,2.56.87,5.16,1.74,7.6.84,2.34,3.06,2.43,4.33.25.67-1.16,1.15-2.55,1.28-3.88.37-3.59.51-7.21.83-12.27ZM0,54.9c.48,5,.89,9.76,1.41,14.51.19,1.76,1.16,3.23,3.02,3.22,1.75-.01,2.59-1.41,2.88-3.1,1.55-9.11,1.7-18.23.29-27.37-.3-1.93-1.39-3.18-3.33-3.23-1.9-.04-2.63,1.42-2.83,3.07-.52,4.36-.98,8.72-1.44,12.89ZM13.82,32.41c3.36.03,3.63-.37,2.65-3.63-.31-1.03-.49-2.1-.66-3.16-.34-2.2-1.83-3.54-4.04-3.55-.61,0-1.23.06-1.84,0-2.16-.21-2.81.52-2.16,2.64.43,1.4,1.09,2.73,1.48,4.13.93,3.34,1.13,3.54,4.56,3.58ZM53.3,32.43c2.99,0,3.92-.69,4.78-3.54.38-1.25.63-2.55,1.15-3.73,1.08-2.45.69-3.17-2.05-3.13-1.22.02-2.48.13-3.62.51-.68.23-1.41.99-1.65,1.68-.56,1.66-.87,3.41-1.24,5.13-.54,2.56-.08,3.09,2.62,3.09Z"
            />
          </g>
        </g>
      {/each}
    </svg>

    <!-- Voeg hier het label toe dat verschijnt bij hover -->
    {#if hoveredSeat !== null && hoveredSeatCountryName !== null}
      <div
        class="seat-label active"
        style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px;"
      >
        <img src={hoveredSeatCountryFlag} alt="Country Flag" class="flag" />
        <span>{hoveredSeatCountryName}</span>
      </div>
    {/if}
  <article class="meta-data">
    {#if $selectedCountry}
    <div class="meta-container">
    <h2><img src={getFlagUrl($selectedCountry)} alt="">{$selectedCountry}</h2>
    <div>
    <h3>Total Mentions </h3>
   <h3>{$countryComment.length}</h3></div>
    <div class="positive-count"><p>Positive</p><p>{sentimentCounts.positive}</p></div>
    <div class="neutral-count"><p>Neutral</p><p>{sentimentCounts.neutral}</p></div>
    <div class="negative-count"><p>Negative</p><p>{sentimentCounts.negative}</p></div>
  </div>
  {:else}
    <h3>Select a country to read its sentiment values</h3>
  {/if}
  
  <button on:click={scrollToCommentBox}><svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M3.85355 2.14645C3.65829 1.95118 3.34171 1.95118 3.14645 2.14645C2.95118 2.34171 2.95118 2.65829 3.14645 2.85355L7.14645 6.85355C7.34171 7.04882 7.65829 7.04882 7.85355 6.85355L11.8536 2.85355C12.0488 2.65829 12.0488 2.34171 11.8536 2.14645C11.6583 1.95118 11.3417 1.95118 11.1464 2.14645L7.5 5.79289L3.85355 2.14645ZM3.85355 8.14645C3.65829 7.95118 3.34171 7.95118 3.14645 8.14645C2.95118 8.34171 2.95118 8.65829 3.14645 8.85355L7.14645 12.8536C7.34171 13.0488 7.65829 13.0488 7.85355 12.8536L11.8536 8.85355C12.0488 8.65829 12.0488 8.34171 11.8536 8.14645C11.6583 7.95118 11.3417 7.95118 11.1464 8.14645L7.5 11.7929L3.85355 8.14645Z"
    />
  </svg> Scroll down for details</button>
  </article>
  </article>

  <article class="mobile-container">
      <ul class="seats-container" on:scroll={handleScroll}>
        {#each countries as country, index}
          <li
          on:click={() => handleSeatClick(index)}
          class={index}
          data-index={index}
            data-center={centerCountry && centerCountry.seat === country.seat}
          >
            <svg
              class="seat-svg {getSentimentClass(country)}"
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66.99 75.95"
            >
            <g>
              <path
                class="cls-1 {getSeatClass(index)} {chosenSeat === index ? 'chosen-chair' : ''}"
                d="M33.8,20.52c-.05-.27-.1-.55-.15-.82-3.61.94-7.22,1.82-10.81,2.83-1.81.51-2.5,1.95-2.5,3.74,0,1.85.04,3.7.06,5.55.03,2.06-.84,3.19-3.03,3.15-2.16-.05-4.32-.1-6.47.02-2.6.14-3.47,1.76-2.4,4.12.31.69.57,1.44.67,2.18.52,3.89,1.09,7.77,1.42,11.67.18,2.13.5,4.53-.25,6.4-1.29,3.24.52,5.24,2.17,7.19,10.64,12.5,31.12,12.51,41.98.17,1.63-1.85,2.38-3.84,2.29-6.31-.29-7.39-.58-14.77,2.04-21.92.77-2.1-.6-3.52-2.93-3.52-1.85,0-3.7.02-5.55.02-3.07,0-3.78-.7-3.79-3.84,0-1.77.27-3.59-.03-5.31-.19-1.12-.92-2.63-1.84-3.07-3.4-1.63-6.92-3.15-10.91-2.26ZM34.84,0c-9.06.71-17.89,1.31-26.71,2.15-2.08.2-4.17.99-6.09,1.86C.46,4.73-.02,6.22.85,7.92c1.62,3.15,3.09,6.37,4.87,9.42,1.25,2.14,3.1,3.59,5.92,3.02,2.56-.52,5.14-1.17,7.73-1.32,5.52-.32,11.06-.45,16.59-.46,3.99-.01,7.99.15,11.97.49,2.9.25,5.77.94,8.66,1.36,1.55.23,2.92-.19,3.76-1.66,2.05-3.59,4.19-7.13,6.1-10.79.77-1.49.39-3.09-1.28-3.95-1.22-.62-2.49-1.39-3.8-1.52-8.88-.93-17.78-1.7-26.52-2.51ZM66.99,55.11c-.21-3.02-.45-7.47-.9-11.91-.12-1.16-.72-2.36-1.39-3.34-.89-1.31-3.31-1.3-3.97.02-.81,1.62-1.79,3.38-1.85,5.11-.24,6.14-.3,12.29-.07,18.43.1,2.56.87,5.16,1.74,7.6.84,2.34,3.06,2.43,4.33.25.67-1.16,1.15-2.55,1.28-3.88.37-3.59.51-7.21.83-12.27ZM0,54.9c.48,5,.89,9.76,1.41,14.51.19,1.76,1.16,3.23,3.02,3.22,1.75-.01,2.59-1.41,2.88-3.1,1.55-9.11,1.7-18.23.29-27.37-.3-1.93-1.39-3.18-3.33-3.23-1.9-.04-2.63,1.42-2.83,3.07-.52,4.36-.98,8.72-1.44,12.89ZM13.82,32.41c3.36.03,3.63-.37,2.65-3.63-.31-1.03-.49-2.1-.66-3.16-.34-2.2-1.83-3.54-4.04-3.55-.61,0-1.23.06-1.84,0-2.16-.21-2.81.52-2.16,2.64.43,1.4,1.09,2.73,1.48,4.13.93,3.34,1.13,3.54,4.56,3.58ZM53.3,32.43c2.99,0,3.92-.69,4.78-3.54.38-1.25.63-2.55,1.15-3.73,1.08-2.45.69-3.17-2.05-3.13-1.22.02-2.48.13-3.62.51-.68.23-1.41.99-1.65,1.68-.56,1.66-.87,3.41-1.24,5.13-.54,2.56-.08,3.09,2.62,3.09Z"
              />
            </g>
          </svg>
            <h2 class="seat-label">{country.name}</h2>
          </li>
        {/each}
      </ul>
    </article>
  {#if $selectedCountry}
    <article id="comment-box" class="comment-container">
      <h2>
        What <span>{$selectedCountry || "Unknown"}</span> said about
        <span>{$selectedConflict === "RUS" ? "Russia" : "UA" ? "Ukraine": "Unknown"}</span> during their speech in {$selectedYear}
      </h2>
      <h3>Most likely sentiment: {mostFrequentSentiment}</h3>
      <article class="meta-data">
        {#if $selectedCountry}
        <div class="meta-container">
        <div>
        <h3>Total Mentions: </h3>
       <h3>{$countryComment.length}</h3></div>
        <div class="positive-count"><p>Positive:</p><p>{sentimentCounts.positive}</p></div>
        <div class="neutral-count"><p>Neutral:</p><p>{sentimentCounts.neutral}</p></div>
        <div class="negative-count"><p>Negative: </p><p>{sentimentCounts.negative}</p></div>
      </div>
      {:else}
        <h3>Select a country to read its sentiment values</h3>
      {/if}
  
      </article>
      {#each $countryComment as comment}
      <div class={comment.sentiment === 'negative' ? 'negative-comment' : 
                 comment.sentiment === 'positive' ? 'positive-comment' : 
                 comment.sentiment === 'neutral' ? 'neutral-comment' : "neutral-comment"}>
         <div class="breadcrumb-sentiment">
          {#if comment.sentiment === "positive"}
            <span class="sentiment-positive">Positive</span>
          {:else if comment.sentiment === "neutral"}
            <span class="sentiment-neutral">Neutral</span>
          {:else if comment.sentiment === "negative"}
            <span class="sentiment-negative">Negative</span>
          {/if}
        </div>
       <p>{comment.sentence}</p>
    </div>

    {/each}    
    </article>
    <h4 class="read-more">To learn and analyse more, visit our <span>GINA</span> tool for the full context and speech of <span>{$selectedCountry}</span> during <span>{$selectedYear}</span>
    </h4>
    <a class="GINA" href="https://ginadiplomatic.app.hcss.nl/SpeechesStateLevel">Learn with GINA</a>
  {/if}
</section>