export default class Uint{
  data = []

  byteLength = 0

  constructor(u){
    if(u)
    this.push(u)
  }

  /**
   * 
   * @param  {...Uint8Array} u
   */
  push(...u){
    u.forEach(e=>{
      this.data.push(e)
      this.byteLength+= e.byteLength
    })

    return this
  }

  join(){
    const _ = new Uint8Array(this.byteLength)
    let i = 0

    for(let u of this.data){
      try{
        _.set(u, i)
        i+=u.byteLength
      }
      catch(e){}      
    }

    return _
  }

  static calculateSize(uint){
    let size = 0

    uint.forEach(e=>size+=e.byteLength)

    return size
  }
}