export default class DV extends DataView{
  offset = 0

  getU8(){
    return super.getUint8((this.offset+= 1) - 1)
  }

  getU16(){
    return super.getUint16((this.offset+= 2) - 2)
  }

  getU24(){
    return this.getU8() << 16 | this.getU16()
  }

  getU32(){
    return super.getUint32((this.offset+= 4) - 4)
  }

  getU64(){
    return super.getBigUint64((this.offset+= 8) - 8)
  }

  read(len){
    let s = ''
    while(len){
      s+= String.fromCharCode(this.getU8())
      len--
    }

    return s
  }
}