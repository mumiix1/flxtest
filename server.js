const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const cors=require('cors');
const fileUpload = require("express-fileupload");
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const useragent = require('express-useragent');
const sendgridClient = require('@sendgrid/client');
const handlebars = require('handlebars');
const sgMail = require('@sendgrid/mail')




let axios=require('axios');
app.use(expressLayouts);

const OS = require('opensubtitles.com')
const os = new OS({apikey: 'TY51Na9C9Q61Kmd2hLtPker9Q4M2qztx'})

const fs = require('fs');
const path=require('path');
const PORT=4000;
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true,
    limit: "400mb",
    parameterLimit:500000
}));
app.use(fileUpload());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json(
    {
        limit: "1000mb"
    }
));

app.use(useragent.express());
app.use(express.static('public'))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use('/static', express.static(path.join(__dirname, 'public')))
app.set('layout', './frontend/partials/layout');
const dotenv = require('dotenv');
dotenv.config();

let Device=require('./models/Device.model');
let PlayList=require('./models/PlayList.model');
let Language=require('./models/Language.model');
let Word=require('./models/Word.model');
let LanguageWord=require('./models/LanguageWord.model');
let Setting=require('./models/Setting.model');
let Transaction=require('./models/Transaction.model');


if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const passport = require('passport')
const flash = require('express-flash')
// const session = require('express-session')
const session = require('cookie-session')
const methodOverride = require('method-override');

app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
if(process.env.NODE_ENV==='develop')
    mongoose.connect('mongodb://127.0.0.1:27017/Flix', { useNewUrlParser: true,useUnifiedTopology: true});
else
    mongoose.connect('mongodb+srv://flixapp:Bita**2016%23@cluster0.pxiwd.mongodb.net/FlixIPTV?retryWrites=true&w=majority', { useNewUrlParser: true,useUnifiedTopology: true});
const connection = mongoose.connection;
connection.once('open',
    async function() {
        console.log("MongoDB database connection established successfully");
        getSettings();
        await removePendingTransactions();
    }
)

connection.on('connected', () => {
    console.log('Connected to MongoDB');
});
connection.on('error', (err) => {
    console.error('Failed to connect to MongoDB', err);
});
app.listen(PORT,function () {
    console.log('Server is running on Port: '+PORT);
})

