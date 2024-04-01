import{command as i,option as a,string as e,subcommands as t,run as n}from"cmd-ts";import o from"node:crypto";import s from"node:fs";import r from"postgres";import c from"node:path";import*as l from"@sinclair/typebox";import{TypeCompiler as m}from"@sinclair/typebox/compiler";import"dotenv/config";const d="1874293567",g="1098375123",p="migrations",w=async i=>{const a=await(async i=>(await(i`
      SELECT EXISTS (
        SELECT FROM 
					pg_tables	
        where 
        	tablename = ${p} 
			)`))[0].exists)(i);if(!a)return[];return(await(i`
			SELECT id, checksum, execution_time_in_millis, applied_at
			FROM ${i(p)} 
			`)).map((i=>({id:i.id,checksum:i.checksum,executionTimeInMillis:i.execution_time_in_millis,appliedAt:i.applied_at})))},S=i=>o.createHash("md5").update(i,"utf8").digest("hex"),u=async i=>{const{sql:a,migration:e}=i,t=new Date,n=performance.now();await a.begin((async i=>{await i.unsafe(e.content);const a=performance.now(),o=Math.trunc(a-n),s=S(e.content);await(i`
		INSERT INTO ${i(p)} 
			(id, checksum, execution_time_in_millis, applied_at)
		VALUES 
			(${e.id}, ${s}, ${o}, ${t} )
			`)}))},E=async i=>{const a=(await s.promises.readdir(i)).filter((i=>i.endsWith(".sql")));return(i=>i.sort(((i,a)=>i.id.localeCompare(a.id))))(await Promise.all(a.map((async a=>{const e=await s.promises.readFile(`${i}/${a}`,"utf-8");return{id:a.replace(".sql",""),content:e}}))))},T=async i=>{const{sql:a,dir:e}=i,t=await w(a);return(await E(e)).filter((i=>!t.some((a=>a.id===i.id))))},f=async i=>{const{sql:a,dir:e}=i,t=await w(a),n=await E(e),o=[];for(const i of t){const a=n.find((a=>a.id===i.id));if(!a){o.push(`Migration ${i.id} not found`);continue}const e=S(a.content);i.checksum!==e&&o.push(`Migration ${a.id} checksum mismatch. Expected ${e}, got ${i.checksum}`)}if(o.length>0)throw new Error(o.join("\n"))},_=async i=>{const{sql:a,dir:e}=i;console.log("Acquiring lock..."),await(async i=>{if(!(await(i`
		SELECT pg_try_advisory_lock(${d}, ${g}) as acquired
		`))[0].acquired)throw new Error("Could not acquire lock")})(a),console.log("Ensuring migrations table..."),await(async i=>{await(i`
				CREATE TABLE IF NOT EXISTS ${i(p)} (
					id TEXT PRIMARY KEY,
					checksum TEXT NOT NULL,
					execution_time_in_millis BIGINT NOT NULL,
					applied_at TIMESTAMPTZ NOT NULL
				)
			`)})(a),console.log("Planning migrations...");const t=await T({sql:a,dir:e});console.log(t),console.log("Applying migrations...");for(const i of t)console.log(`Applying migration ${i.id}...`),await u({sql:a,migration:i});console.log("Verifying..."),await f({sql:a,dir:e}),console.log("Releasing lock..."),await(async i=>{if(!(await(i`
		SELECT pg_advisory_unlock(${d}, ${g}) as released
 `))[0].released)throw new Error("Could not release lock")})(a)},y=l.Object({POSTGRES_DB:l.String(),POSTGRES_HOST:l.String(),POSTGRES_PORT:l.String(),POSTGRES_USER:l.String(),POSTGRES_PASSWORD:l.String()}),h=m.Compile(y).Decode(process.env),O=()=>r({db:h.POSTGRES_DB,username:h.POSTGRES_USER,password:h.POSTGRES_PASSWORD,host:h.POSTGRES_HOST,port:+h.POSTGRES_PORT}),R=()=>c.join(process.cwd(),"migrations"),$=i({name:"migrate",args:{},handler:async()=>{const i=R(),a=O();await _({sql:a,dir:i}),await a.end({timeout:5})}}),q=i({name:"plan",args:{},handler:async()=>{const i=c.join(process.cwd(),"migrations"),a=O(),e=await T({sql:a,dir:i});for(const i of e)console.log(i.id);await a.end({timeout:5})}}),P=i({name:"reset",args:{},handler:async()=>{const i=O();await(async i=>{const{sql:a}=i;await(a`
		DROP TABLE IF EXISTS ${a(p)}
	`)})({sql:i}),await i.end({timeout:5})}});n(t({name:"pg-migrate",cmds:{verify:i({name:"verify",args:{},handler:async()=>{const i=c.join(process.cwd(),"migrations"),a=O();await f({sql:a,dir:i}),await a.end({timeout:5})}}),plan:q,migrate:$,reset:P,new:i({name:"new",args:{name:a({type:e,long:"name",short:"n",defaultValue:()=>""}),dir:a({type:e,long:"dir",short:"d",defaultValue:()=>R()})},handler:async({name:i,dir:a})=>{console.log("Creating migration..."),await s.promises.writeFile(c.join(a,`${Date.now()}${i?`-${i}`:""}.sql`),`-- ${i}\n`)}})}}),process.argv.slice(2));
