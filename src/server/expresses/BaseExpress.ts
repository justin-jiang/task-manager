import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { NextFunction } from 'express';
import { ArgsParser } from 'server/common/ArgsParser';
import { debugMiddleWare } from 'server/expresses/DebugMiddleWare';


/**
 * The base Express Server
 *
 * @class BaseExpress
 */
export abstract class BaseExpress {
    protected expressApp: express.Application;
    protected expressRouter: express.Router;

    /**
     * Constructor.
     *
     * @class BaseExpress
     * @constructor
     */
    constructor() {
        // create expressjs application
        this.expressApp = (express as any)();
        this.expressRouter = express.Router();

        // configure application
        this.configExpress();

        // add router middleware and rounters instance
        this.configRouters();
    }
    public setPort(port: number): void {
        this.expressApp.set('port', port);
    }
    public getExpressApp(): express.Application {
        return this.expressApp;
    }
    /**
     * Configure application
     *
     * @class BaseExpress
     * @method config
     */
    protected configExpress(): void {
        this.expressApp.use((req, res, next) => {
            res.on('finish', () => {
                // todo
            });
            res.on('close', () => {
                // todo
            });
            next();
        });
        // use cookie parser middleware
        // the param of cookieParser is a string used for signing cookies
        this.expressApp.use((cookieParser as any)('e842f950021a817ff4c1f424f43f38df'));

        // use json form parser middlware
        this.expressApp.use(express.json({ limit: '50mb' }));

        // use query string parser middlware
        this.expressApp.use(express.urlencoded({
            extended: true,
            limit: '50mb',
        }));
        // add built-in error handler which will catch 404 and forward to error handler middleware
        this.expressApp.use((
            err: any,
            req: express.Request,
            res: express.Response,
            next: NextFunction) => {
            let errMsg = 'Error';
            if (err != null) {
                if (err.message != null) {
                    errMsg = err.message;
                }
            }

            res.json(errMsg).end();
        });
        if (ArgsParser.isDebugMode()) {
            // error handling
            this.expressApp.use(debugMiddleWare);
        }

        // create router middleware to express application,
        // which must be after the cookie/json/urlencoded middlewares
        this.expressApp.use(this.expressRouter);
    }

    /**
     * Create routers: Auth, error handler
     *
     * @class BaseExpress
     * @method routers
     */
    protected configRouters() {
        // Reserved
    }
}
