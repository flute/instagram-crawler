/**
 * Instagram 爬虫
 * 爬取某个用户发布的所有视频+图片
 */

const request = require('request')
const async = require('async')
const path = require('path')
const fs = require('fs')
const cheerio = require('cheerio')
const util = require('util')
// log
const log = require('./utils/log').getLogger('debug')

// 要抓取的用户/tag
//let users = ['iqb_c']
let users = ['funny_videos']
users = []
//let tags = ['movies', 'funnyvideos']
let tags = ['animals', 'pets', 'mashup', 'movies', 'gaming', 'cartoons', 'art', 'music', 'sports', 'sciences', 'celebrity', 'nature', 'travel', 'fashion', 'dance', 'car', 'nsfw']

let target = [].concat(
    users.map(item => {
        return {
            type: 'user',
            name: item
        }
    }),
    tags.map(item => {
        return {
            type: 'tag',
            name: item
        }
    })
)

let baseUrl = 'https://www.instagram.com/'
let purePage = 50
let headers = {
    cookie: '',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
}

let fetchUserUrl = `https://www.instagram.com/graphql/query/?query_hash=a5164aed103f24b03e7b7747a2d94e3c&variables=%7B%22id%22%3A%22%s%22%2C%22first%22%3A${purePage}%2C%22after%22%3A%22%s%22%7D`
let userCookie = 'mcd=3; mid=W6NuSQAEAAHYAFNQ9FUXTRmuZuuB; fbm_124024574287414=base_domain=.instagram.com; shbid=9246; ds_user_id=8095487694; rur=FRC; csrftoken=mkgdhCw6PhOztTz6Leaup373Ydss6XOA; csrftoken=mkgdhCw6PhOztTz6Leaup373Ydss6XOA; sessionid=IGSC0dfc3fc18db6b624c9e27e5a613e0f7635f1e6376a67c08a81ea99e68c9b2d96%3AUjdOLdRnPbMj8ANsHoqmeCLqOdnqcGA7%3A%7B%22_auth_user_id%22%3A8095487694%2C%22_auth_user_backend%22%3A%22accounts.backends.CaseInsensitiveModelBackend%22%2C%22_auth_user_hash%22%3A%22%22%2C%22_platform%22%3A4%2C%22_token_ver%22%3A2%2C%22_token%22%3A%228095487694%3AebQ6sj7NqV3MYDW1P9bzczfJU3kwCPBT%3Ac9d2332a2ffda5cd5db2461266b39d2feefa81bef75beddbe3a5e1044200825c%22%2C%22last_refreshed%22%3A1537845056.8236260414%7D; fbsr_124024574287414=vpzzT5hm-bZFdB59YHxAIAuV9WhJntgUOlVwoZPJhKA.eyJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImNvZGUiOiJBUUN1SDFRUWYwVFV5RXQ1TXg2ZjhZVnNKTDlHMC1fMWtsUzN1RnpKa3A5dkZnSmdhSzFyb3BkaDVyUWNSV0R4bWhsVEdrNEMtODhGN3ZlUUgtYXdRZjhFemt6dFFFcHR5LVhBX3o3UTR2N2w5NDZhTDROaXphU3d6NEQwNm1sa1BienlzdzVwc3BkWUZTVzNSNjFTX1NXbE41dG5IYUdZQWNkY0E0aWZCQ3VUcDhYWXpSaVAza3pDU0JHd2xGLVJoNEpSX3pjdXdfVktHWkotSWVoc3AxZTBsYTBzMV9fVHdIdlZNT1JIb29KLV9lS1RWYnItd0N4TkVJR1d2d296UF91bnNqSGoxb1ZhZWx5YXlwcVZPR1dxdS1VTWxKN2xIelp3cElHRGZkdi1DNDF6VWdGS2xOejhORU5YSmNNcFRSQ2VWVldEMEFGakg3cXZpRWE4XzAxcCIsImlzc3VlZF9hdCI6MTUzNzg1NDExMCwidXNlcl9pZCI6IjEwMDAwNzQ1OTEyMDkzOSJ9; shbts=1537854120.7347617; urlgen="{\"67.209.176.135\": 25820\054 \"47.88.192.181\": 45102}:1g4g6x:dwBGk-uOufguwN8P5LT163d6dcE"'