global.settings={
    stripe_secret_key: '',
    news_meta_keyword: 'news, iptv news, news iptv apk, player iptv news, flixiptv news, iptv news reddit, news about iptv, iptv box news, iptv breaking news, about flix iptv, flixiptv information, iptv apk, iptv angebote, iptv aufnehmen, iptv e legal',
    instruction_meta_keyword: ' Introduction flix iptv, flix iptv introduction, iptv droid, iptv legal, flixiptv, flixIPTV, iptv introduction, iptv solution introduction, introduction to iptv, TV movies, flix reviews, flix  cinema, flix IPTV PLAYER apk, iptv community, iptv download tv,iptv editor, iptv app android tv,\tiptv app apk, iptv app google play,iptv app apple tv 4k, iptv app android phone, iptv app android apk, iptv apple tv reddit ',
    mylist_meta_title: 'My List upload - Flix IPTV',
    mylist_meta_keyword: 'iptv list github, iptv list reddit, iptv list editor, iptv list apk, iptv list update, iptv lists apk, flix TV iptv apk, flixiptv mylist, flix iptv mylist, flix iptv apk, netflix iptv, flix tv iptv, free flix iptv apk, simple iptv mylist, net iptv mylist, flix iptv app on Android tv, flix iptv app on Android, flix iptv app for smart TV,',
    stripe_public_key: '',
    news_meta_content: 'Flix IPTV application does not include any channels and no information will be provided about where you can get channels or channel packages.',
    support_meta_title: 'Flix IPTV SUPPORT',
    support_meta_keyword: ' iptv support, flix iptv support, support flix iptv, support flix, flix support, iptv box, tv8, is iptv legal, iptv player, iptv smarters pro apk, iptv encoder, iptv extreme pro, iptv supported player, iptv supported formats, iptv smarters support, smart iptv app support, does iptv support 4k, iptv smarters apk, a iptv player apk, iptv box kaufen, iptv e chromecast ',
    instruction_meta_content: ' You can find any information about how to use our app on your devices,. Visit our instruction page for seen more information about supported devices and how to use them. ',
    activation_meta_title: 'Flix IPTV ACTIVATION',
    activation_meta_keyword: 'activation, iptv activation, legal activation iptv legal use, use iptv lega, iptv player legal, legal iptv player, m3u activation, m3u use, m3u8 iptv, iptv m3u links activation, m3u free, iptv links, flix iptv activation code, free flix iptv, flixiptv billing, flix iptv billing',
    activation_meta_content: 'The application is free for 7 days trial period. You can try the feature you want and discover all kinds of content. If you are satisfied for seven days, you have to activate your account. Activation is done on the site and is for once. You can easily activate it in a short time.',
    privacy_meta_title: 'Flix IPTV PRIVACY POLICY.',
    egp_currency_converter_api_key: '945d3e1f7981131c556c',
    support_meta_content: ' Flix IPTV support will show you how to use the app on devices like SMART TV, Mobile devices, and android tv`s ',
    mylist_meta_content: 'You can upload your playlist via mylist, after uploading a list you should restart you app. You can try our app for 7 days free. After 7 days you should activate it.',
    terms_meta_title: 'Flix IPTV TERMS AND CONDITIONS',
    terms_meta_keyword: 'flix IPTV, Terms and CONDITIONS, binding, terms and conditions, terms of iptv, iptv terms and conditions, flixiptv terms and conditions,',
    terms_meta_content: 'This document constitutes a legally binding agreement between you as a user of the Site flixiptv.com defined as you, your, User or Seller, as the case may be) and flix IPTV.',
    privacy_meta_content: 'This page ist o ilustrate visitors regarding our policies with collection, using, and disclousure of Personal data. When a user dicided to use our Service this policies would be automaticaly applied by the user.  If you choose our service, then you agree to collection and use of information in relation to this policy. We use the personal information providing and improving the service. We don`t use or share any information with other people or companies exceptet as described',
    news_meta_title: 'Flix IPTV NEWS',
    instruction_meta_title: 'INSTRUCTION',
    privacy_meta_keyword: 'Privacy and Policy, privacy policy, flix iptv privacy, flix iptv policy, IPTV policy, IPTV privacy, M3u, m3u8, iptv m3u',
    paypal_mode: 'live',
    show_paypal: '0',
    show_stripe: '0',
    paypal_client_id: '',
    paypal_secret: '',
    price: '7.49',
    themes: [
        {
            "name": "Standart",
            "url": "/public/upload/1633151781.png"
        },
        {
            "name": "Purple",
            "url": "/public/upload/1633151823.png"
        },
        {
            "name": "Purple blue",
            "url": "/public/upload/1633151823.jpg"
        },
        {
            "name": "Lila",
            "url": "/public/upload/1633280835.png"
        },
    ],
    support_email:'info@flixiptv.net',
    demo_url: 'http://flixiptv.cc/demo.m3u',
    paymentwall_project_key:"d1499447453336e318dc4f8e787cf7d1",
    paymentwall_secret_key:"4d3c8ed42e4d1d6430a554817e51a66e",
    apk_url:'/upload/android_1.1.apk',
    android_version_code:'1.1',
    adverts:[
        {
            title: "Flix IPTV",
            description: "Best Media Player in the world.",
            url: "/public/upload/1604854505.png"
        }
    ],
    crypto_public_key:'bd99bfed1e98dea341bdda5674409319f82575d67459eb2ae88f8511543e9d06',
    crypto_private_key:'4aa591bdd9f16D27Cd54c3a1979bbD462B782E8F56d3BA58798823b983d9aB6A',
    crypto_merchant_id:'48ac627c05bb587ad24336af352ccf67',
    crypto_ipn_secret:'qS2A7ihHLdQkHym',
    valid_user_agent_keys:['tizen','smart-tv'],
    quzu_ip:'212.8.250.73',
    sendgrid_template_id:'d-9fc7f92b33c245e4b1c90b714a8ecf34',
    sendgrid_email_from:'info@flixapp.tv',
    sendgrid_api_key:'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',
    youtube_api_key:''
}
global.getSettings=function(){
    let promises=[];
    promises.push(new Promise((resolve, reject)=>{
        Setting.find().then(settings=>{
            resolve(settings);
        })
    }))
    promises.push(new Promise((resolve, reject)=>{
        Word.find().then(words=>{
            resolve(words);
        })
    }))
    promises.push(new Promise((resolve, reject)=>{
        Language.find().select('_id code name').then(languages=>{
            resolve(languages);
        })
    }))
    promises.push(new Promise((resolve, reject)=>{
        LanguageWord.find().select('language_id word_id value').then(language_words=>{
            resolve(language_words);
        })
    }))
    settings.trial_days=7;
    Promise.all(promises).then(
        values=>{
            let words=values[1],languages=values[2],language_words=values[3];
            let words_map={},language_word_map={};
            words.map(word=>{
                words_map[word._id]=word.name;
            })
            language_words.map(item=>{
                if(typeof language_word_map[item.language_id]!='undefined')
                    language_word_map[item.language_id].push(item);
                else
                    language_word_map[item.language_id]=[item];
            })
            let language_result=[];
            for(let i=0;i<languages.length;i++){
                let item=languages[i];
                let temps_map={};
                if(typeof language_word_map[item._id]!='undefined'){
                    let temps=language_word_map[item._id];
                    temps.map(temp=>{
                        let word_key=words_map[temp.word_id];
                        temps_map[word_key]=temp.value;
                    })
                    language_result.push({
                        code:item.code,
                        name:item.name,
                        words:temps_map
                    });
                }
            }
            let temps1=values[0]
            let temps2={}
            temps1.map(item=>{
                temps2[item.key]=item.value
            })
            console.log(temps1.sendgrid_api_key);
            temps2.themes=JSON.parse(temps2.themes);
            temps2.adverts=JSON.parse(temps2.adverts);
            temps2.languages=language_result;
            temps2.valid_user_agent_keys=temps2.valid_user_agent_keys.trim().split('\r\n');
            settings=temps2;
        },
        error=>{
            console.log('Get Settings Error',error);
        }
    )
}
let moment = require('moment');
let momentz = require('moment-timezone');

