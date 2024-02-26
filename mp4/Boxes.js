import DV from "./util/DV.js"
import Map from "./util/Map.js"
import Uint from "./util/Uint.js"
import { convertNumber, toStr } from "./util/index.js"

function str2buf(c){
  return c.split('').map(e=>e.charCodeAt(0))
}

function num2buf(v, o){
  const a = []
  o>>=16
  v = BigInt(v)

  while(o){
    a.unshift(Number(v & 0xffn))
    v>>=8n
    o--
  }

  return a
}

function val(ky, o){
  for(let k of ky.split('.'))
    if(typeof o[k] === 'object')
      o = o[k]
    else if(k.includes('['))
      return o
    else
      return o[k]
  
  return o
}

export default class Box{
  /** 
   * Name of the atom box
   * @type {string} 
   */
  name
  
  /** 
   * Size of the atom
   * @type {number} 
   */
  size
  
  /** 
   * Starting offset of the atom
   * @type {number} 
   */
  start
  
  /**
   * Ending offset of the atom 
   * @type {number}
   */
  end

  /** 
   * Data which value is mapped to key 
   * @type {Map} 
   */
  map = ()=>new Map

  /** 
   * List of children atoms
   * @type {Array<Box>} 
   */
  items = []

  /** 
   * A container that holds other atoms
   * @type {boolean} 
   */
  container = true

  /**
   * DataView object 
   * @type {DV}
   */
  #dv

  /**
   * 
   * @param {DV} dv 
   */
  constructor(dv){
    if(!dv) return this
    this.#dv = dv
    this.start = dv.offset
    this.size = dv.u32()
    this.end = this.start + this.size
    this.name = dv.read(4)
  }

  get(name, index = 0, arr = []){
    return this._get(name, arr).at(index)
  }

  all(name){
    return this._get(name, [])
  }

  set(k, v){
    if(this[k] === undefined) return this
    this[k] = v
    return this
  }

  _get(name, arr){
    return this.items.reduce((p, e)=>{
      if(e.name !== name)
        return e._get(name, arr)

      p.push(e)

      return p
    }, arr)
  }

  parse(){
    if(!this.#dv) return this
    const dv = this.#dv

    dv.offset = this.start + 8 + (this instanceof FullBox ? 4 : 0)

    for(let [k, v] of this.map()){
      if(typeof k === 'symbol'){
        dv.offset+=v
        continue
      }

      let o = this
      let len = v & 0xffff
      let size = this.end - dv.offset

      k.match(/\w+|\[.+\]/g).forEach((e, i, a)=>{
        if(e.includes('[') && e.includes(']'))
          o.length = val(e.slice(1, -1), this)
        
        else
          if(i !== a.length - 1)
            o = o[e] ?? {}
          else
            k = e
      })

      if(Array.isArray(o)){
        for(let i = 0; i < o.length; i++){
          size = this.end - dv.offset

          if(typeof v === 'object')
            o[i] = Object.keys(v).reduce((p, e)=>(p[e]=dv[Map.getType(v[e])](v[e] & 0xffff || size) , p), {})
          else
            o[i] = dv[Map.getType(v)](len || size)
        }
      }
      else{
        o[k] = dv[Map.getType(v)](len || size)
      }
    }
  }

  toBuffer(arr){
    let _ = new Uint(Uint8Array.from([0, 0, 0, 0, ...str2buf(this.name)]))

    if(this instanceof FullBox)
      _.push(Uint8Array.from(num2buf(this.version << 16 | this.flag, Map.U32)))

    for(let [k, v] of this.map()){
      let c = typeof k === 'symbol' ? k : val(k, this)

      switch(typeof c){
        case 'symbol' : 
          _.push(Uint8Array.from(str2buf('\x00'.repeat(v & 0xffff))))
        break
        case 'number' : 
          _.push(Uint8Array.from(num2buf(c, v)))
        break
        case 'string' : 
          _.push(Uint8Array.from(str2buf(c)))
        break
        default : 
          if(c instanceof ArrayBuffer || ArrayBuffer.isView(c))
            _.push(new Uint8Array(c))
          else{
            for(let i of c){
              if(typeof i !== 'object'){
                _.push(Uint8Array.from(num2buf(i, v)))
              }
              else{
                let a,b,c = Object.values(v), d = Object.values(i)
                
                while(Number.isInteger((a = c.shift()) && (b = d.shift()))){
                  _.push(Uint8Array.from(num2buf(b, a)))
                }
              }
            }
          }

        break
      }
    }

    this.items.forEach(e=>e.ignore ? null : e.toBuffer(_))

    _.data[0].set(num2buf(_.byteLength, Map.U32))

    if(arr)
      arr.push(_.join())

    if(!arr)
      return _.join()
    else
      return arr
  }

  static create(name){
    const _ = new this
    _.name = name
    return _
  }
}

export class FullBox extends Box{
  version = 0

  flag = 0

  container = false

  /**
   * @param {DV} dv 
   */
  constructor(dv){
    super(dv)

    if(!dv) return this
    this.version = dv.u8()
    this.flag = dv.u24()
  }
}