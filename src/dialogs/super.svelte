<script>
  import { createEventDispatcher } from "svelte";
  import Modal from "../components/modal.svelte";

  export let open;
</script>
<Modal
  bind:open
  bgColor="bg-white"
  border="border-4 border-[#929292]"
  cancel={true}
  on:cancel={() => (open = false)}
>
  <div data-theme="light" class="px-[36px] py-[24px] flex flex-col space-y-8">
    <h1>Super Stamp</h1>
    <p>
      Balance: {0}
    </p>
    <div class="form-control">
      <label class="label">Amount:</label>
      <input type="text" />
    </div>
    <button
      class="btn btn-block rounded-full hover:bg-gray-400"
      on:click={super}>STAMP</button
    >

  </div>
</Modal>