app.locals.moment = moment;
let request_per_minute=0,
    api_request_per_minute=0, website_request_per_minute=0;


global.blocked_mac_address={};
// global.coupon_failed_count={}
global.admin_auth_failed_count={};
global.block_ip_address_lists={};
global.app_api_request_lists={};
global.ip_req_count={};
global.mac_req_count={};


// app.use(function (req, res, next) {
//     var ip = getClientIPAddress(req);
//     let originalUrl=req.originalUrl;
//     if(block_ip_address_lists[ip]){
//         if(originalUrl.includes('/api'))
//             return res.json({status:'false',msg:'Sorry, you are blocked'});
//         else
//             return res.send('Sorry, you are blocked');
//     }
//     let browser=req.useragent.browser;
//     let platform=req.useragent.platform;
//     // if(process.env.NODE_ENV!='develop'){
//     //     if(browser.includes('Postman'))
//     //         return res.send('Access disabled');
//     //     if(platform==='Microsoft Windows' && originalUrl.includes('api'))
//     //         return res.send('Access disabled');
//     // }
//     if(ip_req_count[ip]){
//         ip_req_count[ip].count+=1;
//         ip_req_count[ip].urls.push(req.originalUrl);
//         if(ip_req_count[ip].count>=150){
//             block_ip_address_lists[ip]={
//                 reason:'too many request in 1 minutes'
//             };
//         }
//     }
//     else{
//         ip_req_count[ip]={
//             count:1,
//             urls:[req.originalUrl]
//         }
//     }
//     if(originalUrl.includes('api')){
//         api_request_per_minute+=1;
//     }
//     else
//         website_request_per_minute+=1;
//     request_per_minute+=1;
//     next()
// })
//
// setInterval(()=>{
//     let flag=false;
//     if(Object.keys(block_ip_address_lists)>0){
//         console.log('Blocked IP Address Lists',block_ip_address_lists)
//         flag=true;
//     }
//     // if(Object.keys(coupon_failed_count)>0){
//     //     console.log('Failed Coupon Count Lists',coupon_failed_count)
//     //     flag=true;
//     // }
// }, 5*60*1000);


