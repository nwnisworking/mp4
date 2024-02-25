import Box, { FullBox } from "./Boxes.js"
import { AudioSampleEntry, VisualSampleEntry } from "./SampleEntries.js"
import Map from "./util/Map.js"
import { _1904, deepClone } from "./util/index.js"

const _ = {}

_.ftyp = class extends Box{
  name = 'ftyp'

  major_brand

  minor_version

  compatible_brands

  container = false

  map = ()=>new Map(
    Map.str('major_brand', 4),
    Map.u32('minor_version'),
    Map.str('compatible_brands')
  )
}

_.mvhd = class extends FullBox{
  name = 'mvhd'

  _creation_time

  get creation_time(){ return new Date(_1904 + this._creation_time * 1000) }

  set creation_time(v){ this._creation_time = (v.getTime() - _1904) / 1000 }

  _modification_time

  get modification_time(){ return new Date(_1904 + this._modification_time * 1000) }

  set modification_time(v){ this._modification_time = (v.getTime() - _1904) / 1000 }

  time_scale

  duration

  rate

  volume

  matrix = {}

  next_track_id

  map = ()=>{
    const map = new Map

    if(this.version)
      map
      .u64('_creation_time')
      .u64('_modification_time')
      .u32('time_scale')
      .u64('duration')
    else
      map
      .u32('_creation_time')
      .u32('_modification_time')
      .u32('time_scale')
      .u32('duration')

    map
    .u32('rate')
    .u16('volume')
    .res(10)
    .u32('matrix.0')
    .u32('matrix.1')
    .u32('matrix.2')
    .u32('matrix.3')
    .u32('matrix.4')
    .u32('matrix.5')
    .u32('matrix.6')
    .u32('matrix.7')
    .u32('matrix.8')
    .res(24)
    .u32('next_track_id')

    return map
  }
}

_.tkhd = class extends FullBox{
  name = 'tkhd'

  _creation_time

  get creation_time(){ return new Date(_1904 + this._creation_time * 1000) }

  set creation_time(v){ this._creation_time = (v.getTime() - _1904) / 1000 }

  _modification_time

  get modification_time(){ return new Date(_1904 + this._modification_time * 1000) }

  set modification_time(v){ this._modification_time = (v.getTime() - _1904) / 1000 }

  track_id

  duration
  
  layer

  alternate_group

  volume

  matrix = {}

  width

  height

  map = ()=>{
    const map = new Map

    if(this.version)
      map
      .u64('_creation_time')
      .u64('_modification_time')
      .u32('track_id')
      .res(4)
      .u64('duration')
    else
      map
      .u32('_creation_time')
      .u32('_modification_time')
      .u32('track_id')
      .res(4)
      .u32('duration')

    map
    .res(8)
    .u16('layer')
    .u16('alternate_group')
    .u16('volume')
    .res(2)
    .u32('matrix.0')
    .u32('matrix.1')
    .u32('matrix.2')
    .u32('matrix.3')
    .u32('matrix.4')
    .u32('matrix.5')
    .u32('matrix.6')
    .u32('matrix.7')
    .u32('matrix.8')
    .u32('width')
    .u32('height')

    return map
  }

  
}

_.elst = class extends FullBox{
  name = 'elst'

  entry_count

  entries = []

  map = ()=>{
    const map = new Map(Map.u32('entry_count'))

    if(this.version)
      map.set('entries.[entry_count]', {
        duration : Map.U64,
        media_time : Map.U64,
        media_rate_integer : Map.U16,
        media_rate_fraction : Map.U16
      })
    else
      map.set('entries.[entry_count]', {
        duration : Map.U32,
        media_time : Map.U32,
        media_rate_integer : Map.U16,
        media_rate_fraction : Map.U16
      })
    return map
  }
}