let fetchTagUrl = `https://www.instagram.com/graphql/query/?query_hash=1780c1b186e2c37de9f7da95ce41bb67&variables=%7B%22tag_name%22%3A%22%s%22%2C%22first%22%3A${purePage}%2C%22after%22%3A%22%s%22%7D`
let tagCookie = 'mcd=3; mid=W6NuSQAEAAHYAFNQ9FUXTRmuZuuB; fbm_124024574287414=base_domain=.instagram.com; shbid=9246; ds_user_id=8095487694; rur=FRC; csrftoken=mkgdhCw6PhOztTz6Leaup373Ydss6XOA; csrftoken=mkgdhCw6PhOztTz6Leaup373Ydss6XOA; sessionid=IGSC0dfc3fc18db6b624c9e27e5a613e0f7635f1e6376a67c08a81ea99e68c9b2d96%3AUjdOLdRnPbMj8ANsHoqmeCLqOdnqcGA7%3A%7B%22_auth_user_id%22%3A8095487694%2C%22_auth_user_backend%22%3A%22accounts.backends.CaseInsensitiveModelBackend%22%2C%22_auth_user_hash%22%3A%22%22%2C%22_platform%22%3A4%2C%22_token_ver%22%3A2%2C%22_token%22%3A%228095487694%3AebQ6sj7NqV3MYDW1P9bzczfJU3kwCPBT%3Ac9d2332a2ffda5cd5db2461266b39d2feefa81bef75beddbe3a5e1044200825c%22%2C%22last_refreshed%22%3A1537845056.8236260414%7D; fbsr_124024574287414=r2l1Yl3SMGsppA_MA6GNcTmI7dOW4-Crg8AIeLTOLpM.eyJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImNvZGUiOiJBUUNYcW02cWNWMTA1X3JHdGljejVKcTQza2FrdTFSWC1Wclc4MnM2amJnWVVZV2h0V3M1RHVLLWxWb20zOWRWTUE4ZElDTWNadlpwa3dodWYxQWg5ZjJTME95dnRNVVBVczYycGZFMGdwZmRETHc2RTlmNnNfUlZuYlVrY3ZiRmxCV1pQTEtNTllZajdsM0M5NlBvU3dFZGwtVDRidmUtSE5pNi02NGdPSDNLT3IyMWVsbmwzUjhaU0ZCVkNqV2pkemNVQmVLajVSLXltLW1TYUdCQUkzRVU4ZU54U3lnWk9JWGtYempTWWhKdmRZT1dyQXBHU2xobU92SFZ2dHFLcUpvSlh6cmRpZVJPa1BiTzlRZW5GRGZLVGRSNFJCYzV1NjdKT29rN1FpdktIY2V4X2VwdjlBZkxVQ04xTzFDSEU0V1dzNXU2MFI5aUt2N3lObElIZnpnaiIsImlzc3VlZF9hdCI6MTUzNzg1NDM3NiwidXNlcl9pZCI6IjEwMDAwNzQ1OTEyMDkzOSJ9; shbts=1537854545.179847; urlgen="{\"67.209.176.135\": 25820\054 \"47.88.192.181\": 45102}:1g4gDZ:kUbzV9ucIEiUCkmh-MkaAhcfQyg"'

let getVideoUrl = 'https://www.instagram.com/p/%s/?__a=1'

// 存储所有的媒体资源
let media = []
let videoCount = 0
let imgCount = 0
let videoDl = 0
let imgDl = 0
let fetchPageCount = 0
// 获取页数限制，ins tag下的页数达十万多页，选择性抓取最新的一部分
let pageLimit = 100

// 存储路径
let videoDlPath = path.resolve(__dirname, `./downloads/video`);
let imgDlPath = path.resolve(__dirname, `./downloads/img`);
let videoJsonPath = path.resolve(__dirname, `./downloads/video_json`);
let imgJsonPath = path.resolve(__dirname, `./downloads/img_json`);

mkdirsSync(videoDlPath)
mkdirsSync(imgDlPath)
mkdirsSync(videoJsonPath)
mkdirsSync(imgJsonPath)

/**
 * 同步递归创建目录
 */
function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

/**
 * 获取指定用户的主页
 */
const getHtml = item => {
    let userName = item.name,
        type = item.type
    let url
    if (item.type == 'user') {
        url = `${baseUrl}${userName}/`
        headers.cookie = userCookie
    } else {
        url = `${baseUrl}explore/tags/${userName}/`
        headers.cookie = tagCookie
    }
    let options = {
        method: 'GET',
        url: url,
        headers: headers
    }

    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            if (error) return reject(error);

            const $ = cheerio.load(body)
            let html = $.html()

            // 获取uid/tag name
            userId = item.type == 'user' ? html.match(/"profilePage_([0-9]+)"/)[1] : html.match(/"name":"([a-zA-Z_]+)",/)[1]
            log.info(`${userName} id/name 获取成功 ${userId}`)

            // 获取首页数据
            data = html.match(/<script type="text\/javascript">window._sharedData = (.*?);<\/script>/)[1]
            data = JSON.parse(data)

            let edges, count, pageInfo, cursor, flag, totalPage

            let firstPageDate

            if (item.type == 'user') {
                firstPageDate = data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media
            } else {
                firstPageDate = data.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media
            }

            edges = firstPageDate.edges
            count = firstPageDate.count
            pageInfo = firstPageDate.page_info

            cursor = pageInfo.end_cursor
            flag = pageInfo.has_next_page
            totalPage = Math.ceil(count / purePage)

            // 存储首页信息
            edges.forEach(item => {
                item.mode = type
                storeMedia(item)
            })

            // 返回分页信息
            return resolve({
                totalPage: totalPage,
                userId: userId,
                cursor: cursor
            })

        });
    })

}


