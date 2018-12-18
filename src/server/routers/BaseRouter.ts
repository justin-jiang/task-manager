import * as express from 'express';
/**
 * Abstract Router Class
 *
 * @class BaseRouter
 */
export abstract class BaseRouter {
  protected expRouter: express.Router;
  /**
   * Constructor
   *
   * @class BaseRoute
   * @constructor
   */
  constructor(expRouter: express.Router) {
    // initialize variables
    this.expRouter = expRouter;
  }
  public getExpRouter(): express.Router {
    return this.expRouter;
  }
  public mount(): void {
    // todo
  }
}
