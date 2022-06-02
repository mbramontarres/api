export async function searchGaps(lastBlock,db,BlockSchema) {

    const result = await findIntervals(0,lastBlock,db,BlockSchema);

    console.log("Gaps:")
    result.forEach(element=>{
        console.log("[",element.l,"-",element.r,"]");
    })
    return result;   
}

async function findIntervals(min,max,db,BlockSchema) {
    var c = await count(min,max,db,BlockSchema);
    if (c==0) return new Array({l:min,r:max});
    if (c==max-min+1) return new Array();
    var mig = Math.floor((min+max)/2);
    var intervalsLeft=await findIntervals(min,mig,db,BlockSchema);
    var intervalsRight=await findIntervals(mig+1,max,db,BlockSchema);
    if (intervalsLeft.length>0 && intervalsRight.length>0 && intervalsLeft[intervalsLeft.length-1].r==intervalsRight[0].l-1){
        intervalsLeft[intervalsLeft.length-1].r=intervalsRight[0].r;
        intervalsRight.shift();
    }
    return intervalsLeft.concat(intervalsRight);
}

async function count(min,max,db,BlockSchema) {
    const agr = [{
        $match: 
            { 
                $and: [
                  {blockNum: {$gte: min}},
                  {blockNum: {$lte: max}}
                  ]
            }
        }, 
        {
            $count: 'count'
        }];    
    const results = await db.model('blocks', BlockSchema).aggregate(agr);
    //console.log(cursor);
    //const results = await cursor.toArray();
    return results[0]? results[0].count : 0;
}