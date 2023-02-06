<script>
  import { getStampCount, hasStamped, stamp } from "./lib/passport.js";
  import Modal from "./components/modal.svelte";
  import Logo from "./components/logo.svelte";
  import Connect from "./dialogs/connect.svelte";

  export let asset = null;
  // export let code = null;
  // export let author = null;

  let url = "https://now.arweave.dev";

  let addr = null;
  let count = "N/A";
  let alreadyStamped = false;
  let stampingDialog = false;
  let notVouchedDialog = false;
  let alreadyStampedDialog = false;
  let showConnect = false;

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

  let state = !asset ? NO_CONTRACT_FOUND : NOT_CONNECTED;

  if (asset) {
    getStampCount(asset).then((c) => (count = c));
  } else {
    fetch(window.location.href)
      .then(
        (res) =>
          res.headers.get("x-arns-resolved-id") ||
          window.location.pathname.split("/")[1]
      )
      .then((a) => ((asset = a), a))
      .then((x) => (console.log("asset:", x), x))
      .then(getStampCount)
      .then((c) => (count = c))
      .catch((e) => (count = 0))
      .then(() => {
        state = NOT_CONNECTED;
      });
  }

  // window.addEventListener("pageTransactionIdLoaded", async () => {
  //   asset = window.transactionId;
  //   state = CONNECTED_NO_POAP;
  //   count = await getStampCount(asset);
  // });

  const connected = async () => {
    addr = await arweaveWallet.getActiveAddress();
    // check if POAPED!
    state = CONNECTED_NO_POAP;
    console.log({ addr, asset });
    if (await hasStamped(asset, addr)) {
      state = ALREADY_POAPED;
      alreadyStampedDialog = true;
    } else {
      doStamp();
      //alreadyStamped = false;
    }
  };

  window.addEventListener("arweaveWalletDisconnected", () => {
    // check if POAPED!
    state = NOT_CONNECTED;
  });

  function equals(x, y) {
    return x === y;
  }

  async function doStamp() {
    alreadyStamped = true;
    if (!addr) {
      //const e = new Event("walletConnect");
      //window.dispatchEvent(e);
      showConnect = true;
      return;
    }

    if (await hasStamped(asset, addr)) {
      alreadyStampedDialog = true;
      return;
    }

    stampingDialog = true;
    try {
      await stamp(asset);
      state = ALREADY_POAPED;

      // need to wait some time here before checking...
      count = await getStampCount(asset);
      stampingDialog = false;
    } catch (e) {
      state = ALREADY_POAPED;
      stampingDialog = false;
    }
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
          >Whats Hot</a
        >
      {:else if equals(state, NOT_CONNECTED)}
        <div class="stat-value text-center">{count}</div>
        <div class="stat-desc">Not Connected</div>
        <button class="mt-4 btn btn-sm" on:click={doStamp}>Stamp</button>
        <a href={url} target="_blank" class="mt-4 btn btn-sm btn-info"
          >Whats Hot</a
        >
      {:else if equals(state, NO_CONTRACT_FOUND)}
        <div class="stat-value text-center">{count}</div>
        <div class="stat-desc">Not Found</div>
        <button class="mt-4 btn btn-sm" disabled={true}>Stamp</button>

        <a href={url} target="_blank" class="mt-4 btn btn-sm btn-info"
          >Whats Hot</a
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
          >Whats Hot</a
        >
        <!--
        <button class="mt-4 btn btn-sm btn-info" on:click={() => detailsDialog = true}>Details</button>
        -->
      {:else if equals(state, ALREADY_POAPED)}
        <div class="stat-value text-center">{count}</div>
        <div class="stat-desc">Passports Stamped</div>
        <button class="mt-4 btn btn-sm" disabled={true}>Stamp</button>
        <a href={url} target="_blank" class="mt-4 btn btn-sm btn-info"
          >Whats Hot</a
        >
        <!--
        <button class="mt-4 btn btn-sm btn-info" on:click={() => detailsDialog = true}>Details</button>
        -->
      {/if}
    </div>
  </div>
</div>

<Modal open={stampingDialog} ok={false} cancel={false}>
  <h3 class="text-lg text-center">Stamping Passport</h3>
</Modal>
<Modal open={notVouchedDialog} ok={false}>
  <h3 class="text-2xl font-bold">Get Vouched</h3>
  <p class="my-8 text-lg">
    In order to stamp in the Web of Value, you need to get Vouched by a service
    from VouchDAO
  </p>
  <div class="w-full flex justify-center">
    <a
      href="https://vouchdao.xyz"
      target="_blank"
      class="btn btn-secondary"
      on:click={() => {
        notVouchedDialog = false;
        state = CONNECTED_NO_POAP;
      }}>Go to VouchDAO</a
    >
  </div>
</Modal>

<Modal
  open={alreadyStampedDialog}
  on:cancel={() => (alreadyStampedDialog = false)}
>
  <h3 class="text-2xl font-bold">Already Stamped</h3>
  <p class="my-8 text-lg">Looks like you have already stamped this page!</p>
</Modal>
<Connect bind:open={showConnect} on:connected={connected} />
