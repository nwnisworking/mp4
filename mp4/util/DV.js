export default class DV extends DataView{
  offset = 0

  u8(){ return super.getUint8((this.offset+=1) - 1) }

  u16(){ return super.getUint16((this.offset+=2) - 2) }
  
  u32(){ return super.getUint32((this.offset+=4) - 4) }
  
  u64(){ return super.getBigUint64((this.offset+=8) - 8) }

  i8(){ return super.getInt8((this.offset+=1) - 1) }

  i16(){ return super.getInt16((this.offset+=2) - 2) }
  
  i32(){ return super.getInt32((this.offset+=4) - 4) }
  
  i64(){ return super.getBigInt64((this.offset+=8) - 8) }
  
  u24(){ return this.u8() << 16 | this.u16() }

  read(len){
    let s = ''

    if(len === 0)
      return s
    
    do
      s+= String.fromCharCode(this.u8())
    while(len && --len)

    return s
  }

  buf(e){
    return this.buffer.slice(this.offset, this.offset+=e)
  }
}