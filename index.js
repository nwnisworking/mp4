import Box from "./mp4/Boxes.js"
import Parse from "./mp4/Parse.js"
import Map from "./mp4/util/Map.js"
import { _1904 } from "./mp4/util/index.js"
import fs from 'fs'
import atoms from './mp4/atoms.js'
import Fragment from "./mp4/Fragment.js"
import Uint from "./mp4/util/Uint.js"
// Example of the file here
const file = fs.readFileSync('demo_1.mp4').buffer
const parse = new Parse(file)
parse.init()
const frag_video = new Fragment(parse.get('trak'), parse.get('mdat'), 24 * 30)
const frag_audio = new Fragment(parse.get('trak', 1), parse.get('mdat'), 44.1 * 30)
const ftyp = parse.get('ftyp')

const audio_moof = frag_audio.build().map(e=>e.toBuffer())
const video_moof = frag_video.build().map(e=>e.toBuffer())

fs.writeFileSync('video.mp4', new Uint8Array(await new Blob([
  ftyp.toBuffer(),
  parse.get('moov').emptyMoov().fragment({video : true}).toBuffer(),
  ...video_moof,
]).arrayBuffer()))

fs.writeFileSync('audio.mp4', new Uint8Array(await new Blob([
  ftyp.toBuffer(),
  parse.get('moov').emptyMoov().fragment({audio : true}).toBuffer(),
  ...audio_moof
]).arrayBuffer()))