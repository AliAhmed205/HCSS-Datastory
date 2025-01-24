<script>
  import { onMount, onDestroy } from "svelte";
  import * as d3 from "d3";

  export let data = [];

  const width = 3300;
  const height = 400;
  const margin = { top: 20, right: 0, bottom: 40, left: 50 };

  const colors = {
    Positief: "#afd077",
    Negatief: "#C48469",
    Neutraal: "#82A0BC",
  };

  let svg;
  let observer;
  let selectedData = {
    Jaar: "",
    Totaal: "",
    Positief: "",
    Negatief: "",
    Neutraal: "",
  };
  
  let isDrawn = false;  // Vlag om te controleren of de grafiek al is getekend

  onMount(() => {
    setTimeout(() => {
      createSvg();
      handleResize();
      
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize);  // Add resize event listener

        const target = document.querySelector("svg.datavis-barchart");
        if (target) {
          observer = new IntersectionObserver(handleIntersect, { threshold: 0.2 });
          observer.observe(target);
        }
      }
    }, 100);  // Wacht 100ms voor de DOM om volledig te laden
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
    }
  });

  function createSvg() {
    svg = d3
      .select("svg.datavis-barchart")
      .attr("width", width)
      .attr("height", height);

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`);

    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`);
  }

  function handleResize() {
    if (typeof window !== 'undefined') {
      if (window.innerWidth <= 786) {
        // Direct tekenen voor kleinere schermen
        if (data && data.length && !isDrawn) {
          drawChart();
          isDrawn = true;  // Stel de vlag in op 'true' zodat de grafiek niet opnieuw wordt getekend
        }
      } else {
        // Gebruik IntersectionObserver voor grotere schermen
        const target = document.querySelector("svg.datavis-barchart");
        if (target && !observer) {
          observer = new IntersectionObserver(handleIntersect, { threshold: 0.2 });
          observer.observe(target);
        }
      }
    }
  }

  function drawChart() {
    if (!data || data.length === 0) return;

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.Jaar))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.Totaal)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const stack = d3.stack().keys(["Positief", "Negatief", "Neutraal"]);
    const series = stack(data);

    svg
      .select(".x-axis")
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("transform", "rotate(0)")
      .style("text-anchor", "center")
      .style("font-family", "Roboto Slab")
      .style("font-size", ".8rem")
      .style("color", "ghostwhite");

    svg.selectAll(".bars").remove();
    svg
      .append("g")
      .attr("class", "bars")
      .selectAll("g")
      .data(series)
      .join("g")
      .attr("fill", (d) => colors[d.key])
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("x", (d) => x(d.data.Jaar))
      .attr("y", height - margin.bottom)
      .attr("height", 0)
      .attr("width", x.bandwidth())
      .transition()
      .delay((_, i) => i * 100)
      .duration(500)
      .ease(d3.easeCubicOut)
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .style("opacity", (d) =>
        selectedData.Jaar && selectedData.Jaar !== d.data.Jaar ? 0.5 : 1
      );

    svg.selectAll("rect").on("click", function (event, d) {
      updateData(d);
      updateOpacity();
    });
  }

  function updateData(d) {
    const dataPoint = d.data;
    selectedData = {
      Jaar: dataPoint.Jaar,
      Totaal: dataPoint.Totaal,
      Positief: dataPoint.Positief,
      Negatief: dataPoint.Negatief,
      Neutraal: dataPoint.Neutraal,
    };
    updateOpacity();
  }

  function updateOpacity() {
    svg.selectAll("rect").style("opacity", (d) =>
      selectedData.Jaar && selectedData.Jaar !== d.data.Jaar ? 0.5 : 1
    );
  }

  function handleIntersect(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !isDrawn) {
        drawChart();
        isDrawn = true;  // Stel de vlag in op 'true' zodra de grafiek is getekend
        observer.disconnect();
      }
    });
  }
</script>



<section class="data-story">
  <h2>
    The United Nations speech patterns and their sentiments throughout the years <span>since 1946</span>
  </h2>
  <ul>
    {#if selectedData.Jaar}
      <li><span>Year</span>: {selectedData.Jaar}</li>
      <li><span>Total Mentions</span>: {selectedData.Totaal}</li>
      <li><span>Positive</span>: {selectedData.Positief}</li>
      <li><span>Neutral</span>: {selectedData.Neutraal}</li>
      <li><span>Negative</span>: {selectedData.Negatief}</li>
    {:else}
      <li>Select a year to view the mentions and their sentiments.</li>
    {/if}
  </ul>
  <article>
    <svg class="datavis-barchart"></svg>
  </article>
</section>
