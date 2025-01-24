<script>
  import { onMount } from "svelte";

  let count = 0;
  let totalCountries = 193;
  let isVisible = false;

  onMount(() => {
    // Selecteer specifiek de tweede sectie
    const sectionElement = document.querySelector('.data-story.second-section');
    const counterElement = document.getElementById('counter');
    const imgContainer = document.querySelector('.UN-emblem');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isVisible) {
          isVisible = true;

          // Voeg de 'in-view' class toe aan het UN-embleem
          imgContainer.classList.add('in-view');

          // Start de teller
          startCounter();
        }
      });
    }, {
      threshold: .7 // Zorg dat 100% van de sectie zichtbaar moet zijn
    });

    observer.observe(sectionElement);

    function startCounter() {
      const interval = setInterval(() => {
        if (count < totalCountries) {
          count++;
          counterElement.textContent = count;
        } else {
          clearInterval(interval);
        }
      }, 10);
    }

    return () => observer.disconnect();
  });
</script>

<section class="data-story second-section">
  <img src="./visual-bottomright.png" aria-hidden="true" alt="visual-bottom right">
  <h3>
    <span id="counter">0</span>
    <span class="label">countries</span>
  </h3>
  <p>
    The war has polarized the international community, with sharp divisions at
    <span>the United Nations</span> and a profound impact on global politics. The
    main subject for the last two years at the general assembly have therefore been
    about this conflict.
  </p>
  <img class="UN-emblem" src="./UN_emblem_blue.svg" alt="UN_Emblem">
</section>
