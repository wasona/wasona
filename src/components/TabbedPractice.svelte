<script lang="ts">
  import { type Exercise } from "@/lib/exercise";
  import PracticeSvelte from "@/components/Practice.svelte";

  export let exercises: Exercise[];
  export let locale: Record<string, string>;

  let activeIndex = 0;
  const setActiveTab = (index: number) => {
    activeIndex = index;
  };
</script>

<div class="tabbed-box">
  <!-- Tab buttons -->
  <div class="tabbed-selector" style={`--cols:${exercises.length}`}>
    {#each exercises as exercise, i}
      <button class:active={i === activeIndex} on:click={() => setActiveTab(i)}>
        {exercise.title}
      </button>
    {/each}
  </div>

  <!-- Tab contents -->
  <div class="tab-content">
    {#each exercises as exercise, i}
      <div class="tab" class:active={i === activeIndex}>
        <PracticeSvelte exercises={exercise.tasks} {locale} />
      </div>
    {/each}
  </div>
</div>

<style>
  .tabbed-selector {
    display: grid;
    position: sticky;
    top: 0;
    grid-template-columns: repeat(var(--cols), 1fr);
  }
  button {
    padding: 10px;
    border: 0;
    font-family: inherit;
    font-size: inherit;
    color: var(--grey);
    background-color: var(--bg-1);
    border-bottom: 1px solid var(--grey);
    border-top: 1px solid var(--bg-1); /* this is just to freeze text in place */
    border-left: 1px solid var(--bg-1);
    border-right: 1px solid var(--bg-1);
    transition: background-color 0.1s ease-out;
  }
  button.active {
    color: var(--txt);
    border-bottom: 1px solid var(--bg);
    border-top: 1px solid var(--grey);
    border-left: 1px solid var(--grey);
    border-right: 1px solid var(--grey);
    background-color: var(--bg);
  }
  button:hover {
    background-color: var(--bg-2);
  }
  .tab-content {
    padding: 10px;
    /* background-color: var(--bg-1); */
    border-left: 2px dotted var(--grey);
    border-right: 2px dotted var(--grey);
  }
  .tab {
    display: none;
  }
  .tab.active {
    display: initial;
  }
</style>
