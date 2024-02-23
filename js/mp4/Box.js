import DV from "./util/DV.js"
import List from "./util/List.js"
import { CONT, STR, U8, U16, U24, U32, U64, num2str, value } from "./util/helper.js"

function nestedValue(key, o){
  for(let k of key.split('.')){
    if(typeof o[k] === 'undefined')
      return o[k]
    else if(typeof o[k] === 'object')
      o = o[k]
    else
      return o[k]

    return o
  }
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
   * @type {List} 
   */
  map = ()=>new List
  
  /** 
   * List of children atoms
   * @type {Array<Box>} 
   */
  items = []
  
  /** 
   * Ignore box when stringifying
   * @type {boolean} 
   */
  ignore = false
  
  /** 
   * A container that holds other atoms
   * @type {boolean} 
   */
  container = true
  
  /** @type {DV} */
  dv

  /** @type {boolean} */
  has_parsed = false

  /**
   * 
   * @param {DV} dv 
   */
  constructor(dv){
    if(!dv) return this
    this.dv = dv
    this.start = dv.offset
    this.size = dv.getU32()
    this.end = this.start + this.size
    this.name = dv.read(4)
  }

  /**
   * Get named descendant box(es) in the current box
   * @param {string} name 
   * @param {number} index 
   * @param {Array} arr 
   */
  get(name, index = 0, arr = []){
    return this.#get(name, arr).at(index)?.parse()
  }

  all(name){
    return this.#get(name, []).map(e=>e.parse())
  }

  #get(name, arr){
    return this.items.reduce((p, e)=>{
      if(name !== e.name)
        return e.#get(name, arr)

      p.push(e)

      return p
    }, arr)
  }

  parseChildren(){
    this.items.forEach(e=>{
      e.parse().parseChildren()
    })

    return this
  }

  parse(){
    if(this.has_parsed) return this
    this.has_parsed = true

    const fn = {
      [U8] : 'getU8', 
      [U16] : 'getU16', 
      [U24] : 'getU24', 
      [U32] : 'getU32', 
      [U64] : 'getU64', 
      [STR] : 'read', 
      [CONT] : 'read'
    }

    if(!this.dv) return this

    this.dv.offset = this.start + 8 + (this instanceof Fullbox ? 4 : 0)
    
    for(let [key, val] of this.map()){
      if(typeof key === 'symbol'){
        this.dv.offset+= val
        continue
      }

      let o = this
      let typ = val >> 16 << 16
      let len = typ ^ val

      for(let k of key.split('.'))
        if(typeof o[k] === 'object')
          o = o[k]
        else
          if(!k.includes('['))
            o[k] = this.dv[fn[typ]](len || this.end - this.dv.offset)
          else
            for(let i = 0; i < nestedValue(k.slice(1, -1), this); i++)
              if(typeof val !== 'object')
                o.push(this.dv[fn[typ]](len || this.end - this.dv.offset))
              else
                o.push(Object.keys(val).reduce((p, e)=>{
                  let typ = val[e] >> 16 << 16
                  let len = typ ^ val[e]

                  p[e] = this.dv[fn[typ]](len || this.end - this.dv.offset)
                  return p
                }, {}))
      
    }

    return this
  }

  toString(){
    let s = this.name + (Number.isInteger(this.version) ? num2str(this.version << 16 | this.flag, 4) : '')

    for(let [k, v] of this.map()){
      let c = this[k]


      if(typeof k === 'string' && k.includes('.')){
        let o = this
        k.split('.').forEach(e=>e.match(/\[.+\]/) ? null : o = o[e])
        c = o
      }

      if(typeof v === 'object'){
        if(Array.isArray(c)){
          for(let i of c){
            let a, b, c = Object.values(v), d = Object.values(i)

            while(Number.isInteger((a = c.shift()) && (b = d.shift()))){
              s+= value(b, a)
            }
          }
        }
      }
      else if(typeof k === 'symbol'){
        s+= '\x00'.repeat(v)
      }
      else{
        s+= value(c, v)
      }
    }

    let item = this.items.filter(e=>!e.ignore).join('')

    return value(s.length + 4 + item.length, U32) + s + item
  }

  static create(name){
    const _ = new this
    _.name = name
    return _
  }
}

export class Fullbox extends Box{
  version = 0

  flag = 0

  container = false

  /**
   * 
   * @param {DV} dv 
   */
  constructor(dv){
    super(dv)

    if(!dv) return this
    this.version = dv.getU8()
    this.flag = dv.getU8() << 16 | dv.getU16()
  }
}