_.mdhd = class extends FullBox{
  name = 'mdhd'

  _creation_time

  get creation_time(){ return new Date(_1904 + this._creation_time * 1000) }

  set creation_time(v){ this._creation_time = (v.getTime() - _1904) / 1000 }

  _modification_time

  get modification_time(){ return new Date(_1904 + this._modification_time * 1000) }

  set modification_time(v){ this._modification_time = (v.getTime() - _1904) / 1000 }

  time_scale

  duration

  language

  map = ()=>{
    const map = new Map

    if(this.version)
      map
      .u64('_creation_time')
      .u64('_modification_time')
      .u32('time_scale')
      .u64('duration')
    else
      map 
      .u32('_creation_time')
      .u32('_modification_time')
      .u32('time_scale')
      .u32('duration')

    map
    .u16('language')
    .res(2)

    return map
  }
}

_.hdlr = class extends FullBox{
  name = 'hdlr'

  handler_type

  handler_name

  map = ()=>new Map(
    Map.res(4),
    Map.str('handler_type', 4),
    Map.res(12),
    Map.str('handler_name')
  )
}

_.mdat = class extends Box{ 
  name = 'mdat' 
  
  data 
  
  container = false

  map = ()=>new Map(Map.buf('data'))
}

_.free = class extends Box{ 
  name = 'free' 
  
  data 
  
  map = ()=>new Map(Map.buf('data')) 
}

_.skip = class extends Box{ 
  name = 'skip' 
  
  data 
  
  map = ()=>new Map(Map.buf('data')) 
}

_.dref = class extends FullBox{
  name = 'dref'

  container = true

  entry_count

  map = ()=>new Map(Map.u32('entry_count'))
}

_.stsd = class extends FullBox{
  name = 'stsd'

  container = true

  entry_count

  map = ()=>new Map(Map.u32('entry_count'))
}

_['url '] = class extends FullBox{
  name = 'url '
  
  location

  map = ()=>new Map(Map.str('location'))
}

_.stts = class extends FullBox{
  name = 'stts'

  entry_count

  entries = []

  map = ()=>new Map(
    Map.u32('entry_count'), 
    Map.set('entries.[entry_count]', {
      sample_count : Map.U32,
      sample_delta : Map.U32
    })
  )
}

_.stsc = class extends FullBox{
  name = 'stsc'

  entry_count

  entries = []

  map = ()=>new Map(
    Map.u32('entry_count'), 
    Map.set('entries.[entry_count]', {
      first_chunk : Map.U32, 
      samples_per_chunk : Map.U32,
      sample_description_index : Map.U32
    })
  )
}

_.stco = class extends FullBox{
  name = 'stco'

  entry_count

  entries = []

  map = ()=>new Map(
    Map.u32('entry_count'), 
    Map.set('entries.[entry_count]', Map.U32)
  )
}

_.stsz = class extends FullBox{
  name = 'stsz'

  sample_count

  entry_count

  entries = []

  map = ()=>new Map(
    Map.u32('sample_count'), 
    Map.u32('entry_count'), 
    Map.set('entries.[entry_count]', Map.U32)
  )
}

_.stss = class extends FullBox{
  name = 'stss'

  entry_count

  entries = []

  map = ()=>new Map(
    Map.u32('entry_count'), 
    Map.set('entries.[entry_count]', Map.U32)
  )
}

_.ctts = class extends FullBox{
  name = 'ctts'

  entry_count

  entries = []

  map = ()=>new Map(
    Map.u32('entry_count'), 
    Map.set('entries.[entry_count]', {
      sample_count : Map.U32,
      sample_offset : Map.U32
    })
  )
}

_.vmhd = class extends FullBox{
  name = 'vmhd'

  graphics_mode

  r

  g

  b

  map = ()=>new Map(
    Map.u16('graphics_mode'),
    Map.u16('r'),
    Map.u16('g'),
    Map.u16('b')
  )
}

_.smhd = class extends FullBox{
  name = 'smhd'

  balance

  map = ()=>new Map(Map.u16('balance'), Map.res(2))
}

