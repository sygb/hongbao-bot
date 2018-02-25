const {Wechaty, Room, Contact} = require('wechaty') 
const axios = require("axios")

const bot = Wechaty.instance({profile: 'dj940212'})
let url = ""

bot
.on('scan', (url, code)=>{
    let loginUrl = url.replace('qrcode', 'l')
    require('qrcode-terminal').generate(loginUrl)
})

.on('login', user=>{
    console.log(`${user} login`)
})

.on('friend', async function (contact, request){
    if(request){
        await request.accept()
        console.log(`Contact: ${contact.name()} send request ${request.hello}`)
    }

    let logMsg
    const fileHelper = Contact.load('filehelper')

    try {
        logMsg = 'received `friend` event from ' + contact.get('name')
        fileHelper.say(logMsg)
        console.log(logMsg)

        if (request) {
          /**
           *
           * 1. New Friend Request
           *
           * when request is set, we can get verify message from `request.hello`,
           * and accept this request by `request.accept()`
           */
          if (request.hello === 'ding') {
            logMsg = 'accepted because verify messsage is "ding"'
            request.accept()

          } else {
            logMsg = 'not auto accepted, because verify message is: ' + request.hello
          }
        } else {
          /**
           *
           * 2. Friend Ship Confirmed
           *
           */
          logMsg = 'friend ship confirmed with ' + contact.get('name')
        }
    } catch (e) {
        logMsg = e.message
    }

    console.log(logMsg)
    fileHelper.say(logMsg)
})

.on('message', async m => {

    if (!m.self() || m.to().name() !== "File Transfer") {
        return
    }

    if (/https:\/\/h5.ele.me\/hongbao/i.test(m.content())) {
        const first = m.content().search(/https:\/\/h5.ele.me\/hongbao/i);
        const last = m.content().search(/device_id=/i) + 10;
        url = m.content().slice(first, last)
        
        console.log("红包： " + url)

        const contact = await Contact.find({name: 'File Transfer'})         // change 'lijiarui' to any of your contact name in wechat
        await contact.say("填写手机号码领取红包")

        // const contacts = await Contact.findAll()
        // contacts.forEach((contact) => {
        //     console.log(contact.name())
        // })  
    }

    if (/^[1][3,4,5,7,8][0-9]{9}$/i.test(m.content())) {
        const mobile = m.content()

        if (!url) {
            const contact = await Contact.find({name: 'File Transfer'})         // change 'lijiarui' to any of your contact name in wechat
            await contact.say("你没有发送红包")
            return
        }

        // const contact = await Contact.find({name: 'File Transfer'})         // change 'lijiarui' to any of your contact name in wechat

        console.log(url, mobile)
        const res = await axios.post('http://192.168.0.112:3007/hongbao', {url, mobile})
        console.log(res.data)

        // const contact = await Contact.find({name: 'File Transfer'})
        // await contact.say(res.data)

    }
})

.init()