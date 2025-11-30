<script lang="ts">
  import { onMount } from "svelte";
  import ChipTask from "@/components/game/ChipTask.svelte";
  import { KALAMA } from "@/lib/audio";
  import { verifyChips, type Task } from "@/lib/exercise";

  export let tasks: Task[];
  export let locale: Record<string, string>;

  const _ = (text: string) => locale[text];

  let isMounted = false;
  let taskQueue: Task[] = [...tasks];
  let currentIndex = 0;
  let completed = 0;
  let assembledSentence: string[] = [];
  let statusMessage: string | null = null;
  let checked = false;
  let allDone = false;

  let sfx_yes: HTMLAudioElement | null = null;
  let sfx_no: HTMLAudioElement | null = null;
  let sfx_done: HTMLAudioElement | null = null;

  let currentTask: Task;

  onMount(() => {
    isMounted = true;
    if (typeof Audio !== "undefined") {
      sfx_yes = new Audio(`${KALAMA}/sfx/yes.mp3`);
      sfx_no = new Audio(`${KALAMA}/sfx/no.mp3`);
      sfx_done = new Audio(`${KALAMA}/sfx/done.mp3`);
    }
  });

  $: currentTask = taskQueue[currentIndex];

  function handleCheck() {
    completed += 1;

    if (verifyChips(currentTask, assembledSentence)) {
      statusMessage = _("correct");
      sfx_yes?.play();
    } else {
      statusMessage = `${_("incorrect")} "${currentTask.l2}"`;
      taskQueue = [...taskQueue, taskQueue[currentIndex]];
      sfx_no?.play();
    }

    checked = true;
  }

  function handleContinue() {
    if (currentIndex < taskQueue.length - 1) {
      currentIndex += 1;
      assembledSentence = [];
      statusMessage = null;
      checked = false;
    } else {
      allDone = true;
      sfx_done?.play();
    }
  }
</script>

{#if isMounted}
  <div class="exercise">
    <div class="progress-container">
      <div
        class="progress"
        style="width: {(completed / taskQueue.length) * 100}%"
      ></div>
    </div>

    {#if allDone}
      <h2>{_("done")}</h2>
    {:else}
      <h2>{_("translate")}</h2>
      <h3>{currentTask.l1}</h3>

      <ChipTask
        task={currentTask}
        setAssembledSentence={(words: string[]) => (assembledSentence = words)}
        locked={checked}
      />

      <div class="footer">
        <button
          on:click={checked ? handleContinue : handleCheck}
          class="button"
        >
          {checked ? _("continue") : _("check")}
        </button>
        {#if statusMessage}
          <p>{statusMessage}</p>
        {/if}
      </div>
    {/if}
  </div>
{:else}
  <noscript>
    This interactive practice game needs Javascript to run, sorry!
  </noscript>
{/if}

<style>
  .exercise {
    padding: 20px 10px;
    /* max-width: 600px; */
    margin: auto;
  }
  .progress-container {
    height: 20px;
    border: 1px solid var(--grey);
    background-color: var(--bg-2);
    border-radius: 10px;
  }
  .progress {
    height: 20px;
    border-radius: 10px;
    background-color: var(--accent);
    transition: width 0.5s ease;
  }
  .footer {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .footer p {
    margin: 0;
  }
  .button {
    display: inline-block;
    background-color: var(--bg-1);
    padding: 10px 17px;
    border-radius: 15px;
    border: 1px solid var(--grey-1);
    box-shadow: 0px 2px var(--grey-1);
    margin: 4px;
    cursor: pointer;
    user-select: none;
    font-size: 120%;
    font-family: inherit;
    min-width: 20%;
    flex-shrink: 0;
  }
</style>
