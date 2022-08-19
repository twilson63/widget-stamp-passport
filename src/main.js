import Widget from './Widget.svelte'

const code = document.querySelector('meta[name="code"]').content
const author = document.querySelector('meta[name="author"').content

const el = document.getElementById('passport')
const dataset = Object.assign({}, el.dataset, { code, author })


const widget = new Widget({
  target: el,
  props: dataset
})