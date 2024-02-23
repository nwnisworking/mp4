export default class List{
  #map
  
  constructor(...data){
    this.#map = new Map(data)
  }

  set(kv){
    this.#map.set(...kv)
    return this
  }

  keys(){
    return this.#map.keys()
  }

  *map(){
    for(let [k,v] of this.#map)
      yield [k, v]
  }

  [Symbol.iterator](){
    return this.map()
  }
}