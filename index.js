const { MongoClient, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { parse, serialize } = require("cookie");

let clientPromise;
function client(){
  if(!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured");
  if(!clientPromise) clientPromise = new MongoClient(process.env.MONGODB_URI).connect();
  return clientPromise;
}
async function db(){
  const c=await client();
  return c.db(process.env.MONGODB_DB || "cyberfolio");
}
function json(res,status,data){
  res.statusCode=status;res.setHeader("Content-Type","application/json");res.end(JSON.stringify(data));
}
function body(req){
  return new Promise((resolve,reject)=>{
    let raw="";req.on("data",c=>{raw+=c;if(raw.length>100000)reject(new Error("Payload too large"))});
    req.on("end",()=>{try{resolve(JSON.parse(raw||"{}"))}catch(e){reject(new Error("Invalid JSON"))}});
  });
}
function auth(req){
  const cookies=parse(req.headers.cookie||"");
  if(!cookies.cf_session) return null;
  try{return jwt.verify(cookies.cf_session,process.env.JWT_SECRET)}catch{return null}
}
function clean(v,max){return typeof v==="string"?v.trim().slice(0,max):""}

module.exports=async(req,res)=>{
  res.setHeader("Access-Control-Allow-Origin", process.env.PUBLIC_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Credentials","true");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS"){res.statusCode=204;return res.end()}

  try{
    const url=new URL(req.url,"http://localhost");
    const path=url.pathname.replace(/\/+$/,"");

    if(req.method==="POST" && path==="/api/contact"){
      const b=await body(req);
      const name=clean(b.name,80), email=clean(b.email,120), phone=clean(b.phone,30);
      const message=clean(b.message,2000), websiteType=clean(b.websiteType,50), budget=clean(b.budget,50);
      if(!name||!email||!message) return json(res,400,{error:"Name, email and project details are required."});
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res,400,{error:"Please enter a valid email."});
      const database=await db();
      await database.collection("requests").insertOne({name,email,phone,websiteType,budget,message,status:"New",note:"",createdAt:new Date()});
      return json(res,201,{ok:true});
    }

    if(req.method==="POST" && path==="/api/admin/login"){
      const b=await body(req);
      if(!process.env.ADMIN_USERNAME||!process.env.ADMIN_PASSWORD||!process.env.JWT_SECRET) return json(res,500,{error:"Admin environment variables are not configured."});
      if(b.username!==process.env.ADMIN_USERNAME || b.password!==process.env.ADMIN_PASSWORD) return json(res,401,{error:"Invalid username or password."});
      const token=jwt.sign({role:"admin"},process.env.JWT_SECRET,{expiresIn:"7d"});
      res.setHeader("Set-Cookie",serialize("cf_session",token,{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:604800}));
      return json(res,200,{ok:true});
    }

    if(req.method==="POST" && path==="/api/admin/logout"){
      res.setHeader("Set-Cookie",serialize("cf_session","",{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:0}));
      return json(res,200,{ok:true});
    }

    if(path==="/api/admin/requests"){
      if(!auth(req)) return json(res,401,{error:"Unauthorized"});
      const database=await db();
      if(req.method==="GET"){
        const requests=await database.collection("requests").find({}).sort({createdAt:-1}).limit(200).toArray();
        return json(res,200,{requests});
      }
      return json(res,405,{error:"Method not allowed"});
    }

    const match=path.match(/^\/api\/admin\/requests\/([a-f0-9]{24})$/i);
    if(match){
      if(!auth(req)) return json(res,401,{error:"Unauthorized"});
      const id=new ObjectId(match[1]), database=await db();
      if(req.method==="PATCH"){
        const b=await body(req);
        const status=["New","Contacted","Working","Completed"].includes(b.status)?b.status:"New";
        const note=clean(b.note,1000);
        await database.collection("requests").updateOne({_id:id},{$set:{status,note,updatedAt:new Date()}});
        return json(res,200,{ok:true});
      }
      if(req.method==="DELETE"){
        await database.collection("requests").deleteOne({_id:id});
        return json(res,200,{ok:true});
      }
      return json(res,405,{error:"Method not allowed"});
    }

    return json(res,404,{error:"Not found"});
  }catch(e){
    console.error(e); return json(res,500,{error:"Server error"});
  }
};