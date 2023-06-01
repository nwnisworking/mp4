/**
 * MP4 reader 
 * 
 * Read the atom structure of MP4 and return all known atoms in a form of array. 
 * It also records the start and end position so that user can extrapolate the data.
 */

/**
 * @param {DataView} file 
 * @param {number} i Cursor for finding the current offset 
 * @param {Array} children All the atoms in an Array Object
function reader(file, i = 0, children = []){
  const data = {children : []}
  data['size'] = file.getUint32(i)
  data['name'] = String.fromCharCode(...new Uint8Array(file.buffer.slice(i + 4, i + 8)))
  data['start'] = i
  data['end'] = i + data['size']
  
  switch(name){
    case 'dref' : case 'stsd' : i+= 4 // Atom contains additional 4 byte which returns the length of entries
    case 'meta' : i+= 4 // Atom contains version and flag 
    case 'moov' : 
    case 'trak' : 
    case 'edts' : 
    case 'mdia' : 
    case 'dinf' : 
    case 'stbl' : 
    case 'udta' : 
    case 'ilst' : 
    case 'minf' : 
      i+= 8 // Normal container atom
    break
    default :
      i+= size 
  }
  
  children.push(data)
  return i < file.byteLength ? reader(file, i, children) : children
}
