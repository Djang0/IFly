d = {
    2001:[16,1256,13,null],
    2002:[164,null,1256,135],
    2024:[16,125,13],
    2011:[165,16,11]
}
console.log(Object.keys(d).sort())
x=Object.keys(d).sort()
for(let y in x){
    console.log('-'+x[y])
    for (let z in d[x[y]]){
        console.log(d[x[y]][z])
    }
}