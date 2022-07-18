import map from 'ramda/src/map'
import take from 'ramda/src/take'

const arweave = window.Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

const warp = window.warp.WarpWebFactory.memCached(arweave)

// get poap count
export const getPOAPCount = async (txId) => {
  const contract = warp.contract(txId)
  const { state } = await contract.readState()
  return Object.keys(state.balances).length
}

// get poap vistors most recent 100
export const getPOAPVisitors = async (txId) => {
  const contract = warp.contract(txId)
  const { state } = await contract.readState()
  const profiles = await Promise.all(
    map(getProfile, take(100, Object.keys(state.balances)))
  )

}

// get poap pages by visitor most recent 100


async function getProfile(addr) {
  // get profile
  return arweave.api.post('graphql', { query: `
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
    .then(({data}) => data.data.transactions.edges[0].node.tags.find(({name}) => name === 'Profile-Title').value )

    

}