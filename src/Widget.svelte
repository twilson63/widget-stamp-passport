<script>
  import { getPassports, getStampCount, hasStamped, stamp } from './lib/passport.js'
  import Modal from './components/modal.svelte'

  let contractId = null
  let addr = null 
  let count = 'N/A'
  let detailsDialog = false
  
  // states
  const [NOT_CONNECTED, NO_CONTRACT_FOUND, CONNECTED_NO_POAP, ALREADY_POAPED, LOADING] = 
   ['not_connected', 'no_contract_found', 'connected_no_poap', 'already_poaped', 'Loading...']
  
  let state = !contractId ? NO_CONTRACT_FOUND : NOT_CONNECTED

  /*
  const arweave = window.Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
  })

  const warp = window.warp.WarpWebFactory.memCached(arweave)
  const contract = warp(contractId)
  */
  window.addEventListener('pageTransactionIdLoaded', async () => {
    contractId = window.transactionId 
    state = NOT_CONNECTED
    count = await getStampCount(contractId)
  })

  window.addEventListener('arweaveWalletConnected', async () => {
    addr = await arweaveWallet.getActiveAddress()
    // check if POAPED!
    state = CONNECTED_NO_POAP
    
    if (await hasStamped(contractId, addr)) {
      state = ALREADY_POAPED
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
    // need the address and contract and call mint 
    await stamp(contractId) 
    if (await hasStamped(contractId, addr)) {
      state = ALREADY_POAPED
    }
    count = await getStampCount(contractId)
  }
</script>
<div class="p-16">
  <div class="stats bg-primary text-primary-content">
    
    <div class="stat">
      {#if equals(state, LOADING)}
        
        <div class="stat-value">XX</div>
        <div class="stat-desc">Loading...</div>
      {:else if equals(state, NOT_CONNECTED)}
        
        <div class="stat-value">{count}</div>
        <div class="stat-desc">Not Connected</div>
      {:else if equals(state, NO_CONTRACT_FOUND)}
       
        <div class="stat-value">{count}</div>
        <div class="stat-desc">Passport Contract not found!</div>
      {:else if equals(state, CONNECTED_NO_POAP)}
        
        <div class="stat-value">{count}</div>
        <div class="stat-desc">Passports Stamped</div>
        <button class="mt-4 btn btn-sm" on:click={doStamp}>Stamp</button>
        <button class="mt-4 btn btn-sm btn-info" on:click={() => detailsDialog = true}>View Details</button>
      {:else if equals(state, ALREADY_POAPED)}
       
        <div class="stat-value">{count}</div>
        <div class="stat-desc">Passports Stamped</div>
        <button class="mt-4 btn btn-sm btn-info" on:click={() => detailsDialog = true}>View Details</button>
      {/if}
    </div>
  </div>
</div>
<Modal open={detailsDialog} on:click={() => detailsDialog = false}>
  <h3>Details</h3>
  <div class="tabs">
    <a class="tab">Passports Stamped</a>
    <a class="tab">My Passport View</a>
  </div>
</Modal>