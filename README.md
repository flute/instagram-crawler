### instagram 内容抓取

### 运行

修改 `app.js`:

* `users` 为要抓取的用户列表
* `tags` 为要抓取的tag数组
* `purePage` 为每页返回的数据条数，最大为50
* `userCookie` `tagCookie` 在登陆ins后，分别访问用户主页及tag页面获取，然后保存到app.js中。

执行`node app.js`运行代码或使用pm2守护进程：`pm2 start app.js --name 'Instagram'`。

下载完的视频、图片及JSON文件存储在`downloads`对应目录下，完整日志在`logs`目录。

### 程序说明

1、需要登录信息，即抓取时需要附带`cookie`，同时需要`user-agent`。

2、数据获取接口及下载均有频率限制，无间隔的请求（几百个资源）会被限制，在被限制后睡眠一定时间继续。

3、内容抓取分为两个入口

* 一个是抓取某个用户发布的所有资源
* 一个是抓取某个tag下的所有资源

两种入口附带的cookie不同，请求的URL不同。

4、抓取步骤：

1. 电脑端登陆ins，保存 `cookie`、`query_hash`、`user-agent`信息。后续所有请求附带`cookie`及`user-agent`。
2. 模拟请求个人主页/tag主页，通过解析HTML页面，得到userId/tag name。同时拿到第一页的数据及下页cursor。
3. 通过API接口，根据`cursor`持续获取多页数据。所有数据获取完毕后开始下载。
4. 返回的数据中，图片资源可以直接下载。视频资源需要再次请求视频地址获取接口获得视频地址，然后再下载。

5、请求数据接口：

user:

```
https://www.instagram.com/graphql/query/?query_hash=a5164aed103f24b03e7b7747a2d94e3c&variables=%7B%22id%22%3A%22%s%22%2C%22first%22%3A${purePage}%2C%22after%22%3A%22%s%22%7D
```
tag:

```
https://www.instagram.com/graphql/query/?query_hash=1780c1b186e2c37de9f7da95ce41bb67&variables=%7B%22tag_name%22%3A%22%s%22%2C%22first%22%3A${purePage}%2C%22after%22%3A%22%s%22%7D
```

获取视频的地址:

```
https://www.instagram.com/p/%s/?__a=1
```

