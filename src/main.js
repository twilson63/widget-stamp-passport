import Widget from './Widget.svelte'

const el = document.getElementById('widget-poap')
//const dataset = el.dataset


const widget = new Widget({
  target: el
})