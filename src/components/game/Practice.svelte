<script lang="ts">
  import { type Exercise } from "@/lib/exercise";
  import { onMount } from "svelte";
  import { onDestroy } from "svelte";
  import ExerciseWidget from "@/components/game/Exercise.svelte";

  export let exercises: Exercise[];
  export let locale: Record<string, string>;

  let enterCallbacks = [];
  // This is to enable the user to check/continue chips and exercises
  // We do it in here because each individual exercise is not aware of whether it's active (focused)
  function handleEnterKeyPress(e) {
    if (e.key != "Enter") return;

    let callback = enterCallbacks[activeIndex];
    if (!callback) return;
    callback();
  }

  function setEnterCallback(index: number, callback: () => void) {
    enterCallbacks[index] = callback;
  }

  onMount(() => {
    window.addEventListener("keypress", handleEnterKeyPress);
  });

  onDestroy(() => {
    window.removeEventListener("keypress", handleEnterKeyPress);
  });

  let activeIndex = 0;
  const setActiveTab = (index: number) => {
    activeIndex = index;
  };
</script>

<div class="tabbed-box">
  <!-- Tab buttons -->
  {#if exercises.length > 1}
    <div class="tabbed-selector" style={`--cols:${exercises.length}`}>
      {#each exercises as exercise, i}
        <button
          class:active={i === activeIndex}
          on:click={() => setActiveTab(i)}
        >
          {exercise.title}
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
          enterCallbackSetter={(callback) => setEnterCallback(i, callback)}
        />
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
  button:not(.active):hover {
    background-color: var(--bg-2);
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
