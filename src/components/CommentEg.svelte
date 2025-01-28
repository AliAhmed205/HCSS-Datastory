<script>
  import { onMount } from "svelte";
  import { countries, getFlagUrl } from "$lib/countries";

  let liElements = [];
  let mentions;

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
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
  <h3>
    Over the past two years, Russia and Ukraine have had over <span
      >400 mentions</span
    >
    in the General Assembly, reflecting the role the conflict plays
    in global diplomacy. These mentions spark divisions among the different
    nations.
  </h3>
  <ul>
    <li bind:this={liElements[0]} style="--i: .5s">
      <h3>
        "Indeed, in 2009 Russia invited all interested parties to sign a new
        European security treaty that would de jure wrap up the Cold War."
      </h3>
      <h4>{countries[64].name}</h4>
      <div class="triangle"></div>
      <img src={getFlagUrl("Belarus")} alt="Flag of Belarus" />
    </li>
    <li bind:this={liElements[1]} style="--i: .7s">
      <h3>
        "Russia is struggling to make the armaments it needs on its own, as it
        is finding it difficult to buy the materials required to produce them."
      </h3>
      <div class="triangle"></div>
      <h4>{countries[3].name}</h4>
      <img src={getFlagUrl("Italy")} alt="Flag of Italy" />
    </li>
    <li bind:this={liElements[2]} style="--i: .9s">
      <h3>
        “The United States has marshalled massive amounts of security
        assistance, humanitarian aid and direct economic support for Ukraine
        more than $25 billion to date.”
      </h3>
      <div class="triangle"></div>
      <h4>{countries[6].name}</h4>
      <img src={getFlagUrl("United States")} alt="Flag of United States" />
    </li>
    <li bind:this={liElements[3]} style="--i: 1.1s">
      <h3>
        "It is shameful that, since 24 February, it has adopted only a
        presidential statement on Ukraine."
      </h3>
      <div class="triangle"></div>
      <h4>{countries[22].name}</h4>
      <img src={getFlagUrl("Estonia")} alt="Flag of Estonia" />
    </li>
    <li bind:this={liElements[4]} style="--i: 1.3s">
      <h3>
        “Today it has against it not the Ukrainian State itself, but a nation of
        many millions of people, the vast majority of whom do not want any
        negotiations whatsoever with the invader until he withdraws his forces
        from the occupied lands of Ukraine."
      </h3>
      <div class="triangle"></div>
      <h4>{countries[34].name}</h4>
      <img src={getFlagUrl("Poland")} alt="Flag of Poland" />
    </li>
  </ul>
  <img
    src="./visual-bottomright.png"
    aria-hidden="true"
    alt="visual-bottom right"
  />
  <img
    src="./visual-bottomright.png"
    aria-hidden="true"
    alt="visual-bottom right"
  />
</section>
