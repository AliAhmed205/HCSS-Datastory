<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";

  const data = {
    ua2022: [
      { label: "negative", value: 73.4 },
      { label: "neutral", value: 22.1 },
      { label: "postitive", value: 5.6 }
    ],
    ua2023: [
      { label: "negative", value: 60.8 },
      { label: "neutral", value: 33.3 },
      { label: "postitive", value: 5.9 }
    ],
    ru2022: [
      { label: "negative", value: 71.3 },
      { label: "neutral", value: 24.8 },
      { label: "postitive", value: 3.9 }
    ],
    ru2023: [
      { label: "negative", value: 63.3 },
      { label: "neutral", value: 30.4 },
      { label: "postitive", value: 6.3 }
    ]
  };

  const createPieChart = (selector, data) => {
  const width = 250;
  const height = 250;
  const radius = Math.min(width, height) / 2;

  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.label))
    .range(["#C48469", "#82A0BC", "#A4A58D"]);

  const svg = d3.select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const pie = d3.pie()
    .value(d => d.value)
    .sort((a, b) => a.value - b.value);

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  const labelArc = d3.arc()
    .innerRadius(radius + 20)
    .outerRadius(radius + 20);

  const path = svg.selectAll("path")
    .data(pie(data))
    .join("path")
    .attr("fill", d => color(d.data.label))
    .attr("stroke", "#0b1a30")
    .attr("stroke-width", 3)
    .each(function (d) {
      this._current = { startAngle: 0, endAngle: 0 };
    });

  const animatePie = () => {
    path.transition()
      .duration(1000)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(1);
        return function (t) {
          return arc(interpolate(t));
        };
      });
  };

  const labels = svg.selectAll("text")
    .data(pie(data))
    .join("text")
    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
    .attr("text-anchor", d => (d.startAngle + d.endAngle) / 2 > Math.PI ? "end" : "start")
    .attr("font-size", "0.8rem")
    .attr("fill", "whitesmoke")
    .style("opacity", 1) // Begin met onzichtbare tekst
    .selectAll("tspan")
    .data(d => [d.data.label, `${d.data.value}%`])
    .join("tspan")
    .attr("x", 0)
    .attr("dy", (d, i) => (i === 0 ? 0 : "1em"))
    .text(d => d);

  const animateLabels = () => {
    labels.transition()
      .duration(1000)
      .style("opacity", 1);
  };

  return { animatePie, animateLabels };
};




onMount(() => {
  const charts = [
    { selector: "#pie-chart-ua-2022", data: data.ua2022 },
    { selector: "#pie-chart-ua-2023", data: data.ua2023 },
    { selector: "#pie-chart-ru-2022", data: data.ru2022 },
    { selector: "#pie-chart-ru-2023", data: data.ru2023 },
  ];

  const chartElements = charts.map(chart => {
    const { animatePie, animateLabels } = createPieChart(chart.selector, chart.data);
    return { element: document.querySelector(chart.selector), animatePie, animateLabels };
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const chart = chartElements.find(c => c.element === entry.target);
          chart.animatePie();
          chart.animateLabels();
        }
      });
    },
    { threshold: 0.5 } // Pas threshold aan
  );

  chartElements.forEach(chart => observer.observe(chart.element));
});

</script>

<section class="data-story">
  <!-- Oekraïne Pie Charts -->
   <article>
    <div class="text-container">
      <h3>Sentiment about Ukraine</h3>
      <p>In 2023, negative sentiments declined towards Ukraine. More countries adopted a neutral tone in their speeches, while positive speeches saw a modest increase.
      </p>
    </div>
  <div id="pie-chart-ua-2022">
    <h3>2022</h3>
  </div>
  <div id="pie-chart-ua-2023">
    <h3>2023</h3>

  </div>
   </article>

   <article>
  <!-- Rusland Pie Charts -->
  <div class="text-container">
    <h3>Sentiment about Russia</h3>
    <p>In 2023, sentiments toward Russia shifted notably, with positive speeches nearly doubling, neutral speeches seeing a slight rise, and negative speeches declining.</p>
</div>
  <div id="pie-chart-ru-2022">
    <h3>2022</h3>
  </div>
  <div id="pie-chart-ru-2023">
    <h3>2023</h3>
  </div>
</article>
</section>
