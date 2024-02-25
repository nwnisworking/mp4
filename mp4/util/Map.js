export default class Map{
  static U8 = 1 << 16

  static U16 = 2 << 16

  static U24 = this.U8 | this.U16

  static U32 = 4 << 16

  static U64 = 8 << 16

  static INT = 16 << 16

  static I8 = this.U8 | this.INT
  
  static I16 = this.U16 | this.INT
  
  static I32 = this.U32 | this.INT
  
  static I64 = this.U64 | this.INT

  static STR = this.U8 | this.U16 | this.U32 | this.U64
  
  static BUF = this.I8 | this.I16 | this.I32 | this.I64
  
  #data = []

  constructor(...data){
    this.#data.push(...data)
  }

  static u8(key){ return this.set(key, this.U8) }
  
  static u16(key){ return this.set(key, this.U16) }
  
  static u24(key){ return this.set(key, this.U24) }
  
  static u32(key){ return this.set(key, this.U32) }
  
  static u64(key){ return this.set(key, this.U64) }

  static i8(key){ return this.set(key, this.I8) }
  
  static i16(key){ return this.set(key, this.I16) }
  
  static i32(key){ return this.set(key, this.I32) }
  
  static i64(key){ return this.set(key, this.I64) }

  static str(key, len = 0){
    return this.set(key, this.STR | len)
  }
 
  static buf(key){
    return this.set(key, Map.BUF)
  }

  static res(len){
    return this.set(Symbol(), len)
  }


  u8(key){ 
    return this.set(key, Map.U8)
  }

  u16(key){
    return this.set(key, Map.U16)
  }

  u24(key){
    return this.set(key, Map.U24)
  }

  u32(key){
    return this.set(key, Map.U32)
  }

  u64(key){
    return this.set(key, Map.U64)
  }

  i8(key){
    return this.set(key, Map.I8)
  }

  i16(key){
    return this.set(key, Map.I16)
  }

  i32(key){
    return this.set(key, Map.I32)
  }

  i64(key){
    return this.set(key, Map.I64)
  }
  
  str(key, len){
    return this.set(key, Map.STR | len)
  }
 
  buf(key){
    return this.set(key, Map.BUF)
  }

  res(len){
    return this.set(Symbol(), len)
  }

  set(key, type){
    this.#data.push(Map.set(key, type))
    return this
  }

  static set(k, v){return [k, v]}

  static getType(op){
    op>>=16
  
    switch(op){
      case 15 : return 'read'
      case 31 : return 'buf'
      default : return (op & (this.INT >> 16) ? 'i' : 'u') + op * 8
    }
  }

  *[Symbol.iterator](){
    for(let i of this.#data)
      yield i
  }
}