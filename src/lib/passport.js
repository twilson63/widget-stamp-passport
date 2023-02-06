import map from 'ramda/src/map'
import take from 'ramda/src/take'
import Stamps from '@permaweb/stampjs'
import { WarpFactory, LoggerFactory } from 'https://unpkg.com/warp-contracts@1.2.51/bundles/web.bundle.min.js'

LoggerFactory.INST.logLevel('fatal')
const _stamps = Stamps.init({ warp: WarpFactory.forMainnet() })

export const hasStamped = (txId, addr) => _stamps.hasStamped(addr, txId)
  .then(x => (console.log('already stamped', x), x))

export const stamp = (txId) => _stamps.stamp(txId)
export const getStampCount = async (txId) => (await _stamps.count(txId)).total
