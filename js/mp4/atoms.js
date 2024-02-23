import Box, { Fullbox } from './Box.js'
import { AudioSampleEntry, VisualSampleEntry } from './SampleEntry.js'
import DV from './util/DV.js'
import { STR, U64, KV, U32, U8, U16, Reserved, CONT } from './util/helper.js'
import List from './util/List.js'

const _ = {}

_.ftyp = class extends Box{
  name = 'ftyp'

  major_brand

  minor_version

  compatible_brands

  container = false

  map = ()=>new List(
    KV('major_brand', STR | 4),
    KV('minor_version', U32),
    KV('compatible_brands', STR)
  )

}

_.mvhd = class extends Fullbox{
  name = 'mvhd'
  
  creation_time

  modification_time

  time_scale

  duration

  rate

  volume

  matrix = {}

  next_track_id

  map = ()=>{
    const map = new List

    if(this.version)
      map
      .set(KV('creation_time', U64))
      .set(KV('modification_time', U64))
      .set(KV('time_scale', U32))
      .set(KV('duration', U64))
    else
      map
      .set(KV('creation_time', U32))
      .set(KV('modification_time', U32))
      .set(KV('time_scale', U32))
      .set(KV('duration', U32))

    map
    .set(KV('rate', U32))
    .set(KV('volume', U16))
    .set(Reserved(10))
    .set(KV('matrix.0', U32))
    .set(KV('matrix.1', U32))
    .set(KV('matrix.2', U32))
    .set(KV('matrix.3', U32))
    .set(KV('matrix.4', U32))
    .set(KV('matrix.5', U32))
    .set(KV('matrix.6', U32))
    .set(KV('matrix.7', U32))
    .set(KV('matrix.8', U32))
    .set(Reserved(24))
    .set(KV('next_track_id', U32))

    return map
  }
}

_.tkhd = class extends Fullbox{
  name = 'tkhd'
  
  creation_time

  modification_time

  track_id

  duration
  
  layer

  alternate_group

  volume

  matrix = {}

  width

  height

  map = ()=>{
    const map = new List

    if(this.version)
      map
      .set(KV('creation_time', U64))
      .set(KV('modification_time', U64))
      .set(KV('track_id', U32))
      .set(Reserved(4))
      .set(KV('duration', U64))
      .set(Reserved(8))
    else
      map
      .set(KV('creation_time', U32))
      .set(KV('modification_time', U32))
      .set(KV('track_id', U32))
      .set(Reserved(4))
      .set(KV('duration', U32))
      .set(Reserved(8))

      map
      .set(KV('layer', U16))
      .set(KV('alternate_group', U16))
      .set(KV('volume', U16))
      .set(Reserved(2))
      .set(KV('matrix.0', U32))
      .set(KV('matrix.1', U32))
      .set(KV('matrix.2', U32))
      .set(KV('matrix.3', U32))
      .set(KV('matrix.4', U32))
      .set(KV('matrix.5', U32))
      .set(KV('matrix.6', U32))
      .set(KV('matrix.7', U32))
      .set(KV('matrix.8', U32))
      .set(KV('width', U32))
      .set(KV('height', U32))
      
    return map
  }
}

_.elst = class extends Fullbox{
  name = 'elst'

  entry_count

  entries = []

  map = ()=>{
    const map = new List(KV('entry_count', U32))

    if(this.version)
      map.set(KV('entries.[entry_count]', {
        duration : U64, 
        media_time : U64,
        media_rate_integer : U16,
        media_rate_fraction : U16
      }))
    else
      map.set(KV('entries.[entry_count]', {
        duration : U32, 
        media_time : U32,
        media_rate_integer : U16,
        media_rate_fraction : U16
      }))

    return map
  }
}

_.mdhd = class extends Fullbox{
  name = 'mdhd'

  creation_time

  modification_time

  time_scale

  duration
  
  language

  map = ()=>{
    const map = new List

    if(this.version)
      map
      .set(KV('creation_time', U64))
      .set(KV('modification_time', U64))
      .set(KV('time_scale', U32))
      .set(KV('duration', U64))
    else
      map
      .set(KV('creation_time', U32))
      .set(KV('modification_time', U32))
      .set(KV('time_scale', U32))
      .set(KV('duration', U32))
    
    map
    .set(KV('language', U16))
    .set(Reserved(2))

    return map
  }
}

_.hdlr = class extends Fullbox{
  name = 'hdlr'

  handler_type

  handler_name

  map = ()=>new List(
    Reserved(4),
    KV('handler_type', STR | 4),
    Reserved(12),
    KV('handler_name', STR)
  )
}

