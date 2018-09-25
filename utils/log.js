/**
 * 日志配置
 */

const log4js = require('log4js');
log4js.configure({
	appenders: {
		out: {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: '%[[%d{yyyy-MM-dd hh:mm:ss.SSSO}] [%p] %c -%] %m',
            },
		},
		task: {
			type: 'dateFile',
			filename: 'logs/',
			pattern: 'yyyy-MM-dd.log',
			alwaysIncludePattern: true
		}
	},
	categories: {
		default: {
			appenders: ['out', 'task'],
			level: 'debug'
		}
	}
});

let logger = log4js.getLogger('app');
logger.info("Start time:", new Date());

exports.getLogger = log4js.getLogger;
/* exports.use = function (app) {
	app.use(log4js.connectLogger(logger, {
		level: 'debug',
		format: ':method :url'
	}));
}; */