// We will count the req count for 10 seconds, and if it is greater than some amount,
// then will send firewall block ip address request
app.use(function (req, res, next) {
    var ip = getClientIPAddress(req);
    let originalUrl=req.originalUrl;
    let is_api_url=originalUrl.includes('/api');
    if(ip_req_count[ip]){
        ip_req_count[ip].count+=1;
        if(is_api_url)
            ip_req_count[ip].api_req_count+=1;
        else
            ip_req_count[ip].web_req_count+=1;
        ip_req_count[ip].urls.push(req.originalUrl);
    }
    else{
        ip_req_count[ip]={
            count:1,
            web_req_count:is_api_url ? 0 : 1,
            api_req_count:is_api_url ? 1 : 0,
            urls:[req.originalUrl]
        }
    }
    // if(originalUrl.includes('api')){
    //     api_request_per_minute+=1;
    // }
    // else
    //     website_request_per_minute+=1;
    // request_per_minute+=1;
    next()
})

setInterval(()=>{  // will remove ip req count array.
    // console.log("removing ip req count");
    ip_req_count={};
}, 60000);

setInterval(()=>{  // will remove ip req count array.
    let promises=[];
    let ips=[], blocked_mac_reqs=[];
    let activity_time=moment().utc().format('Y-MM-DD HH:mm:ss');
    let description="Blocked from flixapp.tv automatically at "+activity_time;

    let top_mac_reqs=getSortedResult(mac_req_count,'count',35);
    let block_mac_reqs=top_mac_reqs.slice(0,200);
    block_mac_reqs.map(item=>{
        let ip=item.ip;
        ips.push(ip);
        promises.push(sendBlockReqToCloudFlare(ip, description));
        blocked_mac_reqs.push(mac_req_count[ip]);
        delete mac_req_count[ip];
    })

    if(block_mac_reqs.length<200){
        let temps=getSortedResult(mac_req_count,'count',5);
        let new_block_mac_reqs=[];
        temps.map(item=>{
            let mac_addresses=item.mac_addresses;
            let sub_mac=mac_addresses[0].slice(0,9);
            let same=true;
            for(let i=1;i<mac_addresses.length;i++){
                if(!mac_addresses[i].includes(sub_mac))
                {
                    same=false;
                    break;
                }
            }
            if(same)
                new_block_mac_reqs.push(item);
        })
        // console.log("new_block_mac_reqs=",new_block_mac_reqs);
        new_block_mac_reqs.map(item=>{
            let ip=item.ip;
            ips.push(ip);
            promises.push(sendBlockReqToCloudFlare(ip, description));
            blocked_mac_reqs.push(mac_req_count[ip]);
            delete mac_req_count[ip];
        })
    }
    if(promises.length>0){
        Promise.all(promises).then(()=>{
            console.log('Following IPS blocked',ips,blocked_mac_reqs)
        })
    }else {
        console.log("No one blocked this time");
    }
    issue_req_count={};
}, 5*60000);


const frontend_route=require('./routes/frontend');
const admin_route=require('./routes/admin')
const api_route=require('./routes/api');
const reseller_route=require('./routes/reseller')
app.use('/',frontend_route);
app.use('/admin/',admin_route)
app.use('/api',api_route);
app.use('/reseller/',reseller_route);

async function removePendingTransactions(){
    let day=moment().subtract('5','days').format('Y-MM-DD');
    await Transaction.deleteMany({pay_time:{$lte:day},status:'pending'});
}

global.getClientIPAddress=(req)=>{
    try{
        let ip_lists=req.headers['x-forwarded-for'].split(',');
        return ip_lists[0].trim();
    }catch (e){
        return "127.0.0.1"
    }
}
global.getUserAgent=(req)=>{
    let user_agent='';
    try{
        user_agent=req.useragent.source;
    }catch (e){
    }
    return user_agent;
}
global.getObjectFromArray=(source_array, key, type, extract_key=null)=>{
    // type can be single or array.
    let result_map={};
    if(type==='array'){
        if(extract_key){  // if null, get entire object, else, just get the value of extract_key
            source_array.map(item=>{
                if(result_map[item[key]])
                    result_map[item[key]].push(item[extract_key]);
                else
                    result_map[item[key]]=[item[extract_key]];
            })
        }else {
            source_array.map(item=>{
                if(result_map[item[key]])
                    result_map[item[key]].push(item);
                else
                    result_map[item[key]]=[item];
            })
        }
    }else {
        if(extract_key){  // if null, get entire object, else, just get the value of extract_key
            source_array.map(item=>{
                result_map[item[key]]=item[extract_key];
            })
        }else {
            source_array.map(item=>{
                result_map[item[key]]=item;
            })
        }
    }
    return result_map;
}