/**
 * 获取该用户的所有内容
 */
const getAllUrls = (item, totalPage, uid, cursor) => {
    let userName = item.name
    let actions = [async.constant(item, uid, cursor)]
    let limit = totalPage > pageLimit ? pageLimit : totalPage
    for (let i = 0; i < limit; i++) {
        actions.push(fetchData)
    }
    log.info(`${userName} 数据共 ${totalPage} 页`)
    return new Promise((resolve, reject) => {
        async.waterfall(actions, (error, result) => {
            log.info(`${userName} 的所有帖子数据获取成功，共${media.length}个帖子，视频${videoCount}个，图片${imgCount}个`, )
            fetchPageCount = 0
            //console.log(media)
            return resolve(media)
        })
    })

}

/**
 * 请求获取数据
 */
const fetchData = (item, uid, offset, next) => {

    let userName = item.name,
        type = item.type
    let url

    if (item.type == 'user') {
        url = util.format(fetchUserUrl, uid, offset)
        headers.cookie = userCookie
    } else {
        url = util.format(fetchTagUrl, uid, offset)
        headers.cookie = tagCookie
    }

    let options = {
        method: 'GET',
        url: url,
        headers: headers
    };

    request(options, function (error, response, body) {
        if (error) {
            log.error('fetch data error', error)
            log.info('休息1min~')
            return setTimeout(function () {
                return next(null, item, uid, offset)
            }, 1 * 60 * 1000)
        }

        let data
        try {
            data = JSON.parse(body)
        } catch (error) {
            log.error('json序列化失败', error)
            return next(null, item, uid, offset) 
        }
        
        if (data.status == 'fail') {
            log.error('返回内容失败', data)
            log.info('休息1min~')
            //return next(data.message)
            return setTimeout(function () {
                return next(null, item, uid, offset)
            }, 1 * 60 * 1000)
        }

        let listData
        try {
            if (item.type == 'user') {
                listData = data.data.user.edge_owner_to_timeline_media
            } else {
                listData = data.data.hashtag.edge_hashtag_to_media
            }
        } catch (error) {
            log.error('数据获取失败', error)
            next(error)
        }

        let edges = listData.edges
        edges.forEach(item => {
            item.mode = type
            storeMedia(item)
        })
        let {
            has_next_page,
            end_cursor
        } = listData.page_info

        log.info(`page:${++fetchPageCount} ${userName} 数据获取成功，帖子 ${edges.length} 个, has_next_page: ${has_next_page} ，end_cursor: ${end_cursor}`)

        if (!has_next_page) {
            return next('所有数据获取完毕，无下页')
        }
        setTimeout(function () {
            return next(null, item, uid, end_cursor)
        }, 2000)

    });

}

/**
 * 根据视频的shortcode获取视频的下载地址
 */
const fetchVideoUrl = (mode, shortcode) => {
    let url = util.format(getVideoUrl, shortcode)

    if (mode == 'user') {
        headers.cookie = userCookie
    } else {
        headers.cookie = tagCookie
    }
    let options = {
        method: 'GET',
        url: url,
        headers: headers
    }
    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            let videoUrl = ''
            if (error) {
                log.error(`获取 ${shortcode} 视频地址失败`, error)
                return resolve(videoUrl)
            }

            try {
                let data = JSON.parse(body)
                videoUrl = data.graphql.shortcode_media.video_url
            } catch (error) {
                log.error(`获取 ${shortcode} videoUrl 为空`)
            }
            return resolve(videoUrl)
        })
    })

}

/**
 * 根据不同的类型存储数据
 */
const storeMedia = async item => {
    let result = {
        id: item.node.id,
        desc: item.node.edge_media_to_caption.edges[0] ? item.node.edge_media_to_caption.edges[0].node.text : ''
    }
    if (item.node.is_video) {
        // video
        // 如果有video_url直接获取
        // 如果没有video_url，通过接口获取
        let videoUrl = item.node.video_url
        if (!videoUrl) videoUrl = await fetchVideoUrl(item.mode, item.node.shortcode)
        if (videoUrl) {
            result.type = 'video'
            result.url = videoUrl
            videoCount++
        }
    } else {
        // img
        let imgUrl = item.node.display_url
        if (imgUrl) {
            result.type = 'img'
            result.url = imgUrl
            imgCount++
        }
    }
    media.push(result)
}

