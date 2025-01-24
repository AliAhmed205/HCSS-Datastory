<script>
  import CommentEg from "../components/CommentEg.svelte";
  import GinaTool from "../components/GinaTool.svelte";

  // import CountrySelect from "../components/CountrySelect.svelte";
  import Intro from "../components/Intro.svelte";

  import Seats from "../components/Seats.svelte";
  import UnitedNations from "../components/UnitedNations.svelte";
  import "../styles/style.css"

  import { onMount } from "svelte";

  import BarChart from "../components/BarChart.svelte";
  import SentimentExplaind from "../components/SentimentExplaind.svelte";
  import UkraineRussiaCharts from "../components/UkraineRussiaCharts.svelte";
  import UkraineRussiaPie from "../components/UkraineRussiaPie.svelte";
  import CTA from "../components/CTA.svelte"

let data = [];

onMount(() =>{
const fetchData = async () => {
    const response = await fetch('./jaarlijks-sentiment.json');
    const json = await response.json();
    data = json.data; 
};
fetchData();
}); 

</script>


<main>
  <Intro />
  <UnitedNations />
  <CommentEg/>
  <GinaTool />
  <SentimentExplaind />
  <BarChart {data} />
  <UkraineRussiaCharts />
  <UkraineRussiaPie />
  <CTA />
  <Seats />
</main>