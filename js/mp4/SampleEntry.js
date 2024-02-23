import Box from './Box.js'
import DV from './util/DV.js'
import List from './util/List.js'
import { CONT, KV, Reserved, U16 } from './util/helper.js'

class SampleEntry extends Box{
  data_reference_index
  
  // Needs to set to false to prevent skipping atom in sample entry
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

  map = ()=>new List(KV('data', CONT))

  /**
   * 
   * @param {DV} dv 
   */
  constructor(dv){
    super(dv)

    dv.offset+= 22

    this.data_reference_index = dv.getU16()
    this.width = dv.getU16()
    this.height = dv.getU16()
    this.horizontal_resolution = dv.getU32()
    this.vertical_resolution = dv.getU32()
    dv.offset+= 4
    this.frame_count = dv.getU16()
    this.compressor_name = dv.read(32)
    this.depth = dv.getU16()
    dv.offset+= 2

    this.size-= this.end - dv.offset 
    dv.offset = this.start + 8
  }
}

export class AudioSampleEntry extends SampleEntry{
  channel_count

  sample_size

  sample_rate

  map = ()=>new List(KV('data', CONT))

  /**
   * 
   * @param {DV} dv 
   */
  constructor(dv){
    super(dv)
    dv.offset+=6
    this.data_reference_index = dv.getU16()
    dv.offset+= 8
    this.channel_count = dv.getU16()
    this.sample_size = dv.getU16()
    dv.offset+= 4
    this.sample_rate = dv.getU16()
    dv.offset+= 2
    
    this.size-= this.end - dv.offset
    dv.offset = this.start + 8
  }
}