/**
 * 下载视频/图片
 */
const download = (category, media, next) => {

    let isExist = isFileExist(media.id)
    if (isExist) return next(null)

    let filePath
    if (media.type == 'video') {
        filePath = `${videoDlPath}/${media.id}.mp4`
    } else if (media.type == 'img') {
        filePath = `${imgDlPath}/${media.id}.jpg`
    } else return next(null)

    let st = new Date()
    request(media.url)
        .on('response', function (res) {
            // create file write stream
            let fws = fs.createWriteStream(filePath);
            // setup piping
            res.pipe(fws);
            // finish
            res.on('end', function (e) {
                let et = new Date()
                let ut = timeUsed((et - st) / 1000)
                log.info(`${videoDl + imgDl} finish download ${category} ${filePath}，用时${ut}`)
                saveJsonData(media.type, {
                    id: media.id,
                    category: category,
                    desc: media.desc
                })
                if (media.type == 'video') videoDl++
                else imgDl++

                return next(null)
            });
            // error handler
            res.on('error', err => {
                log.error('download error', err)
                return next(null)
            })
        })
        .on('error', function (err) {
            log.error('request source failed', media.url, err)
            // 大约3分钟可恢复
            log.info('超频啦！休息1分钟~')
            setTimeout(function () {
                return next(null)
            }, 1 * 60 * 1000)

        })

}

/**
 * 视频是否已下载
 */
const isFileExist = id => {
    let videoPath = `${videoDlPath}/${id}.mp4`
    let imgPath = `${imgDlPath}/${id}.jpg`
    if (fs.existsSync(videoPath)) {
        log.info('video file exist', videoPath)
        return true
    } else if (fs.existsSync(imgPath)) {
        log.info('img file exist', imgPath)
        return true
    } else return false
}

/**
 * 视频下载成功后，实时更新json数据。防止程序中途奔溃后视频信息未保存
 */
const saveJsonData = (type, data) => {
    try {
        // 读取已有json信息
        let jsonFile = type == 'video' ? videoJsonPath : imgJsonPath
        jsonFile += `/data.json`

        let jsonData = []
        if (fs.existsSync(jsonFile)) {
            fileData = fs.readFileSync(jsonFile, {
                encoding: 'utf8'
            })
            if (fileData) {
                jsonData = JSON.parse(fileData)
            }
        }
        // 写入
        jsonData.push(data)
        fs.writeFileSync(jsonFile, JSON.stringify(jsonData));

    } catch (error) {
        log.error('写入json文件失败', data)
    }

}

const clearData = () => {
    media = []
    videoCount = 0
    imgCount = 0
    videoDl = 0
    imgDl = 0
}

/**
 * 下载某用户/标签下获取的所有资源
 */
const downloadAll = (userName, data) => {
    let dlActions = data.map(item => next => {
        download(userName, item, next)
    })
    return new Promise((resolve, reject) => {
        async.series(dlActions, (error, result) => {
            return resolve(result)
        })
    })
}


/**
 * 用时显示
 */
const timeUsed = t => {
    // [1s, 1m)
    if (t < 60) return `${Math.ceil(t)}s`
    // [1m, 1h)
    else if (t >= 60 && t < 60 * 60) return `${Math.floor(t/60)}m${Math.floor(t%60)}s`
    // [1h, 1d)
    else if (t >= 60 * 60 && t < 60 * 60 * 24) return `${Math.floor(t/(60*60))}h${Math.floor(t%(60*60)/60)}m`
    // [1d, ~)
    else return `${ Math.floor(t/(24*60*60)) }d ${ Math.floor( t%(24*60*60)/(60*60) ) }h`
}

/**
 * 某个用户/标签的抓取任务
 */
const task = async (item, next) => {
    let userName = item.name

    let {
        totalPage,
        userId,
        cursor
    } = await getHtml(item).catch(error => {
        log.error('fetch error', error)
        return next(null)
    })

    let data = await getAllUrls(item, totalPage, userId, cursor)

    clearData()

    let st = new Date()
    let download = await downloadAll(userName, data)
    let et = new Date()
    let ut = timeUsed((et - st) / 1000)
    log.info(`${userName} 所有下载完成， video ${videoDl} 个,img ${imgDl} 个,共用时 ${ut}`)
    clearData()
    return next(null)

}

const main = () => {
    let actions = target.map(item => next => {
        task(item, next)
    })
    async.series(actions, (error, result) => {
        log.info(`所有 ${result.length} 个任务完成`, error)
        process.exit(0)
    })
}

main()
