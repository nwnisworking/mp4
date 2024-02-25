import Box from "./Boxes.js"
import DV from "./util/DV.js"
import Map from "./util/Map.js"

class SampleEntry extends Box{
  data_reference_index

  container = false
}

export class VisualSampleEntry extends SampleEntry{
  width

  height

  horizontal_resolution

  vertical_resolution

  frame_count

  compressor_name

  depth

  data

  map = ()=>new Map(Map.str('data'))

  /**
   * 
   * @param {DV} dv 
   */
  constructor(dv){
    super(dv)
    dv.offset+=22
    this.data_reference_index = dv.u16()
    this.width = dv.u16()
    this.height = dv.u16()
    this.horizontal_resolution = dv.u32()
    this.vertical_resolution = dv.u32()
    dv.offset+=4
    this.frame_count = dv.u16()
    this.compressor_name = dv.read(32)
    this.depth = dv.u16()
    dv.offset+=2
    this.size-= this.end - dv.offset
    dv.offset = this.start + 8
  }
}

export class AudioSampleEntry extends SampleEntry{
  channel_count

  sample_size

  sample_rate

  map = ()=>new Map(Map.str('data'))

  /**
   * 
   * @param {DV} dv 
   */
  constructor(dv){
    super(dv)
    dv.offset+=6
    this.data_reference_index = dv.u16()
    dv.offset+= 8
    this.channel_count = dv.u16()
    this.sample_size = dv.u16()
    dv.offset+= 4
    this.sample_rate = dv.u16()
    dv.offset+= 2
    this.size-= this.end - dv.offset
    dv.offset = this.start + 8
  }
}