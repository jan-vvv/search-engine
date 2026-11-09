class InvertedIndex {
    constructor(){
        this.postings = new Map();

        this.docs = new Map();
    }

addDocument(docId , tokens , title="") {
    this.docs.set(docId, {
        id:docId,
        title,
        length: tokens.length,
    });

    const termCounts = new Map();

        for( const token of tokens ){
            termCounts.set(token , ( termCounts.get(token)|| 0)+1);
        }

        for( const[term ,tf ] of termCounts){
            if(!this.postings.has(term)){
                this.postings.set( term,[]);
            }
            this.postings.get(term).push({ docId , tf});
        }
}
  get documentCount() {
    return this.docs.size;
  }

  get averageDocumentLength(){
    if( this.documentCount === 0) return 0 ; 

    let totalLength = 0 ; 

    for( const doc of this.docs.values()){
        totalLength += doc.length;
    }

    return totalLength / this.documentCount ; 
  }

  get totalPostings(){
    let total = 0 ; 
    for( const list of this.postings.values()){
     total += list.length;
    }
    return total;
  }
}

module.exports = InvertedIndex;
