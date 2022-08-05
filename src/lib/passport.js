import map from 'ramda/src/map'
import take from 'ramda/src/take'

let defaultAvatar = 'https://social-icons.arweave.dev/avatar.svg'

const arweave = window.Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

window.warp.LoggerFactory.INST.logLevel('error')
const STAMPCOIN = '9nDWI3eHrMQbrfs9j8_YPfLbYJmBodgn7cBCG8bii4o'
const warp = window.warp.WarpWebFactory.memCached(arweave)

export const hasStamped = async (txId, addr) => {
  const { state } = await warp.contract(STAMPCOIN)
    .setEvaluationOptions({
      allowUnsafeClient: true
    })
    .readState()
  return Object.values(state.stamps).find(s => s.address === addr) ? true : false
}

export const stamp = async (txId) => {
  return warp.contract(STAMPCOIN).connect('use_wallet')
    .bundleInteraction({
      function: 'stamp',
      transactionId: txId
    })
}

// get stamp count
export const getStampCount = async (txId) => {
  const contract = warp.contract(STAMPCOIN)
  const { state } = await contract.setEvaluationOptions({
    allowUnsafeClient: true
  }).readState()
  console.log(state)
  return Object.values(state.stamps).filter(s => s.asset === txId).length
}

// get passport most recent 100
export const getStamps = async (txId) => {
  const contract = warp.contract(txId)
  const { state } = await contract.readState()
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