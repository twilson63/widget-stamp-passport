import map from 'ramda/src/map'
import take from 'ramda/src/take'

let defaultAvatar = 'https://social-icons.arweave.dev/avatar.svg'
let stamps = null

const arweave = window.Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

window.warp.LoggerFactory.INST.logLevel('error')
const CACHE = 'https://cache.permapages.app/aSMILD7cEJr93i7TAVzzMjtci_sGkXcWnqpDkG6UGcA'
const STAMPCOIN = 'aSMILD7cEJr93i7TAVzzMjtci_sGkXcWnqpDkG6UGcA'
const warp = window.warp.WarpWebFactory.memCached(arweave)

async function getState() {
  return await fetch(CACHE).then((res) => res.json())
    .catch(_ => warp.contract(STAMPCOIN)
      .setEvaluationOptions({
        allowUnsafeClient: true
      })
      .readState()
      .then(result => result.state)
    )
}

export const getAsset = async (author, code) => {
  const query = `
  query {
    transactions(owners: ["${author}"], 
      tags: [
        {name:"Type", values:["PermaWebPage", "page"]},
        {name: "Page-Code", values: ["${code}"]}
      ]
    ) {
      edges {
        node {
          id
        }
      }
    }
  }
    `
  const result = await arweave.api.post('graphql', {
    query
  })
  const nodes = result.data?.data?.transactions?.edges || []
  return nodes.length > 0 ? nodes[0].node.id : null

}

export const checkVouched = async (addr) => {
  const result = await arweave.api.post('graphql', {
    query: `
query {
  transactions(tags: {name: "Vouch-For", values: ["${addr}"]}) {
    edges {
      node {
        id
      }
    }
  }
}
  `})
  const nodes = result.data?.data?.transactions?.edges || []
  return nodes.length > 0 ? true : false
}

export const hasStamped = async (txId, addr) => {
  if (!stamps) {
    const state = await getState()
    stamps = Object.values(state.stamps).filter(s => s.asset === txId)
  }

  return stamps.find(s => (s.address === addr && s.asset === txId)) ? true : false
}

export const stamp = async (txId) => {
  return warp.contract(STAMPCOIN).connect('use_wallet')
    .bundleInteraction({
      function: 'stamp',
      transactionId: txId,
      timestamp: Date.now()
    })
}

// get stamp count
export const getStampCount = async (txId) => {
  const state = await getState()
  stamps = Object.values(state.stamps).filter(s => s.asset === txId)
  return stamps.length
}

// get passport most recent 100
export const getStamps = async (txId) => {
  const state = await getState()
  const profiles = await Promise.all(
    map(getProfile, take(100, Object.keys(state.balances)))
  )
  return profiles
  //return Object.keys(state.balances)
}

// get stamps for current visitor most recent 100


async function getProfile(addr) {
  // get profile
  return arweave.api.post('graphql', {
    query: `
query {
  transactions(first: 1, owners: ["${addr}"], tags: {name: "Protocol", values: ["PermaProfile-v0.1"]}) {
    edges {
      node {
        id
        tags {
          name
          value
        }
      }
    }
  }
}
  `})
    .then(({ data }) => {
      try {
        return data.data.transactions.edges[0].node.tags.find(({ name }) => name === 'Profile-Title')?.value
      } catch (e) {
        return {
          id: 0,
          name: 'unknown',
          avatar: defaultAvatar
        }
      }
    })



}