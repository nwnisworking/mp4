import Box from './Boxes.js'
import atoms from './atoms.js'
import Uint from './util/Uint.js'
import { TFHD, TRUN } from './Enum.js'
import { deepClone } from './util/index.js'

export default class Fragment{
  tracks = []

  mdat

  /**
   * 
   * @param {Array<atoms.trak>} tracks 
   * @param {atoms.mdat} mdat 
   */
  constructor(tracks, mdat){
    this.tracks.push(...tracks)
    this.mdat = mdat
  }

  /**
   * Extract the video from start to end in seconds
   * @param {number} start 
   * @param {number} end 
   */
  extract(start, end = null, second = 1){
    const fragments = this.tracks.map(e=>this.#buildFragment(e, start ?? 0, end, second))
    const max = Math.max(...fragments.map(e=>e.length))
    const min = Math.min(...fragments.map(e=>e.length))
    const _ = []
    let moof, mdat, mfhd

    /** Need to push leftover to previous traf otherwise chunk is broken */
    if(min !== max){
      const reducer = (p, e)=>(e.length === max ? p.push(e) : null, p)

      for(let frag of fragments.reduce(reducer, [])){
        while(frag.length !== min){
          const [traf, mdat] = frag.splice(min, 1)[0]
          const [p_traf, p_mdat] = frag[min - 1]

          p_traf.get('trun').entries.push(...traf.get('trun').entries)
          p_traf.get('trun').entry_count = p_traf.get('trun').entries.length
          p_mdat.data.push(...mdat.data.data)
        }
      }
    }

    for(let i = 0; i < min; i++){
      moof = Box.create('moof')
      mfhd = new atoms.mfhd
      mdat = new atoms.mdat
      mdat.data = new Uint
      mfhd.sequence_number = i+1
  
      moof.items.push(mfhd)

      for(let x = 0; x < fragments.length; x++){
        if(!fragments[x][i]) continue
        let [traf, f_mdat] = fragments[x][i]

        if(traf)
          moof.items.push(traf)
        
        if(f_mdat)
          mdat.data.push(f_mdat.data.join())
      }

    moof.all('trun').forEach((e, i)=>{
      let size = 0
      
      if(i - 1 !== -1)
        size = mdat.data.data.slice(i - 1, i).reduce((p, e)=>p+=e.byteLength, 0)

      e.data_offset = moof.toBuffer().length + 8 + size
    })

    mdat.data = mdat.data.join()
    _.push(moof, mdat)
    }

    return _
  }

  /**
   * @param {atoms.trak} track 
   * @param {number} start 
   * @param {number} end 
   */
  #buildFragment(track, start, end = null, sec = 1){
    const data = track.sample()
    const _ = []
    let samples_per_second = Math.round(data.time_scale / 1000) * sec

    if(end === null)
      end = data.duration / data.time_scale

    data.samples = data.samples.filter(e=>e.time >= start && e.time <= end)

    const tfhd = new atoms.tfhd
    tfhd.flag = TFHD.SAMPLE_DURATION_PRESENT | TFHD.DEFAULT_BASE_IS_MOOF
    tfhd.sample_duration = data.delta
    tfhd.track_id = data.id

    let traf, mdat

    for(let i = 0, c = 0; i < data.samples.length; i++){
      const sample = data.samples[i]

      if(i % samples_per_second === 0){
        if(traf)
          _.push([traf, mdat])
        
        traf = Box.create('traf')
        mdat = new atoms.mdat
        mdat.data = new Uint
        traf.data = data
        const tfdt = new atoms.tfdt
        const trun = new atoms.trun

        trun.entry_count = samples_per_second
        trun.data_offset = 0
        trun.flag = TRUN.DATA_OFFSET_PRESENT | TRUN.SAMPLE_SIZE_PRESENT

        if(data.type === 'vide')
          trun.flag|= TRUN.SAMPLE_CTTS_PRESENT | TRUN.SAMPLE_FLAG_PRESENT

        tfdt.decoder_time = c * samples_per_second * data.delta
        traf.items.push(tfhd, tfdt, trun)

        c++
      }

      const trun = traf.get('trun')
      let trun_entry

      if(data.type === 'vide')
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

    if(traf && _.lastIndexOf(traf) === -1){
      _.push([traf, mdat])
      traf.get('trun').set('entry_count', traf.get('trun').entries.length)
    }

    return _
  }
}
