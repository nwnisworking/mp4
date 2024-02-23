import fs from 'fs'
import Parser from './js/mp4/parser.js'
import { convertNumber, toHex } from './js/mp4/util/helper.js'
import Box from './js/mp4/Box.js'
import atoms from './js/mp4/atoms.js'

const { buffer } = fs.readFileSync('anime.mp4')
const mp4 = new Parser(buffer)

mp4.init()

const sec = 10
const offset = 500
const max_sample = 24 * sec

const moof = Box.create('moof')
const mfhd = new atoms.mfhd
const traf = Box.create('traf')

mfhd.sequence_number = 0

moof.items.push(mfhd, traf)

const tfhd = new atoms.tfhd
tfhd.flag = 0x20000 | 0x8
tfhd.track_id = 1
tfhd.sample_duration = 1001

const tfdt = new atoms.tfdt
tfdt.decoder_time = 0

const trun = new atoms.trun
const mdat = new atoms.mdat
mdat.data = ''
trun.flag = 0x1 | 0x200 | 0x400 | 0x800
trun.entry_count = max_sample
trun.data_offset = 0

const vs = mp4.videoSample()

for(let i = offset; i < offset + max_sample; i++){
  mdat.data+= vs.samples[i].data
  trun.entries.push({
    sample_size : vs.samples[i].size,
    sample_flags : 1 << (vs.samples[i].keyframe ? 25 : 16),
    sample_composition_time_offset : vs.samples[i].offset
  })
}

traf.items.push(tfhd, tfdt, trun)
trun.data_offset = (moof + '').length + 8

const moov = mp4.emptyMoov().fragment({video : true}).moov()
const ftyp = mp4.ftyp()

const a = [ftyp, moov, moof, mdat].join('').split('').map(e=>e.charCodeAt(0))

fs.writeFileSync('full.mp4', Uint8Array.from(a))