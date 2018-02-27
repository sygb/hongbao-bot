const {Wechaty, Room, Contact} = require('wechaty')
const { getUrl, isIncludeUrl} = require("./utils")
const axios = require("axios")

const bot = Wechaty.instance({profile: 'dj940212'})
const self_name = "dj940212"  //当前用户名
let urls = []   //红包链接

bot
.on('scan', (url, code)=>{
    let loginUrl = url.replace('qrcode', 'l')
    require('qrcode-terminal').generate(loginUrl)
})

.on('login', user=>{
    console.log(`${user} login`)
})

.on('message', async m => {
    /**
     * [发送到文件助手或者发送给机器人]
     */
    if (m.to().name() !== "File Transfer" && m.to().name() !== self_name) { return }

    // 文件助手
    const filehelper = await Contact.load('filehelper')
    /**
     * [检查链接]
     */
    if( isIncludeUrl(m.content()) ){
        const url = getUrl(m.content())
        urls.push(url)
        console.log("红包数组：", urls)


        //发送到机器人
        if (m.to().name() === self_name) {
            await m.from().say("填写手机号码领取红包")
        }

        //发送到文件助手
        if (m.to().name() === "File Transfer") {
            await filehelper.say("填写手机号码领取红包")
        }

    }

    //检查手机号码
    if (/^[1][3,4,5,7,8][0-9]{9}$/i.test(m.content())) {
        const mobile = m.content()

        if (!urls.length) return

        console.log(urls[urls.length - 1], mobile)

        let res = {}
        try {
            res = await axios.post('http://101.132.113.122:3007/hongbao', {url: urls[urls.length - 1], mobile})
            urls.pop()
        } catch (e) {
            console.log(e)
        }

        //发送到机器人
        if (m.to().name() === self_name) {
            await m.from().say(res.data.message)
        }

        //发送到文件助手
        if (m.to().name() === "File Transfer") {
            await filehelper.say(res.data.message)
        }
    }
})

.init()
