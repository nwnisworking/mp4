import Box from "./mp4/Boxes.js"
import Parse from "./mp4/Parse.js"
import Map from "./mp4/util/Map.js"
import { _1904 } from "./mp4/util/index.js"
import fs from 'fs'
import atoms from './mp4/atoms.js'
import Fragment from "./mp4/Fragment.js"
import Uint from "./mp4/util/Uint.js"
// Example of the file here
const file = fs.readFileSync('demo.mp4').buffer
const parse = new Parse(file)
parse.init()

const fragment = new Fragment(parse.atoms.filter(e=>e.name === 'trak'), parse.atoms.find(e=>e.name === 'mdat'), {type : 2, value : 100})
const data = fragment.extract(120, 140)
const ftyp = parse.get('ftyp')
const moov = parse.get('moov').emptyMoov().fragment({video : true, audio : true})


fs.writeFileSync('test1.mp4', new Uint8Array(await new Blob([
  ftyp.toBuffer(),
  moov.toBuffer(),
  ...data.map(e=>e.toBuffer())
]).arrayBuffer()))