import Map from "./Map.js"

export const _1904 = new Date('1904-01-01T00:00:00Z').getTime()

export function convertNumber(value, byte, type = 'str'){
  const a = []
  value = BigInt(value)

  while(byte){
    a.unshift(Number(value & 0xffn))
    value>>= 8n
    byte--
  }

  if(type === 'str')
    return String.fromCharCode(...a)
  else
    return a
}

export function toStr(v, o){
  let typ = o >> 16 << 16
  let len = o ^ typ

  if(Array.isArray(v))
    return v.map(e=>toStr(e, o)).join('')

  switch(typ){
    case Map.U8 : return convertNumber(v, 1)
    case Map.U16 : return convertNumber(v, 2) 
    case Map.U32 : return convertNumber(v, 4) 
    case Map.U64 : return convertNumber(v, 8)
    case Map.STR : return v.slice(0, len ? len : undefined)
    case Map.BUF : return (new Uint8Array(v)).reduce((p, e)=>p+=String.fromCharCode(e), '')
    default : return '\x00'.repeat(len)
  }
}

export function deepClone(obj) {
  if (obj === null || typeof obj !== "object")
    return obj
  var props = Object.getOwnPropertyDescriptors(obj)
  for (var prop in props) {
    props[prop].value = deepClone(props[prop].value)
  }
  return Object.create(
    Object.getPrototypeOf(obj), 
    props
  )
}
