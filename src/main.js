import Widget from './Widget2.svelte'

const el = document.getElementById('passport')
const dataset = Object.assign({}, el.dataset)


const widget = new Widget({
  target: el,
  props: dataset
})