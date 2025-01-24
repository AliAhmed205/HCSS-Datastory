<script>
  import { onMount } from 'svelte';
  import { countries, getFlagUrl } from '$lib/countries';

  let liElements = [];
  let mentions;

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.5 }
    );

    liElements.forEach((li) => observer.observe(li));

    // Observe the mentions element
    if (mentions) {
      observer.observe(mentions);
    }

    return () => {
      observer.disconnect();
    };
  });
</script>

<section class="data-story">
    <h4 class="mentions" bind:this={mentions} style="--i: 1s">400+</h4>
    <h3>Over the past two years Russia and Ukraine have had over <span>400 mentions</span> in the general assembly, reflecting the role their conflict plays in global diplomacy. These mentions spark divisions among the different nations. </h3>
  <ul>
    <li bind:this={liElements[0]} style="--i: .5s">
      <h3>"“Ever since 2014, we have been making every possible effort to bring peace to Ukraine."</h3>
      <h4>{countries[64].name}</h4>
      <div class="triangle"></div>
      <img src="{getFlagUrl('Belarus')}" alt="Flag of Belarus">
    </li>
    <li bind:this={liElements[1]} style="--i: .7s">
      <h3>"We have welcomed thousands of refugees and assisted those who remain in Ukraine."</h3>
      <div class="triangle"></div>
      <h4>{countries[3].name}</h4>
      <img src="{getFlagUrl('Italy')}" alt="Flag of Italy">
    </li>
    <li bind:this={liElements[2]} style="--i: .9s">
      <h3>“Putin claims that he had to act because Russia was threatened. But no one threatened Russia, and no one other than Russia sought conflict.”</h3>
      <div class="triangle"></div>
      <h4>{countries[6].name}</h4>
      <img src="{getFlagUrl('United States')}" alt="Flag of United States">
    </li>
    <li bind:this={liElements[3]} style="--i: 1.1s">
      <h3>"We condemn in the strongest terms the war crimes committed by Russia in Ukraine."</h3>
      <div class="triangle"></div>
      <h4>{countries[22].name}</h4>
      <img src="{getFlagUrl('Estonia')}" alt="Flag of Estonia">
    </li>
    <li bind:this={liElements[4]} style="--i: 1.3s">
      <h3>“They are taking refuge in our country from death and from slavery under the Russian occupation after Russia’s invasion of Ukraine"</h3>
      <div class="triangle"></div>
      <h4>{countries[34].name}</h4>
      <img src="{getFlagUrl('Poland')}" alt="Flag of Poland">
    </li>
  </ul>
  <img src="./visual-bottomright.png" aria-hidden="true" alt="visual-bottom right">
  <img src="./visual-bottomright.png" aria-hidden="true" alt="visual-bottom right">
</section>