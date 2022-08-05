<script>
  import {
    getStamps,
    getStampCount,
    hasStamped,
    stamp,
  } from "./lib/passport.js";
  import Modal from "./components/modal.svelte";
  import Logo from "./components/logo.svelte";

  let url = "https://stamp.arweave.dev";
  let contractId = null;
  let addr = null;
  let count = "N/A";
  let alreadyStamped = true;
  let stampingDialog = false;
  let stamps = [];

  // states
  const [
    NOT_CONNECTED,
    NO_CONTRACT_FOUND,
    CONNECTED_NO_POAP,
    ALREADY_POAPED,
    LOADING,
  ] = [
    "not_connected",
    "no_contract_found",
    "connected_no_poap",
    "already_poaped",
    "Loading...",
  ];

  let state = !contractId ? NO_CONTRACT_FOUND : NOT_CONNECTED;

  window.addEventListener("pageTransactionIdLoaded", async () => {
    contractId = window.transactionId;
    state = NOT_CONNECTED;
    count = await getStampCount(contractId);
    //stamps = await getStamps(contractId);
    //count = stamps.length;
  });

  window.addEventListener("arweaveWalletConnected", async () => {
    addr = await arweaveWallet.getActiveAddress();
    // check if POAPED!
    state = CONNECTED_NO_POAP;

    if (await hasStamped(contractId, addr)) {
      state = ALREADY_POAPED;
    } else {
      alreadyStamped = false;
    }
  });

  window.addEventListener("arweaveWalletDisconnected", () => {
    // check if POAPED!
    state = NOT_CONNECTED;
  });

  function equals(x, y) {
    return x === y;
  }

  async function doStamp() {
    alreadyStamped = true;
    stampingDialog = true;
    // need the address and contract and call mint
    await stamp(contractId);
    if (await hasStamped(contractId, addr)) {
      state = ALREADY_POAPED;
    }
    // need to wait some time here before checking...
    count = await getStampCount(contractId);
    stampingDialog = false;
  }

  function changeTab(tab) {
    activeTab = tab;
  }
</script>

<div class="p-8">
  <div class="stats bg-primary text-primary-content">
    <div class="stat">
      <div class="stat-title">
        <Logo />
        Stamps
      </div>
      {#if equals(state, LOADING)}
        <div class="stat-value text-center">XX</div>
        <div class="stat-desc">Loading...</div>
        <button class="mt-4 btn btn-sm" disabled={true}>Stamp</button>
        <a href={url} target="_blank" class="mt-4 btn btn-sm btn-info"
          >Learn More</a
        >
      {:else if equals(state, NOT_CONNECTED)}
        <div class="stat-value text-center">{count}</div>
        <div class="stat-desc">Not Connected</div>
        <button class="mt-4 btn btn-sm" disabled={true}>Stamp</button>
        <a href={url} target="_blank" class="mt-4 btn btn-sm btn-info"
          >Learn More</a
        >
      {:else if equals(state, NO_CONTRACT_FOUND)}
        <div class="stat-value text-center">{count}</div>
        <div class="stat-desc">Not Found</div>
        <button class="mt-4 btn btn-sm" disabled={true}>Stamp</button>

        <a href={url} target="_blank" class="mt-4 btn btn-sm btn-info"
          >Learn More</a
        >
      {:else if equals(state, CONNECTED_NO_POAP)}
        <div class="stat-value text-center">{count}</div>
        <div class="stat-desc">Passports Stamped</div>
        <button
          class="mt-4 btn btn-sm"
          disabled={alreadyStamped}
          on:click={doStamp}>Stamp</button
        >
        <a href={url} target="_blank" class="mt-4 btn btn-sm btn-info"
          >Learn More</a
        >
        <!--
        <button class="mt-4 btn btn-sm btn-info" on:click={() => detailsDialog = true}>Details</button>
        -->
      {:else if equals(state, ALREADY_POAPED)}
        <div class="stat-value text-center">{count}</div>
        <div class="stat-desc">Passports Stamped</div>
        <button class="mt-4 btn btn-sm" disabled={true}>Stamp</button>
        <a href={url} target="_blank" class="mt-4 btn btn-sm btn-info"
          >Learn More</a
        >
        <!--
        <button class="mt-4 btn btn-sm btn-info" on:click={() => detailsDialog = true}>Details</button>
        -->
      {/if}
    </div>
  </div>
</div>

<Modal open={stampingDialog} ok={false}>
  <h3 class="text-lg text-center">Stamping Passport</h3>
</Modal>