_.meta = class extends FullBox{
  name = 'meta'

  container = true
}

_.data = class extends Box{
  name = 'data'

  country

  language

  indicator

  type

  value

  container = false

  map = ()=>new Map(
    Map.u8('country'),
    Map.u8('language'),
    Map.u8('indicator'),
    Map.u8('type'),
    Map.res(4),
    Map.str('value')
  )
}

_.colr = class extends Box{
  name = 'colr'

  color_parameter_type

  data
  
  container = false

  map = ()=>new Map(
    Map.str('color_parameter_type', 4),
    Map.str('data')
  )
}

_.pasp = class extends Box{
  name = 'pasp'

  h_spacing

  v_spacing

  container = false

  map = ()=>new Map(
    Map.u32('h_spacing'), 
    Map.u32('v_spacing')
  )
}

_.btrt = class extends Box{
  name = 'btrt'

  buffer_size

  max_bitrate

  avg_bitrate

  container = false

  map = ()=>new Map(
    Map.u32('buffer_size'), 
    Map.u32('max_bitrate'), 
    Map.u32('avg_bitrate')
  )
}

_.trex = class extends FullBox{
  name = 'trex'

  track_id

  sample_description_index

  sample_duration

  sample_size

  sample_flag

  map = ()=>new Map(
    Map.u32('track_id'),
    Map.u32('sample_description_index'),
    Map.u32('sample_duration'),
    Map.u32('sample_size'),
    Map.u32('sample_flag')
  )
}

_.mfhd = class extends FullBox{
  name = 'mfhd'

  sequence_number

  map = ()=>new Map(Map.u32('sequence_number'))
}

_.tfhd = class extends FullBox{
  name = 'tfhd'

  track_id

  base_data_offset

  sample_description_index

  sample_duration

  sample_size

  sample_flag

  map = ()=>{
    const map = new Map(Map.u32('track_id'))

    if(this.flag & 0x1)
      map.u64('base_data_offset')
    
    if(this.flag & 0x2)
      map.u32('sample_description_index')
    
    if(this.flag & 0x8)
      map.u32('sample_duration')

    if(this.flag & 0x10)
      map.u32('sample_size')

    if(this.flag & 0x20)
      map.u32('sample_flag')

    return map
  }
}

_.tfdt = class extends FullBox{
  name = 'tfdt'

  decoder_time

  map = ()=>new Map(this.version ? Map.u64('decoder_time') : Map.u32('decoder_time'))
}

_.trun = class extends FullBox{
  name = 'trun'

  entry_count

  data_offset

  first_sample_flags
  
  entries = []

  map = ()=>{
    const map = new Map(Map.u32('entry_count'))

    if(this.flag & 0x1)
      map.u32('data_offset')

    if(this.flag & 0x4)
      map.u32('first_sample_flags')

    const obj = {}

    if(this.flag & 0x100)
      obj['sample_duration'] = Map.U32
    
    if(this.flag & 0x200)
      obj['sample_size'] = Map.U32

    if(this.flag & 0x400)
      obj['sample_flags'] = Map.U32

    if(this.flag & 0x800)
      obj['sample_composition_time_offset'] = Map.U32

    map.set('entries.[entry_count]', obj)

    return map
  }
}

_.tfra = class extends FullBox{
  name = 'tfra'

  track_id

  length_size

  entry_count

  entries = []

  data

  map = ()=>new Map(
    Map.u32('track_id'),
    Map.u32('length_size'),
    Map.u32('entry_count'),
    Map.str('data')
  )

  // parse(){
  //   super.parse()
  //   this.dv.offset-= this.data.length

  //   const len_size_traf_num = ((this.length_size >> 4 & 0x3) + 1) * 8
  //   const len_size_trun_num = ((this.length_size >> 2 & 0x3) + 1) * 8
  //   const len_size_sample_num = ((this.length_size & 0x3) + 1) * 8
  //   for(let i = 0; i < this.entry_count; i++){
  //     this.entries.push({
  //       time : this.version ? this.dv.getU64() : this.dv.getU32(),
  //       moof_offset : this.version ? this.dv.getU64() : this.dv.getU32(),
  //       traf_num : this.dv['getU' + len_size_traf_num](),
  //       trun_num : this.dv['getU' + len_size_trun_num](),
  //       sample_num : this.dv['getU' + len_size_sample_num]()
  //     })
  //   }
  // }
}