_.dref = 
_.stsd = class extends Fullbox{
  container = true

  entry_count

  map = ()=>new List(KV('entry_count', U32))
}

_['url '] = class extends Fullbox{
  name = 'url '
  location

  map = ()=>new List(KV('location', STR))
}

_.stts = class extends Fullbox{
  name = 'stts'

  entry_count

  entries = []

  map = ()=>new List(
    KV('entry_count', U32),
    KV('entries.[entry_count]', {
      sample_count : U32, 
      sample_delta : U32
    })
  )
}

_.stsc = class extends Fullbox{
  name = 'stsc'

  entry_count

  entries = []

  map = ()=>new List(
    KV('entry_count', U32),
    KV('entries.[entry_count]', {
      first_chunk : U32, 
      samples_per_chunk : U32,
      sample_description_index : U32
    })
  )
}

_.stco = class extends Fullbox{
  name = 'stco'

  entry_count

  entries = []

  map = ()=>new List(
    KV('entry_count', U32),
    KV('entries.[entry_count]', U32)
  )
}

_.stsz = class extends Fullbox{
  name = 'stsz'

  sample_count

  entry_count

  entries = []

  map = ()=>new List(
    KV('sample_count', U32),
    KV('entry_count', U32),
    KV('entries.[entry_count]', U32)
  )
}

_.stss = class extends Fullbox{
  name = 'stss'

  entry_count

  entries = []

  map = ()=>new List(
    KV('entry_count', U32),
    KV('entries.[entry_count]', U32)
  )
}

_.ctts = class extends Fullbox{
  name = 'ctts'

  entry_count

  entries = []

  map = ()=>new List(
    KV('entry_count', U32),
    KV('entries.[entry_count]', {
      sample_count : U32,
      sample_offset : U32
    })
  )
}

_.vmhd = class extends Fullbox{
  name = 'vmhd'

  graphics_mode

  r

  g

  b

  map = ()=>new List(
    KV('graphics_mode', U16),
    KV('r', U16),
    KV('g', U16),
    KV('b', U16)
  )
}

_.smhd = class extends Fullbox{
  name = 'smhd'

  balance

  map = ()=>new List(KV('balance', U16), Reserved(2))
}

_.meta = class extends Fullbox{
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

  map = ()=>new List(
    KV('country', U8),
    KV('language', U8),
    KV('indicator', U8),
    KV('type', U8),
    Reserved(4),
    KV('value', STR)
  )
}

_.mdat = class extends Box{
  name = 'mdat'

  data

  container = false
  
  map = ()=>new List(KV('data', STR))
}

_.colr = class extends Box{
  name = 'colr'

  color_parameter_type

  data

  container = false

  map = ()=>{
    const map = new List(
      KV('color_parameter_type', STR | 4),
      KV('data', STR)
    )

    return map
  }
}

_.pasp = class extends Box{
  name = 'pasp'

  h_spacing

  v_spacing

  container = false

  map = ()=>new List(KV('h_spacing', U32), KV('v_spacing', U32))
}

_.btrt = class extends Box{
  name = 'btrt'

  buffer_size

  max_bitrate

  avg_bitrate

  container = false

  map = ()=>new List(
    KV('buffer_size', U32), 
    KV('max_bitrate', U32), 
    KV('avg_bitrate', U32)
  )
}

_.trex = class extends Fullbox{
  name = 'trex'

  track_id

  sample_description_index

  sample_duration

  sample_size

  sample_flag

  map = ()=>new List(
    KV('track_id', U32),
    KV('sample_description_index', U32),
    KV('sample_duration', U32),
    KV('sample_size', U32),
    KV('sample_flag', U32)
  )
}

_.mfhd = class extends Fullbox{
  name = 'mfhd'

  sequence_number

  map = ()=>new List(KV('sequence_number', U32))
}

_.tfhd = class extends Fullbox{
  name = 'tfhd'
  
  track_id

  base_data_offset

  sample_description_index

  sample_duration

  sample_size

  sample_flags

  map = ()=>{
    const map = new List(KV('track_id', U32))

    if(this.flag & 0x1)
      map.set(KV('base_data_offset', U64))
    
    if(this.flag & 0x2)
      map.set(KV('sample_description_index', U32))
    
    if(this.flag & 0x8)
      map.set(KV('sample_duration', U32))

    if(this.flag & 0x10)
      map.set(KV('sample_size', U32))

    if(this.flag & 0x20)
      map.set(KV('sample_flags', U32))

    return map
  }
}

_.tfdt = class extends Fullbox{
  name = 'tfdt'

  decoder_time

  map = ()=>new List(KV('decoder_time', this.version ? U64 : U32))
}

