export const _1904 = new Date('1904-01-01T00:00:00Z').getTime()

export const KV = (k, v)=>[k, v]

export const Reserved = len=>KV(Symbol(), len)

export const U8 = (1 << 0) << 16

export const U16 = (1 << 1) << 16

export const U24 = (1 << 2) << 16

export const U32 = (1 << 3) << 16

export const U64 = (1 << 4) << 16

export const STR = (1 << 6) << 16

export const CONT = STR | ((1 << 5) << 16)

export function convertNumber(value, byte){
  const a = []
  value = BigInt(value)

  while(byte){
    a.unshift(Number(value & 0xffn))
    value>>= 8n
    byte--
  }

  return String.fromCharCode(...a)
}

export function value(v, option){
  let typ = option >> 16 << 16
  let len = v & (1 << 16) - 1

  if(Array.isArray(v))
    return v.map(e=>value(e, option)).join('')

  switch(typ){
    case U8 : return convertNumber(v, 1)
    case U16 : return convertNumber(v,2)
    case U32 : return convertNumber(v, 4)
    case U64 : return convertNumber(v, 8)
    case STR : return v.slice(0, len ? len : undefined)
    case CONT : return v.slice(0, undefined)
    default : return '\x00'.repeat(len)
  }
}

export function toHex(e){
  return e.split('').map(e=>e.charCodeAt(0).toString(16).padStart(2, 0))
}

export function num2str(v, byte){
  const a = []
  v = BigInt(v)

  while(byte){
    a.unshift(Number(v & 0xffn))
    v>>= 8n
    byte--
  }

  return String.fromCharCode(...a)
}