_.mfro = class extends FullBox{
  name = 'mfro'

  mfra_size

  map = ()=>new Map(Map.u32('mfra_size'))
}

_.moov = class extends Box{
  name = 'moov'

  emptyMoov(){
    const moov = deepClone(this)

    moov
    .get('mvhd')
    .set('_creation_time', 0)
    .set('_modification_time', 0)
    .set('duration', 0)
    .set('time_scale', 1000)

    moov.all('trak').forEach(e=>{
      const tkhd = e.get('tkhd')
      const mdhd = e.get('mdhd')
      const stbl = e.get('stbl')
      
      const stts = stbl.get('stts')
      const stsc = stbl.get('stsc')
      const stsz = stbl.get('stsz')
      const stco = stbl.get('stco')

      stsc.entries = 
      stsz.entries = 
      stco.entries = 
      stts.entries = []

      stsc.entry_count = 
      stsz.entry_count = 
      stsz.sample_count = 
      stco.entry_count = 
      mdhd._creation_time = 
      mdhd._modification_time = 
      mdhd.duration = 
      tkhd._creation_time = 
      tkhd._modification_time = 
      tkhd.duration = 
      stts.entry_count = 0

      // if(ctts){
      //   ctts.entries = []
      //   ctts.entry_count = 0
      // }

      // if(stss){
      //   stss.entries = []
      //   stss.entry_count = 0
      // }
      
      stbl.items = stbl.items.filter(e=>!['ctts', 'stss'].includes(e.name))

    })

    return moov
  }

  fragment({audio = false, video = false} = {}){
    let mvex

    if(!this.get('mvex'))
      this.items.push(Box.create('mvex'))

    mvex = this.get('mvex')

    this.all('trak').forEach(e=>{
      const trex = new _.trex
      trex.track_id = e.get('tkhd').track_id
      trex.sample_description_index = 1
      trex.sample_duration =
      trex.sample_size = 
      trex.sample_flag = 0


      if(!video && e.get('hdlr').handler_type === 'vide'){
        this.items.splice(this.items.indexOf(e), 1)
        return
      }

      if(!audio && e.get('hdlr').handler_type === 'soun'){
        this.items.splice(this.items.indexOf(e), 1)
        return
      }

      mvex.items.push(trex)


    })

    return this
  }
}

_.trak = class extends Box{
  name = 'trak'

  sample(){
    const mdhd = this.get('mdhd')
    const stts = this.get('stts').entries[0]
    const stss = this.get('stss')?.entries ?? []
    const stsc = this.get('stsc').entries
    const stco = this.get('stco').entries
    const stsz = this.get('stsz').entries
    const ctts = this.get('ctts')?.entries
    const meta = {
      samples : [],
      delta : stts.sample_delta,
      size : stts.sample_count,
      duration : stts.sample_count * stts.sample_delta,
      time_scale : mdhd.time_scale,
      id : this.get('tkhd').track_id
    }

    for(let i = 0, sc = 0, sz = 0, ct = 0, cti = 0; i < stco.length; i++){
      const start = stco[i]
      let ts = 0

      if(stsc[sc + 1] && stsc[sc + 1].first_chunk - 1 === i)
        sc+=1

      stsz.slice(sz, sz+= stsc[sc].samples_per_chunk).forEach(size=>{
        const _ = {
          start : start + ts,
          end : start + ts + size,
          index : meta.samples.length,
          size
        }

        ts+= size

        if(ctts){
          if(ctts[cti].sample_count - ct === 0){
            cti++
            ct = 0
          }

          ct++

          _.offset = ctts[cti].sample_offset
          _.pts = ctts[cti].sample_offset + meta.samples.length * meta.delta
          _.time = (ctts[cti].sample_offset + meta.samples.length * meta.delta - meta.delta) / meta.time_scale
        }
        else{
          _.time = (meta.samples.length * meta.delta - meta.delta) / meta.time_scale
        }

        if(stss){
          _.keyframe = stss.includes(meta.samples.length + 1)
        }

        meta.samples.push(_)
      })
    }

    return meta
  }
}