_.trun = class extends Fullbox{
  name = 'trun'

  entry_count

  data_offset

  first_sample_flags
  
  entries = []

  map = ()=>{
    const map = new List(KV('entry_count', U32))

    if(this.flag & 0x1)
      map.set(KV('data_offset', U32))

    if(this.flag & 0x4)
      map.set(KV('first_sample_flags', U32))

    const obj = {}

    if(this.flag & 0x100)
      obj['sample_duration'] = U32
    
    if(this.flag & 0x200)
      obj['sample_size'] = U32

    if(this.flag & 0x400)
      obj['sample_flags'] = U32

    if(this.flag & 0x800)
      obj['sample_composition_time_offset'] = U32

    map.set(KV('entries.[entry_count]', obj))

    return map
  }
}

_.tfra = class extends Fullbox{
  name = 'tfra'

  track_id

  length_size

  entry_count

  entries = []

  data

  map = ()=>new List(
    KV('track_id', U32),
    KV('length_size', U32),
    KV('entry_count', U32),
    KV('data', STR)
  )

  constructor(dv){
    super(dv)
  }

  parse(){
    super.parse()
    this.dv.offset-= this.data.length

    const len_size_traf_num = ((this.length_size >> 4 & 0x3) + 1) * 8
    const len_size_trun_num = ((this.length_size >> 2 & 0x3) + 1) * 8
    const len_size_sample_num = ((this.length_size & 0x3) + 1) * 8
    for(let i = 0; i < this.entry_count; i++){
      this.entries.push({
        time : this.version ? this.dv.getU64() : this.dv.getU32(),
        moof_offset : this.version ? this.dv.getU64() : this.dv.getU32(),
        traf_num : this.dv['getU' + len_size_traf_num](),
        trun_num : this.dv['getU' + len_size_trun_num](),
        sample_num : this.dv['getU' + len_size_sample_num]()
      })
    }
  }
}

_.mfro = class extends Fullbox{
  name = 'mfro'

  mfra_size

  map = ()=>new List(KV('mfra_size', U32))
}

export default _
/** Sample entry */
_.avc1 = class extends VisualSampleEntry{}

_.avcC = class extends Box{
  config_version

  profile_indication

  profile_compatibility

  level_indication

  length_size_minus_one

  sps = []

  pps = []

  config

  container = false

  ignore = true

  data

  map = ()=>new List(KV('data', CONT))

  /**
   * 
   * @param {DV} dv 
   */
  constructor(dv){
    super(dv)
    this.config_version = dv.getU8()
    this.profile_indication = dv.getU8()
    this.profile_compatibility = dv.getU8()
    this.level_indication = dv.getU8()
    this.length_size_minus_one = dv.getU8() & 0x3
    this.config = dv.read(this.end - dv.offset)
    dv.offset-= this.config.length

    let len = dv.getU8() & 0x1f

    for(let i = 0; i < len; i++){
      const s = dv.getU16()
      this.sps.push({length : s, nalu : dv.buffer.slice(dv.offset, dv.offset+=s)})
    }

    len = dv.getU8() & 0x1f

    for(let i = 0; i < len; i++){
      const s = dv.getU16()
      this.pps.push({length : s, nalu : dv.buffer.slice(dv.offset, dv.offset+= s)})
    }

    dv.offset = this.start + 8
  }
}

_.mp4a = class extends AudioSampleEntry{}

_.esds = class extends Fullbox{
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
      const c = dv.getU8()
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
    _.ES_ID = dv.getU16()
    _.flag = dv.getU8()
    _.dependsOn_ES_ID = _.flag & 0x80 ? dv.getU16() : 0
    _.URL = _.flag & 0x40 ? dv.read(dv.getU8()) : ''
    _.OCR_ES_ID = _.flag & 0x20 ? dv.getU16() : 0

    return _
  }

  DecoderConfigDescriptor(dv){
    const _ = {
      type : 'DECODER_CONFIG_DESCRIPTOR'
    }
    dv.offset+=1
    _.object_type = dv.getU8()
    _.stream_type = _.upstream = dv.getU8()
    _.stream_type>>= 2
    _.upstream = (_.upstream >> 1 & 0x1) !== 0
    _.buffer_size = dv.getU8() << 16 | dv.getU16()
    _.max_bitrate = dv.getU32()
    _.avg_bitrate = dv.getU32()
    return _
  }

  DecSpecificInfo(dv){
    const _ = {
      type : 'DECODER_SPECIFIC_INFO'
    }
    dv.offset+= 1

    let a = dv.getU16()

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

    _.frame_length = dv.getU8()

    return _
  }
}