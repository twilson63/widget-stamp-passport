import map from 'ramda/src/map'
import take from 'ramda/src/take'

let defaultAvatar = 'https://social-icons.arweave.dev/avatar.svg'

const arweave = window.Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

window.warp.LoggerFactory.INST.logLevel('error')

const warp = window.warp.WarpWebFactory.memCached(arweave)

export const hasStamped = async (txId, addr) => {
  const {result} = await warp.contract(txId).viewState({
    function: 'balance',
    target: addr
  })
  console.log(result)
  return result.balance === 1 ? true : false 
}

export const stamp = async (txId) => {
  return warp.contract(txId).connect('use_wallet')
    .bundleInteraction({
      function: 'mint'
    })
}

// get stamp count
export const getStampCount = async (txId) => {
  const contract = warp.contract(txId)
  const { state } = await contract.readState()
  return Object.keys(state.balances).length
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
    .then(({data}) => {
      try {
        const node = data.data.transactions.edges[0].node
        const avatar = node.tags.find(({name}) => name === 'Profile-Avatar' )?.value || defaultAvatar
        return {
          id: node.id,
          name: node.tags.find(({name}) => name === 'Profile-Name')?.value,
          avatar
        }
      } catch (e) {
        return {
          id: 0,
          name: 'unknown',
          avatar: defaultAvatar
        }
      }
    })

    

}