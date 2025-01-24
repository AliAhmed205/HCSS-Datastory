<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";

  let ukraineData = [
    { year: 2022, mentions: 140 },
    { year: 2023, mentions: 120 },
  ];

  let russiaData = [
    { year: 2022, mentions: 101 },
    { year: 2023, mentions: 79 },
  ];

  let titleVisible = false;

  const drawBarChart = (data, containerId, title, maxMentions) => {
    const width = 300;
    const height = 300;
    const margin = { top: 40, right: 20, bottom: 40, left: 20 };

    const svg = d3
      .select(containerId)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.year))
      .range([0, width])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, maxMentions])
      .range([height, 0]);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .style("color", "white")
      .style("font-size", "1rem")
      .call(d3.axisBottom(xScale).tickFormat((d) => d));

    const bars = svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.year))
      .attr("width", xScale.bandwidth())
      .attr("y", height) // Startpositie van de staven
      .attr("height", 0) // Starthoogte van de staven
      .attr("fill", "#82A0BC");

    const labels = svg
      .selectAll(".label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => xScale(d.year) + xScale.bandwidth() / 2)
      .attr("y", height) // Startpositie boven de staaf
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "white");

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "1.2rem")
      .style("fill", "white")
      .text(title);

    return { bars, labels, yScale };
  };

  const animateChart = (elements, data) => {
    elements.bars
      .transition()
      .duration(800)
      .attr("y", (d) => elements.yScale(d.mentions))
      .attr("height", (d) => elements.yScale(0) - elements.yScale(d.mentions));

    elements.labels
      .transition()
      .duration(800)
      .attr("y", (d) => elements.yScale(d.mentions) - 5)
      .text((d) => d.mentions);
  };

  onMount(() => {
    const maxMentions = 170;
    const ukraineElements = drawBarChart(
      ukraineData,
      "#ukraineChart",
      "Mentions about Ukraine",
      maxMentions
    );
    const russiaElements = drawBarChart(
      russiaData,
      "#russiaChart",
      "Mentions about Russia",
      maxMentions
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id === "ukraineChart") {
            animateChart(ukraineElements, ukraineData);
          } else if (
            entry.isIntersecting &&
            entry.target.id === "russiaChart"
          ) {
            animateChart(russiaElements, russiaData);
          }
          if (entry.isIntersecting && !titleVisible) {
            titleVisible = true;
          }
        });
      },
      { threshold: 1 }
    );

    observer.observe(document.getElementById("ukraineChart"));
    observer.observe(document.getElementById("russiaChart"));
  });
</script>

<style>
  h3 {
    opacity: 0;
    transition: opacity 0.8s ease-in;
  }

  h3.visible {
    opacity: 1;
  }
</style>

<section class="data-story">
  <h2>
    Let us examine the references to Russia and Ukraine made during the speeches
    at the United Nations General Assembly in 2022 and 2023
  </h2>
  <article>
    <div id="ukraineChart"></div>
    <div id="russiaChart"></div>
    <h3 class={titleVisible ? "visible" : ""}>
      Mentions of Russia and Ukraine <span>decreased by 17.4%</span> in 2023
      compared to 2022.
    </h3>
  </article>
</section>
