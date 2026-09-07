#!/usr/bin/env node
'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const core = require('./lib/freshness-contract');
const { loadReviewState } = require('./lib/freshness-review');
const { collect, render } = require('./lib/product-monitor/collector');
const products = [require('./lib/product-monitor/copilot'), require('./lib/product-monitor/gemini')];
function parseArgs(args) {
    const options = { live:false, state:path.join(__dirname,'../data/maintenance/product-monitor-state.json'), reports:null };
    for (let i=0;i<args.length;i++) {
        if (args[i] === '--live') options.live=true;
        else if (['--reports','--state'].includes(args[i])) {
            const key=args[i].slice(2), value=args[++i];
            if (!value || value.startsWith('--')) throw new Error(`Missing ${key} path`);
            options[key]=path.resolve(value);
        } else throw new Error(`Unknown argument ${args[i]}`);
    }
    if (!options.live) throw new Error('Pass --live to authorize the bounded public-source pilot');
    options.reports ||= path.join(__dirname,'../.verification-reports',`product-monitor-${new Date().toISOString().replace(/[:.]/g,'-')}`);
    if (options.state === options.reports || options.state.startsWith(options.reports+path.sep)) throw new Error('Keep durable state outside the run evidence directory');
    return options;
}
async function run(options) {
    if (options.live !== true) throw new Error('Live authorization is required');
    await fs.mkdir(options.reports,{recursive:true});
    if ((await fs.readdir(options.reports)).length) throw new Error('Use an empty evidence directory to preserve prior receipts');
    let latest;
    async function atomic(name,value) {
        const file=path.join(options.reports,name);
        await fs.writeFile(file+'.tmp',value); await fs.rename(file+'.tmp',file);
    }
    try {
        const state=await loadReviewState(options.state);
        const {report}=await collect({products,state,
            retainRaw:async(source,response)=>{
                if (response.rawBody) await atomic(source.id+'.html',response.rawBody);
                const {body,rawBody,...receipt}=response;
                await atomic(source.id+'-receipt.json',JSON.stringify(receipt,null,2)+'\n');
            },
            persist:async(current,report)=>{
                latest=report;
                await atomic('report.json',JSON.stringify(report,null,2)+'\n');
                await atomic('review-state.json',JSON.stringify(current,null,2)+'\n');
                await atomic('review-proposals.md',render(report));
                await core.saveState(options.state,current);
            }
        });
        console.log(JSON.stringify({status:report.status,requests:report.requests,sources:report.sources,proposals:report.proposals.length,reviewQueue:report.reviewQueue,report:path.join(options.reports,'report.json')},null,2));
        return report.status==='healthy'?0:report.status==='review_required'?1:2;
    } catch(error) {
        if(latest) {latest.status='failed';latest.failure=error.message;await atomic('report.json',JSON.stringify(latest,null,2)+'\n');await atomic('review-proposals.md',render(latest));}
        await atomic('failure.json',JSON.stringify({status:'failed',failedAt:new Date().toISOString(),message:error.message},null,2)+'\n');
        throw error;
    }
}
if(require.main===module) (async()=>{process.exitCode=await run(parseArgs(process.argv.slice(2)));})().catch(error=>{console.error(error.message);process.exitCode=2;});
module.exports={parseArgs,run};
