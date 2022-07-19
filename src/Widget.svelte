<script>
  import { getStamps, getStampCount, hasStamped, stamp } from './lib/passport.js'
  import Modal from './components/modal.svelte'
  
  let contractId = null
  let addr = null 
  let count = 'N/A'
  let detailsDialog = false
  let alreadyStamped = true
  let stampingDialog = false
  let stamps = []

  const [STAMPS, MY_PASSPORT, MY_POINTS] = ['stamps', 'my_passport', 'my_points']
  let activeTab = STAMPS
  
  // states
  const [NOT_CONNECTED, NO_CONTRACT_FOUND, CONNECTED_NO_POAP, ALREADY_POAPED, LOADING] = 
   ['not_connected', 'no_contract_found', 'connected_no_poap', 'already_poaped', 'Loading...']
  
  let state = !contractId ? NO_CONTRACT_FOUND : NOT_CONNECTED

  window.addEventListener('pageTransactionIdLoaded', async () => {
    contractId = window.transactionId 
    state = NOT_CONNECTED
    //count = await getStampCount(contractId)
    stamps = await getStamps(contractId)
    count = stamps.length

  })

  window.addEventListener('arweaveWalletConnected', async () => {
    addr = await arweaveWallet.getActiveAddress()
    // check if POAPED!
    state = CONNECTED_NO_POAP
    
    if (await hasStamped(contractId, addr)) {
      state = ALREADY_POAPED
    } else {
      alreadyStamped = false
    }
  })

  window.addEventListener('arweaveWalletDisconnected', () => {
    // check if POAPED!
    state = NOT_CONNECTED
  })

  function equals(x, y) {
    return x === y
  }

  async function doStamp() {
    alreadyStamped = true
    stampingDialog = true 
    // need the address and contract and call mint 
    await stamp(contractId) 
    if (await hasStamped(contractId, addr)) {
      state = ALREADY_POAPED
    }
    count = await getStampCount(contractId)
    stampingDialog = false
  }

  function changeTab(tab) {
    activeTab = tab 
  }
</script>
<div class="p-16">
  <div class="stats bg-primary text-primary-content">
    
    <div class="stat">
      {#if equals(state, LOADING)}
        <div class="stat-value text-center">XX</div>
        <div class="stat-desc">Loading...</div>
        <button class="mt-4 btn btn-sm" disabled={true}>Stamp</button>
        <button class="mt-4 btn btn-sm btn-info">Learn More</button>
      {:else if equals(state, NOT_CONNECTED)}
        <div class="stat-value text-center">{count}</div>
        <div class="stat-desc">Not Connected</div>
        <button class="mt-4 btn btn-sm" disabled={true}>Stamp</button>
        <button class="mt-4 btn btn-sm btn-info">Learn More</button>
      {:else if equals(state, NO_CONTRACT_FOUND)}
        <div class="stat-value text-center">{count}</div>
        <div class="stat-desc">Not Found</div>
        <button class="mt-4 btn btn-sm" disabled={true}>Stamp</button>
        <button class="mt-4 btn btn-sm btn-info">Learn More</button>
      {:else if equals(state, CONNECTED_NO_POAP)}
        <div class="stat-value text-center">{count}</div>
        <div class="stat-desc">Passports Stamped</div>
        <button class="mt-4 btn btn-sm" disabled={alreadyStamped} on:click={doStamp}>Stamp</button>
        <button class="mt-4 btn btn-sm btn-info" on:click={() => detailsDialog = true}>Details</button>
      {:else if equals(state, ALREADY_POAPED)}
        <div class="stat-value text-center">{count}</div>
        <div class="stat-desc">Passports Stamped</div>
        <button class="mt-4 btn btn-sm" disabled={true}>Stamp</button>
        <button class="mt-4 btn btn-sm btn-info" on:click={() => detailsDialog = true}>Details</button>
      {/if}
    </div>
  </div>
</div>
<Modal open={detailsDialog} on:click={() => detailsDialog = false}>
  <h3 class="text-lg">Details</h3>
  <div class="mt-4 tabs">
    <button class="tab" on:click={() => changeTab(STAMPS) }>Stamps</button>
    <!--
    <button class="tab" on:click={() => changeTab(MY_PASSPORT) }>My Passport</button>
    <button class="tab" on:click={() => changeTab(MY_POINTS) }>My Points</button>
    -->
  </div>
  {#if equals(activeTab, STAMPS)}
    {#each stamps as stamp}
      <div>{stamp}</div>
    {/each}
  {/if}
</Modal>
<Modal open={stampingDialog} ok={false}>
  <h3 class="text-lg text-center">Stamping Passport</h3>
</Modal>