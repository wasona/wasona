<script lang="ts">
  import { onMount } from "svelte";
  import { tokeniseSentence, type Task } from "@/lib/exercise";
  import { KALAMA } from "@/lib/audio";

  export let task: Task;
  export let locked: boolean;
  export let setAssembledSentence: (words: string[]) => void;
  export let setKeyCallback: (callback: (e: Event) => void) => void;

  let input = "";

  function getInputCandidates(input: string) {
    input = input.toLowerCase();

    let pairs = unused.map(i => [words[i], i])
    let uniqueWords = [];
    let uniqueWordsIndexes = [];

    for (const i of pairs) {
      if (uniqueWords.includes(i[0])) continue;

      uniqueWords.push(i[0]);
      uniqueWordsIndexes.push(i[1]);
    }

    // If there are several words and on of them starts with another (like `lili` and `li`),
    // the user can use space to choose the short one (`li` in this example)
    if (input.endsWith(' '))
      return uniqueWordsIndexes.filter(i => words[i].toLowerCase() == input.slice(0, -1));

    return uniqueWordsIndexes.filter(i => words[i].toLowerCase().startsWith(input));
  }

  function handleKeyInput(e: Event) {
    if (locked) return;
    if (e.key == " ") e.preventDefault(); // It scrolls by default

    if (e.key === "Backspace") {
      if (input == "") {
        // Removes the last added word
        let indexToRemove = assembled.at(-1);
        if (indexToRemove == undefined) return;
        addUnused(indexToRemove);
        return;
      }

      input = input.slice(0, -1);
      return;
    }

    if (e.key.length !== 1) return; // In this case, it must be something non-printable

    let candidates = getInputCandidates(input + e.key);

    if (candidates.length === 0) return;

    if (e.key == " ") {
      if (candidates.length !== 1) return;
      addAssembled(candidates[0]); // It's up to addAssembled to clear the input
      return;
    }

    else input += e.key;
  }

  onMount(() => {
    input = "";
    setKeyCallback(handleKeyInput);
  });

  let words: string[] = [];
  let assembled: number[] = [];

  // Derived indices of unused words
  $: unused = words.map((_, i) => i).filter((i) => !assembled.includes(i));

  // Shuffle helper
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function appended(array: number[], element: number): number[] {
    return [...array, element];
  }

  function inserted(array: number[], element: number, at: number): number[] {
    const arr = [...array];
    arr.splice(at, 0, element);
    return arr;
  }

  function without(array: number[], element: number): number[] {
    return array.filter((c) => c !== element);
  }

  function play(word: string) {
    const audio = document.getElementById(`audio-${word}`);
    if (audio instanceof HTMLAudioElement) audio.play();
  }

  function audioLink(word: string) {
    word = word.replaceAll(/[\.,\?\!\:]/g, "");
    const dir = word === word.toLowerCase() ? "words" : "names";
    return `${KALAMA}/jan-lakuse/${dir}/${word}.mp3`;
  }

  // Initialize on exercise change
  $: (() => {
    input = "";
    let tokens = tokeniseSentence(task.l2);
    if (task.junkChips) tokens = [...tokens, ...task.junkChips];
    words = shuffleArray(tokens);
    assembled = [];
  })();

  // Emit assembled sentence changes
  $: setAssembledSentence(assembled.map((i) => words[i]));

  function addUnused(chip: number) {
    if (locked) return;
    assembled = without(assembled, chip);
    play(words[chip]);
  }

  function addAssembled(chip: number) {
    if (locked) return;
    input = "";
    assembled = appended(without(assembled, chip), chip);
    play(words[chip]);
  }

  function insertAssembled(chip: number, at: number) {
    if (locked) return;
    assembled = inserted(without(assembled, chip), chip, at);
    play(words[chip]);
  }

  function onDragStart(
    e: DragEvent,
    idx: number,
    from: "unused" | "assembled",
  ) {
    e.dataTransfer?.setData("id", `${idx}`);
    e.dataTransfer?.setData("from", from);
  }

  function onDropAt(e: DragEvent, at: number) {
    e.preventDefault();
    const idx = parseInt(e.dataTransfer?.getData("id") || "0");
    insertAssembled(idx, at);
  }

  function onDropAssembled(e: DragEvent) {
    e.preventDefault();
    const idx = parseInt(e.dataTransfer?.getData("id") || "0");
    const from = e.dataTransfer?.getData("from");
    if (from === "unused") addAssembled(idx);
  }

  function onDropUnused(e: DragEvent) {
    e.preventDefault();
    const idx = parseInt(e.dataTransfer?.getData("id") || "0");
    const from = e.dataTransfer?.getData("from");
    if (from === "assembled") addUnused(idx);
  }
</script>

<div dir="ltr">
  <!-- Hidden audio elements -->
  <div style="display: none;">
    {#each [...new Set(words)] as word}
      <audio id={"audio-" + word} preload="auto" src={audioLink(word)}></audio>
    {/each}
  </div>

  <!-- Assembled chips -->
  <div class="assembled" on:dragover|preventDefault on:drop={onDropAssembled}>
    {#each assembled as idx, i}
      <button
        class="chip"
        draggable="true"
        on:dragstart={(e) => onDragStart(e, idx, "assembled")}
        on:drop={(e) => onDropAt(e, i)}
        on:click={() => addUnused(idx)}
      >
        {words[idx]}
      </button>
    {/each}
  </div>

  <!-- Unused chips -->
  <div class="unused" on:dragover|preventDefault on:drop={onDropUnused}>
    {#each words as word, i}
      {#if unused.includes(i)}
        <button
          class="chip"
          draggable="true"
          on:dragstart={(e) => onDragStart(e, i, "unused")}
          on:click={() => addAssembled(i)}
        >
          {#if word.toLowerCase() == input.toLowerCase()}
            <span class="inputmatch">{word}</span>
          {:else if word.toLowerCase().startsWith(input.toLowerCase())}
            <!-- The reason we use use the slice of word, and not input is because input may be miscapitalised -->
            <span class="inputprefix">{word.slice(0, input.length)}</span>{word.slice(input.length)}
          {:else}
            {word}
          {/if}
        </button>
      {:else}
        <button class="chip hidden">{word}</button>
      {/if}
    {/each}
  </div>
</div>

<style>
  .assembled {
    min-height: 60px;
    /* border: 1px dashed #ccc; */
    padding: 10px;
    margin-bottom: 20px;
    /* border-radius: 8px; */
    border-top: 2px dotted var(--grey);
    border-bottom: 2px dotted var(--grey);
  }
  .unused {
    min-height: 60px;
    /* border: 1px dashed #ccc; */
    padding: 10px;
    border-radius: 8px;
    text-align: center;
    max-width: 500px;
    margin: auto;
  }

  .chip {
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
    transition: translate 0s;
  }
  .chip:not(.hidden):active {
    box-shadow: 0 0;
    transform: translate(0, 2px);
  }
  .hidden {
    cursor: initial;
    color: var(--grey-1);
    background-color: var(--grey-1);
  }
</style>
