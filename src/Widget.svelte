<script>
  let contractId = null
  let count = 0
  
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
  window.addEventListener('pageTransactionIdLoaded', () => {
    contractId = window.transactionId 
    state = NOT_CONNECTED
  })

  window.addEventListener('arweaveWalletConnected', () => {
    // check if POAPED!
    state = CONNECTED_NO_POAP
  })

  window.addEventListener('arweaveWalletDisconnected', () => {
    // check if POAPED!
    state = NOT_CONNECTED
  })

  function equals(x, y) {
    return x === y
  }
</script>
<div class="p-16">
  <div class="stats bg-primary text-primary-content">
    
    <div class="stat">
      {#if equals(state, LOADING)}
        <div class="stat-title">PoAP</div>
        <div class="stat-value">XX</div>
        <div class="stat-desc">Loading...</div>
      {:else if equals(state, NOT_CONNECTED)}
        <div class="stat-title">PoAP</div>
        <div class="stat-value">XX</div>
        <div class="stat-desc">Not Connected</div>
      {:else if equals(state, NO_CONTRACT_FOUND)}
        <div class="stat-title">PoAP</div>
        <div class="stat-value">XX</div>
        <div class="stat-desc">PoAP Contract not found!</div>
      {:else if equals(state, CONNECTED_NO_POAP)}
        <div class="stat-title">PoAP</div>
        <div class="stat-value">{count}</div>
        <div class="stat-desc">Number of PoAPs</div>
        <button class="mt-4 btn btn-sm" on:click={() => null}>PoAP</button>
        <button class="mt-4 btn btn-sm btn-info">View Stats</button>
      {/if}
    </div>
  </div>
</div>