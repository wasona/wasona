<script lang="ts">
  import { onMount } from "svelte";
  import { encode } from "@/lib/ucsur";
  import { KALAMA } from "@/lib/audio";
  import type { Task } from "@/lib/exercise";

  export let task: Task;
  export let locked: boolean;
  export let setAssembledSentence: (words: string[]) => void;

  let isMounted = false;
  let options: string[] = [];
  let selected = "";

  let sfx_yes: HTMLAudioElement | null = null;
  let sfx_no: HTMLAudioElement | null = null;
  let sfx_done: HTMLAudioElement | null = null;

  // Emit assembled sentence changes
  $: setAssembledSentence([selected]);

  // Shuffle helper
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Initialize on exercise change
  $: (() => {
    let tokens = [task.l2];
    if (task.junkChips) tokens = [...tokens, ...task.junkChips];
    options = shuffleArray(tokens);
    selected = "";
  })();

  onMount(() => {
    isMounted = true;
    if (typeof Audio !== "undefined") {
      sfx_yes = new Audio(`${KALAMA}/sfx/yes.mp3`);
      sfx_no = new Audio(`${KALAMA}/sfx/no.mp3`);
      sfx_done = new Audio(`${KALAMA}/sfx/done.mp3`);
    }
  });

  function audioLink(word: string) {
    word = word.replaceAll(/[\.,\?\!\:]/g, "");
    const dir = word === word.toLowerCase() ? "words" : "names";
    return `${KALAMA}/jan-lakuse/${dir}/${word}.mp3`;
  }

  function play(word: string) {
    const audio = document.getElementById(`audio-${word}`);
    if (audio instanceof HTMLAudioElement) audio.play();
  }

  function selectOption(option: string) {
    if (locked) return;
    selected = option;
    play(option);
  }
</script>

<div class="container">
  {#each options as option}
    <audio id={"audio-" + option} preload="auto" src={audioLink(option)}
    ></audio>
    {#if selected != option}
      <button class="chip" on:click={() => selectOption(option)}>
        <span class="sitelenpona">{encode(option)}</span>
        <br />
        {option}
      </button>
    {:else}
      <button class="selected chip" on:click={() => selectOption(option)}>
        <span class="sitelenpona">{encode(option)}</span>
        <br />
        {option}
      </button>
    {/if}
  {/each}
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    text-align: center;
    max-width: 500px;
    margin: auto;
  }
  .chip {
    display: inline-block;
    background-color: var(--bg-1);
    padding: 10px 17px;
    border-radius: 15px;
    border: 2px solid var(--grey-1);
    box-shadow: 0px 2px var(--grey-1);
    margin: 4px;
    cursor: pointer;
    user-select: none;
    font-size: 120%;
    font-family: inherit;
    transition: translate 0s;
  }
  .chip:not(.selected):hover {
    background-color: var(--bg-2);
  }
  .chip:not(.selected):active {
    box-shadow: 0 0;
    transform: translate(0, 2px);
  }
  .chip .sitelenpona {
    /*font-weight: 700;*/
    font-size: 200%;
    line-height: 1.5;
  }
  .selected {
    /*background-color: var(--accent-bg);*/
    border-color: var(--accent);
    box-shadow: 0px 2px var(--accent);
    color: var(--accent);
  }
</style>
