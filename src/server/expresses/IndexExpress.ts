import * as express from 'express';
import * as path from 'path';
import { LoggersManager } from 'server/libsWrapper/LoggersManager';
import { ApiRouter } from '../routers/ApiRouter';
import { BaseExpress } from './BaseExpress';



/**
 * The Index Express to handle root URL.
 *
 * @class IndexExpress
 */
export class IndexExpress extends BaseExpress {
    /**
     * Configure application
     *
     * @class IndexExpress
     * @method config
     */
    protected configExpress(): void {
        super.configExpress();
        // add static paths
        const clientDir: string = path.join(__dirname, 'client');
        LoggersManager.info(`clientDir:${clientDir}`);
        this.expressApp.use(express.static(clientDir));
    }

    /**
     * Create routers
     *
     * @class IndexExpress
     * @method api
     */
    protected configRouters(): void {
        LoggersManager.info('IndexExpress:routers');
        super.configRouters();
        const indexRouter = new ApiRouter(this.expressRouter);
        indexRouter.mount();
    }
}