export default _

_.avc1 = class extends VisualSampleEntry{}

_.mp4a = class extends AudioSampleEntry{}

_.avcC = class extends Box{
  ignore = true

  config_version

  profile_indication
  
  profile_compatibility

  level_indication

  length_size_minus_one

  sps = []

  pps = []

  config

  container = false

  data

  map = ()=>new Map(Map.str('data'))

  constructor(dv){
    super(dv)
    this.config_version = dv.u8()
    this.profile_indication = dv.u8()
    this.profile_compatibility = dv.u8()
    this.level_indication = dv.u8()
    this.length_size_minus_one = dv.u8() & 0x3
    this.config = dv.read(this.end - dv.offset)
    dv.offset-= this.config.length

    let len = dv.u8() & 0x1f

    for(let i = 0; i < len; i++){
      const s = dv.u16()
      this.sps.push({length : s, nalu : new Uint8Array(dv.buffer.slice(dv.offset, dv.offset+=s))})
    }

    len = dv.u8() & 0x1f

    for(let i = 0; i < len; i++){
      const s = dv.u16()
      this.pps.push({length : s, nalu : new Uint8Array(dv.buffer.slice(dv.offset, dv.offset+= s))})
    }

    dv.offset = this.start + 8
  }
}

_.esds = class extends FullBox{
  ignore = true

  descriptors = []

  /**
   * 
   * @param {DV} dv 
   */
  constructor(dv){
    super(dv)

    const typ = {
      0x3 : this.ESDescriptor,
      0x4 : this.DecoderConfigDescriptor,
      0x5 : this.DecSpecificInfo,
      0x6 : this.SLConfig
    }

    while(dv.offset < this.end){
      const c = dv.u8()
      if(!typ[c])
        continue
      this.descriptors.push(typ[c].call(this, dv))
      
    }
  }

  ESDescriptor(dv){
    const _ = {
      type : 'ES_DESCRIPTOR'
    }
    dv.offset+=1
    _.ES_ID = dv.u16()
    _.flag = dv.u8()
    _.dependsOn_ES_ID = _.flag & 0x80 ? dv.u16() : 0
    _.URL = _.flag & 0x40 ? dv.read(dv.u8()) : ''
    _.OCR_ES_ID = _.flag & 0x20 ? dv.u16() : 0

    return _
  }

  DecoderConfigDescriptor(dv){
    const _ = {
      type : 'DECODER_CONFIG_DESCRIPTOR'
    }
    dv.offset+=1
    _.object_type = dv.u8()
    _.stream_type = _.upstream = dv.u8()
    _.stream_type>>= 2
    _.upstream = (_.upstream >> 1 & 0x1) !== 0
    _.buffer_size = dv.u8() << 16 | dv.u16()
    _.max_bitrate = dv.u32()
    _.avg_bitrate = dv.u32()
    return _
  }

  DecSpecificInfo(dv){
    const _ = {
      type : 'DECODER_SPECIFIC_INFO'
    }
    dv.offset+= 1

    let a = dv.u16()

    _.object_type = a >> 11
    _.frequency_index = a >> 7 & 0xf
    _.channel_config = a >> 3 & 0xf

    return _
  }

  SLConfig(dv){
    const _ = {
      type : 'SL_CONFIG_DESCRIPTOR'
    }
    dv.offset+= 1

    _.frame_length = dv.u8()

    return _
  }
}