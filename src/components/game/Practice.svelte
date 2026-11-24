<script lang="ts">
  import { type Exercise } from "@/lib/exercise";
  import { onMount } from "svelte";
  import { onDestroy } from "svelte";
  import ExerciseWidget from "@/components/game/Exercise.svelte";

  export let exercises: Exercise[];
  export let locale: Record<string, string>;

  let keyCallbacks = [];
  // This is to enable the user to use keys for exercises
  // We do it in here because each individual exercise is not aware of whether it's active (focused)
  function redirectKeyPress(e) {
    let callback = keyCallbacks[activeIndex];
    if (!callback) return;
    callback(e);
  }

  function setKeyCallback(index: number, callback: (e: Event) => void) {
    keyCallbacks[index] = callback;
  }

  onMount(() => {
    window.addEventListener("keydown", redirectKeyPress);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", redirectKeyPress);
  });

  let activeIndex = 0;
  const setActiveTab = (index: number) => {
    activeIndex = index;
  };
</script>

<div class="tabbed-box">
  <!-- Tab buttons -->
  {#if exercises.length > 1}
    <div
      class="tabbed-selector"
      style={`--cols:${exercises.length};--active-index:${activeIndex}`}
    >
      {#each exercises as exercise, i}
        <button
          class:active={i === activeIndex}
          on:click={() => setActiveTab(i)}
        >
          <span>{exercise.title}</span>
        </button>
      {/each}
    </div>
  {/if}

  <!-- Tab contents -->
  <div class="tab-content">
    {#each exercises as exercise, i}
      <div class="tab" class:active={i === activeIndex}>
        <ExerciseWidget
          tasks={exercise.tasks}
          {locale}
          nextTab={i + 1 < exercises.length ? () => setActiveTab(i + 1) : null}
          setKeyCallback={(callback) => setKeyCallback(i, callback)}
        />
      </div>
    {/each}
  </div>
</div>

<style>
  .tabbed-selector {
    display: grid;
    position: sticky;
    isolation: isolate;
    top: 0;
    grid-template-columns: repeat(var(--cols), 1fr);
    border-bottom: 1px solid var(--grey);
    background-color: var(--bg-1);
  }
  .tabbed-selector::before {
    content: "";
    position: absolute;
    inset-block-start: 0;
    inset-block-end: -1px;
    inset-inline-start: 0;
    width: calc(100% / var(--cols));
    box-sizing: border-box;
    border: 1px solid var(--grey);
    border-bottom-color: var(--bg);
    background-color: var(--bg);
    z-index: 1;
    pointer-events: none;
    transform: translateX(calc(var(--active-index) * 100%));
    transition:
      transform 0.15s ease-out,
      background-color 0.2s,
      border-color 0.2s;
  }
  .tabbed-selector:dir(rtl)::before {
    transform: translateX(calc(var(--active-index) * -100%));
  }
  button {
    position: relative;
    padding: 10px;
    border: 1px solid transparent;
    font-family: inherit;
    font-size: inherit;
    color: var(--grey);
    background-color: transparent;
  }
  button span {
    position: relative;
    z-index: 2;
  }
  button.active {
    color: var(--txt);
  }
  button:not(.active):hover {
    background-color: var(--bg-2);
  }
  @media (prefers-reduced-motion: reduce) {
    .tabbed-selector::before {
      transition:
        background-color 0.2s,
        border-color 0.2s;
    }
  }
  .tab-content {
    padding: 10px;
    /* background-color: var(--bg-1); */
    /*border-left: 2px dotted var(--grey);*/
    /*border-right: 2px dotted var(--grey);*/
  }
  .tab {
    display: none;
  }
  .tab.active {
    display: initial;
  }
</style>
