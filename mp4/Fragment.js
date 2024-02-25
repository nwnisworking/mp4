import Box from './Boxes.js'
import atoms from './atoms.js'
import { TFHD, TRUN } from './Enum.js'
import Uint from './util/Uint.js'

export default class Fragment{
  trak

  mdat

  samples_per_moof = 0

  data

  /**
   * 
   * @param {atoms.trak} trak 
   * @param {atoms.mdat} mdat 
   */
  constructor(trak, mdat, samples_per_moof = 0){
    this.trak = trak
    this.mdat = mdat
    this.data = trak.sample()
    this.samples_per_moof = samples_per_moof
  }

  isVideo(){
    return this.trak.get('hdlr').handler_type === 'vide'
  }

  isAudio(){
    return this.trak.get('hdlr').handler_type === 'soun'
  }

  build(){
    const tfhd = new atoms.tfhd
    tfhd.flag = TFHD.SAMPLE_DURATION_PRESENT | TFHD.DEFAULT_BASE_IS_MOOF
    tfhd.sample_duration = this.data.delta
    tfhd.track_id = this.data.id

    let moof
    let mdat = new atoms.mdat
    mdat.data = new Uint

    const _ = []

    for(let i = 0, c = 0; i < this.data.samples.length; i++){
      const sample = this.data.samples[i]

      if(!(i % this.samples_per_moof)){
        if(moof){
          mdat.data = mdat.data.join()
          _.push(moof)
          _.push(mdat)

          mdat = new atoms.mdat
          mdat.data = new Uint
          
          moof.get('trun').data_offset = moof.toBuffer().length + 8
        }

        moof = Box.create('moof')
        
        const mfhd = new atoms.mfhd
        const traf = Box.create('traf')
        const tfdt = new atoms.tfdt
        const trun = new atoms.trun

        trun.entry_count = this.samples_per_moof
        trun.data_offset = 0
        trun.flag = TRUN.DATA_OFFSET_PRESENT | TRUN.SAMPLE_SIZE_PRESENT

        if(this.isVideo())
          trun.flag|= TRUN.SAMPLE_CTTS_PRESENT | TRUN.SAMPLE_FLAG_PRESENT

        mfhd.sequence_number = c
        tfdt.decoder_time = c * this.samples_per_moof * this.data.delta
        
        moof.items.push(mfhd, traf)
        traf.items.push(tfhd, tfdt, trun)
        c++
      }

      const trun = moof.get('trun')
      let trun_entry

      if(this.isVideo())
        trun_entry = {
          sample_size : sample.size,
          sample_flags : sample.keyframe ? TRUN.ENTRIES_KEYFRAME : TRUN.ENTRIES_NON_KEYFRAME,
          sample_composition_time_offset : sample.offset
        }
      else
        trun_entry = {
          sample_size : sample.size
        }

      sample.start-= this.mdat.start + 8
      sample.end-= this.mdat.start + 8
      
      mdat.data.push(new Uint8Array(this.mdat.data.slice(sample.start, sample.end)))
      trun.entries.push(trun_entry)
    }

    if(!_.includes(moof)){
      _.push(moof)
      moof.get('trun')
      .set('entry_count', moof.get('trun').entries.length)
      .set('data_offset', moof.toBuffer().length + 8)
    }

    if(!_.includes(mdat)){
      _.push(mdat)
      mdat.data = mdat.data.join()
    }

   
    console.log(_.at(-2).items.at(-1))
    return _
  }
}