global.getSortedResult=function(source_obj, count_key='count',min_count=2){
    let temps=[];
    Object.keys(source_obj).map(key=>{
        temps.push({
            ip:key,
            ...source_obj[key]
        })
    })
    let sorted_result = temps.sort( (a,b) => a[count_key] < b[count_key] ? 1:-1 );
    let final_result=sorted_result.filter(item=>{
        if(item[count_key]>=min_count)
            return true;
    })
    return final_result;
}

global.sendBlockReqToCloudFlare=async(ip, description)=>{
    if(!description)
        description="Blocked from flixapp.tv server automatically"
    return new Promise((resolve, reject)=>{
        axios.post("https://api.cloudflare.com/client/v4/user/firewall/access_rules/rules",
            {
                "mode":"block",
                "configuration":{
                    "target":"ip",
                    "value":ip
                },
                "notes":description
            },
            {
                headers:{
                    "X-Auth-Email":"info@flixiptv.eu",
                    "X-Auth-Key":"baf2ba8b406a999f9234bb78b8fa7b606108a",
                    "Content-Type":"application/json"
                }
            }
        ).then(
            ()=>{
                resolve();
            },
            error=> {
                console.log("cloudflare block request error",error);
                resolve()
            }
        )
    })
}

app.get('/get_ip_request_count',(req,res)=>{
    return res.json({
        mac_req_count:getSortedResult(mac_req_count,'count',2)
    })
})

app.get('/test-block-ip/:ip',(req, res)=>{
    let {ip}=req.params;
    let promises=[];
    promises.push(sendBlockReqToCloudFlare(ip));
    Promise.all(promises).then(()=>{
        res.send("OK");
    })
})

global.os_token='';
app.get('/subtitle-test/:movie_name1?',async (req, res)=>{
    if(!os_token){
        let login_response=await os.login({
            username: 'BaiMaoLi',
            password: '2gRr2PuikBJ#bcd'
        })
        os_token=login_response.token;
    }
    let movie_name="20th Century Girl (2022)";
    let movie_name1=req.query.movie_name1;
    if(movie_name1)
        movie_name=movie_name1;
    let subtitle_response=await os.subtitles({
        query: movie_name,
    })
    let files_lists=[],language_lists=[];
    if(subtitle_response.data.length>0){  // if have subtitles
        for(let i=0;i<subtitle_response.data.length;i++){
            let item=subtitle_response.data[i];
            let attributes=item.attributes, language=attributes.language;
            if(!language_lists.includes(language)){
                files_lists.push({
                    language:language,
                    file_id:attributes.files[0].file_id
                })
                language_lists.push(language)
            }
        }
    }

    if(files_lists.length>0){
        let downloaded_responses=[];
        let promises=[]
        for(let i=0;i<files_lists.length; i++) {
            let item=files_lists[i];
            promises.push(new Promise((resolve)=>{
                os.download({
                    file_id: item.file_id
                }).then(value=>resolve(value));
            }))
            if(i % 5==4){
                await new Promise(resolve => setTimeout(resolve, 6000)); // wait 5 seconds
                let values=await Promise.all(promises);
                downloaded_responses=downloaded_responses.concat(values);
                promises=[];
            }
        }
        return res.json({
            // file_lists:files_lists,
            // language_lists:language_lists,
            downloaded_responses:downloaded_responses,
            // subtitle_response:subtitle_response
        });
    }else {
        return res.json(subtitle_response);
    }
})

app.get('/test-email',async(req, res)=>{
    let transaction_time=moment().utc().format('MMMM DD, YYYY hh:mm A');
    let json_body={
        mac_address:"52:54:00:12:34:56",
        transaction_id:"6fc4defded3",
        email:"baimaoli9@gmail.com",
        price:7.99,
        transaction_time:transaction_time
    }
    sendEmail(json_body).then(response=>{
        res.send('ok')}
    );
})

