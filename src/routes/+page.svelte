<script>
  import CommentEg from "../components/CommentEg.svelte";
  import GinaTool from "../components/GinaTool.svelte";

  // import CountrySelect from "../components/CountrySelect.svelte";
  import Intro from "../components/Intro.svelte";

  import Seats from "../components/Seats.svelte";
  import UnitedNations from "../components/UnitedNations.svelte";
  import "../styles/style.css";

  import { onMount } from "svelte";

  import BarChart from "../components/BarChart.svelte";
  import SentimentExplaind from "../components/SentimentExplaind.svelte";
  import UkraineRussiaCharts from "../components/UkraineRussiaCharts.svelte";
  import UkraineRussiaPie from "../components/UkraineRussiaPie.svelte";
  import CTA from "../components/CTA.svelte";

  let data = [];

  onMount(() => {
    const fetchData = async () => {
      const response = await fetch("./jaarlijks-sentiment.json");
      const json = await response.json();
      data = json.data;
    };
    fetchData();
  });
</script>

<main>
  <Intro />
  <UnitedNations />
  <CommentEg />
  <GinaTool />
  <SentimentExplaind />
  <BarChart {data} />
  <UkraineRussiaCharts />
  <UkraineRussiaPie />
  <CTA />
  <Seats />
  <a href="https://hcss.nl/">
    <svg
      id="svg-HCSS-top"
      data-name="Laag 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200.4 200.4"
    >
      <g id="VV13gY">
        <path
          class="cls-1"
          d="M200.4,0v200.4H0V0h200.4ZM124.5,67.2c-1.2,3.1-4.4,4.7-6.1,7.9-2.7,5.2-3.2,12.5-1.6,18.1s8.1,11.4,11.1,17.5,2.2,12.2,7.2,15.9c8.8,6.5,24.8,1.2,29-8.7-4-7-5.6-14.8-7.1-22.6s-2.7-13.1-2.7-17.2,1.3-6.8,1-9.7c-.6-5.1-9.8-15.6-9.7-18.4,1.3-4.1,14.7-14,4.7-15.3-6.5-.8-17.1,3.8-23.7,3.8s-12.9-3.4-18.6-3.8c-52.9-3.5-87.4,55.8-61.4,101.3,4.7,8.2,18.5,23,27.3,26.3s3.5.8,5.2-.9c-4.6-7.3,3.2-8.7,5.6-13s.6-4.1,1.6-5.9,3.9-3.3,5-4.6c6.2-7.2,8.6-29.5,6.2-38.4-1.3-4.9-6.6-1.5-6.6-5.9s2-2.3,2.4-2.9,0-2.5.8-3.9,1.6-.8,1.8-1.4c1.7-5.9-4.9-14.2-8.7-18.2l6.1-.7c.3-3.2,2.8-2.8,5-4s2.9-2.9,5-2.7c-4.9-9.4,9.3-10.7,5.6,0,2.3,0,3.7,1.9,5.4,3,1.7,1.1,4,.6,4,3.7l6.1.7h.1Z"
        />
      </g>
    </svg>
  </a>
</main>
