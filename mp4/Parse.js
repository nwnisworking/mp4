import Box, { FullBox } from "./Boxes.js"
import DV from "./util/DV.js"
import atoms from "./atoms.js"

export default class Parse{
  /** @type {DV} */
  dv

  /** @type {Array<Box>} */
  atoms = []

  constructor(buf){
    this.dv = new DV(buf)
  }

  init(){
    const { dv } = this
    const depth = []

    while(dv.offset < dv.byteLength){
      dv.offset+=4
      const name = dv.read(4)
      dv.offset-=8
      const atom = new (atoms[name] || Box)(dv)

      atom.parse()
      this.atoms.push(atom)
      dv.offset = atom.start

      if(atom.name === 'meta') dv.offset-=4

      if(atom.container)
        dv.offset+=8 + (atom instanceof FullBox ? 8 : 0)
      else
        dv.offset+=atom.size

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

    return this
  }

  get(name, index = 0){
    return this.atoms.filter(e=>e.name === name).at(index)
  }
}