app.get('/test-email-content',async (req,res)=>{
    let api_key=settings.sendgrid_api_key ? settings.sendgrid_api_key : "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";
    sendgridClient.setApiKey(api_key);
    let template_id=settings.sendgrid_template_id ? settings.sendgrid_template_id : 'd-9fc7f92b33c245e4b1c90b714a8ecf34';
    const request = {
        method: 'GET',
        url: `/v3/templates/${template_id}`
    };
    sendgridClient.request(request)
        .then(async ([response, body]) => {
            let transaction_time=moment().utc().format('MMMM DD, YYYY hh:mm A');
            let json_body={
                mac_address:"52:54:00:12:34:56",
                transaction_id:"6fc4defded3",
                email:"baimaoli9@gmail.com",
                price:7.99,
                transaction_time:transaction_time
            }
            var template = handlebars.compile(body.versions[0].html_content);
            var outputString = template(json_body);

            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setContent(outputString, { waitUntil: 'domcontentloaded' });
            await page.emulateMediaType('screen');
            const pdf = await page.pdf({
                path: 'public/result.pdf',
                margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' , padding:0},
                printBackground: true,
                format: 'A4',
            });

            // Close the browser instance
            await browser.close();



            res.setHeader("Content-Type", "text/html")
            return res.send(outputString);
            // return res.render(outputString);
        })
})

global.sendEmail=async(json_body)=>{
    let api_key=settings.sendgrid_api_key ? settings.sendgrid_api_key : "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";
    let template_id=settings.sendgrid_template_id ? settings.sendgrid_template_id : 'd-9fc7f92b33c245e4b1c90b714a8ecf34';
    sgMail.setApiKey(api_key);
    sendgridClient.setApiKey(api_key);

    const request = {
        method: 'GET',
        url: `/v3/templates/${template_id}`
    };
    let date_obj=momentz().tz('CET');
    let austria_month=date_obj.format('Y-MM');
    let austria_date=date_obj.format('DD');
    let payment_type=json_body.payment_type;

    let dir1=path.resolve(path.join(__dirname, `public/receipts`));
    if (!fs.existsSync(dir1))
        fs.mkdirSync(dir1);
    let dir2=`${dir1}/${payment_type}`;
    if (!fs.existsSync(dir2))
        fs.mkdirSync(dir2);
    let dir3=`${dir2}/${austria_month}`;
    if (!fs.existsSync(dir3))
        fs.mkdirSync(dir3);


    const dir = `${dir3}/${austria_date}`;
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir);
    return sendgridClient.request(request)
        .then(async ([response, body]) => {
            let transaction_numbers=await Transaction.countDocuments({status:'success',payment_type:payment_type});
            json_body.invoice_number=transaction_numbers;
            let file_name=`${json_body.transaction_id}.pdf`
            const msg = {
                to: json_body.email, // Change to your recipient
                from:settings.sendgrid_email_from ? settings.sendgrid_email_from : 'info@flixapp.tv', // Change to your verified sender
                personalizations:[
                    {
                        to: [
                            {
                                email: json_body.email
                            }
                        ],
                        dynamic_template_data:json_body
                    }
                ],
                template_id:template_id
            }
            await sgMail.send(msg)
            try{
                var template = handlebars.compile(body.versions[0].html_content);
                var outputString = template(json_body);
                // const puppeteer = require('puppeteer');
                // const browser = await puppeteer.launch({
                //     args: ['--no-sandbox'],
                //     headless:true
                // });
                // const page = await browser.newPage();
                // await page.setContent(outputString, { waitUntil: 'domcontentloaded' });
                // await page.emulateMediaType('screen');
                // const pdf = await page.pdf({
                //     path: `${dir}/${file_name}`,
                //     margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' , padding:0},
                //     printBackground: true,
                //     format: 'A4',
                // });
                // // Close the browser instance
                // await browser.close();

                var pdf = require('html-pdf');
                pdf.create(outputString,{
                    "format": "A3"
                }).toFile(`${dir}/${file_name}`, function(err, res1){
                    console.log(res1.filename);
                });
            }catch (e) {
                console.log(e);
            }
            return outputString;
            // return res.render(outputString);
        })
}
