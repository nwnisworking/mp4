/**
 * MP4 reader 
 * 
 * Read the atom structure of MP4 and return all known atom positions in a form of array. 
 */

/**
 * @param {DataView} file 
 * @param {number} i Cursor for finding the current offset 
 * @param {Array} children All the atoms in an Array Object
 */
export function reader(file, i = 0, children = []){
		const size = file.getUint32(i), 
		name = String.fromCharCode(...new Uint8Array(file.buffer.slice(i + 4, i + 8))),
		y = {name, size, start : i, end : i + size}
	
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
				i+= 8
			break
			default :
				i+= size
		}
	
		children.push(y)

		return i < file.byteLength ? reader(file, i, children) : children
	}
