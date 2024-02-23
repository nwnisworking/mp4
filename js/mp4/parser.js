import Box, { Fullbox } from './Box.js'
import DV from './util/DV.js'
import atoms from './atoms.js'

export default class Parser{
  /** @type {DV} */
  dv

  /** @type {Array<Box>} */
  atoms = []

  constructor(buf){
    this.dv = new DV(buf)
  }

  moov(){
    return this.atoms.find(e=>e.name === 'moov').parse()
  }

  ftyp(){
    return this.atoms.find(e=>e.name === 'ftyp').parse()
  }

  videoSample(index = 0){
    const trak = this.moov()
    .parseChildren()
    .all('trak')
    .filter(e=>e.get('hdlr').handler_type === 'vide')
    .at(index)

    const mdhd = trak.get('mdhd')
    const stts = trak.get('stts').entries[0]
    const stss = trak.get('stss').entries
    const stsc = trak.get('stsc').entries
    const stco = trak.get('stco').entries
    const stsz = trak.get('stsz').entries
    const ctts = [...trak.get('ctts').entries]
    const mdat = this.atoms.find(e=>e.name === 'mdat').parse()
    const meta = {
      samples : [],
      delta : stts.sample_delta,
      duration : stts.sample_count * stts.sample_delta,
      scale : mdhd.time_scale
    }

    for(let i = 0, sc = 0, szo = 0; i < stco.length; i++){
      const co = stco[i] - (mdat.start + 8)
      let sz = co 

      if(stsc[sc + 1] && stsc[sc + 1].first_chunk - 1 === i)
        sc+= 1

      stsz.slice(szo, szo+= stsc[sc].samples_per_chunk).forEach(e=>{
        meta.samples.push({
          data : mdat.data.slice(sz, sz+=e),
          offset : ctts[0].sample_offset,
          pts : ctts[0].sample_offset + meta.samples.length * meta.delta,
          index : meta.samples.length,
          size : e,
          keyframe : stss.includes(meta.samples.length + 1),
          time : (ctts[0].sample_offset + meta.samples.length * meta.delta - meta.delta) / meta.scale
        })

        ctts[0].sample_count--

        if(ctts[0].sample_count === 0)
          ctts.shift()
      })
    }

    return meta
  }

  audioSample(){

  }

  init(parse = false){
    const { dv } = this
    const depth = []

    while(dv.offset < dv.byteLength){
      dv.offset+=4
      const name = dv.read(4)
      dv.offset-= 8
      const atom = new (atoms[name] || Box)(dv)


      if(parse)
        atom.parse()

      this.atoms.push(atom)

      dv.offset = atom.start

      if(atom.name === 'meta')
        dv.offset-= 4

      if(atom.container)
        dv.offset+= 8 + (atom instanceof Fullbox ? 8 : 0)
      else
        dv.offset+= atom.size

      let last_atom = depth.at(-1)

      if(last_atom?.end >= atom.end)
        last_atom.items.push(atom)
      else{
        while(depth.length && depth.at(-1)?.end < atom.end)
          depth.pop()

        last_atom = depth.at(-1)

        if(depth.length)
          last_atom.items.push(atom)
      }

      if(atom.container)
        depth.push(atom)
    }
  }

  emptyMoov(){
    const moov = this.moov().parseChildren()
    const mvhd = moov.get('mvhd')
    
    mvhd.creation_time = 
    mvhd.modification_time = 
    mvhd.duration = 0
    mvhd.time_scale = 1000

    moov.all('trak').forEach(e=>{
      const tkhd = e.get('tkhd')
      const mdhd = e.get('mdhd')
      const stbl = e.get('stbl')
      
      const stts = stbl.get('stts')
      const stsc = stbl.get('stsc')
      const stsz = stbl.get('stsz')
      const stco = stbl.get('stco')

      stts.entries.length = 
      stts.entry_count = 
      stsc.entries.length = 
      stsc.entry_count = 
      stco.entries.length = 
      stco.entry_count = 
      stsz.entries.length = 
      stsz.entry_count = 
      stsz.sample_count = 
      mdhd.creation_time = 
      mdhd.modification_time = 
      mdhd.duration = 
      tkhd.creation_time = 
      tkhd.modification_time = 
      tkhd.duration = 0

      stbl.items = stbl.items.filter(e=>!['ctts', 'stss'].includes(e.name))

    })
    return this
  }

  fragment({audio = false, video = true, total_sample = 120} = {}){
    const moov = this.moov()
    const mvex = Box.create('mvex')

    this.emptyMoov()
    moov.items.push(mvex)

    moov.items = moov.items.filter(e=>{
      if(e.name === 'trak'){
        const hdlr = e.get('hdlr')

        if((hdlr.handler_type === 'vide' && video) || (hdlr.handler_type === 'soun' && audio)){
          const trex = new atoms.trex()
          trex.track_id = e.get('tkhd').track_id
          trex.sample_description_index = 1
          trex.sample_duration = 0
          trex.sample_size = 0
          trex.sample_flag = 0
          
          mvex.items.push(trex)
          return e
        }
        else
          return false
      }
    
      return e
    })

    return this
  }
}