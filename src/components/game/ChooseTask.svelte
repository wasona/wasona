<script lang="ts">
  import { onMount } from "svelte";
  import { encode } from "@/lib/ucsur";
  import { KALAMA } from "@/lib/audio";
  import type { Task } from "@/lib/exercise";

  export let task: Task;
  export let locked: boolean;
  export let setAssembledSentence: (words: string[]) => void;
  export let setKeyCallback: (callback: (e: Event) => void) => void;

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

  let input = "";

  function getInputCandidates(input: string) {
    input = input.toLowerCase();

    // If there are several words and on of them starts with another (like `lili` and `li`),
    // the user can use space to choose the short one (`li` in this example)
    if (input.endsWith(' '))
      return options.filter(o => o.toLowerCase() == input.slice(0, -1));

    return options.filter(o => o.toLowerCase().startsWith(input));
  }

  function handleCharacterInput(e: Event) {
    if (e.key === "Backspace") input = input.slice(0, -1);

    if (e.key == " " && input != "") e.preventDefault(); // It scrolls by default
    if (e.key.length !== 1) return; // In this case, it must be something non-printable

    let candidates = getInputCandidates(input + e.key);

    if (candidates.length === 0) return;

    if (e.key == " ") {
      if (candidates.length !== 1) return;
      selectOption(candidates[0]); // It's up to selectOption to clear the input
      return;
    }

    input += e.key;
  }

  // Initialize on exercise change
  $: (() => {
    let tokens = [task.l2];
    if (task.junkChips) tokens = [...tokens, ...task.junkChips];
    options = shuffleArray(tokens);
    selected = "";
  })();

  function handleKeyInput(e) {
    if (locked) return;

    let optionNumber = Number(e.key);
    // We check if it's a space, because JS is dumb and `Number(' ')` returns 0
    if (Number.isNaN(optionNumber) || e.key == ' ') return handleCharacterInput(e);
    if (options[optionNumber - 1] === undefined) return;

    selectOption(options[optionNumber - 1]);
  }

  onMount(() => {
    setKeyCallback(handleKeyInput);
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
    input = "";
    selected = option;
    play(option);
  }
</script>

<div class="container">
  {#each options as option, index}
    <audio id={"audio-" + option} preload="auto" src={audioLink(option)}
    ></audio>
    {#if selected != option}
      <button class="chip" on:click={() => selectOption(option)}>
        <span class="chipnumber">
          {index + 1}
        </span>
        <span class="sitelenpona">{encode(option)}</span>
        <span>
          {#if option.toLowerCase() === input.toLowerCase()}
            <span class="inputmatch">{option}</span>
          {:else if option.toLowerCase().startsWith(input.toLowerCase())}
            <span class="inputprefix">{option.slice(0, input.length)}</span>{option.slice(input.length)}
          {:else}
            {option}
          {/if}
        </span>
      </button>
    {:else}
      <button class="selected chip" on:click={() => selectOption(option)}>
        <span class="chipnumber">{index + 1}</span>
        <span class="sitelenpona">{encode(option)}</span>
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
    display: inline-grid;
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

  .chipnumber {
    justify-self: left;
    font-size: 80%;
  }

  .chipnumber:not(.selected>.chipnumber) {
    color: grey;
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
