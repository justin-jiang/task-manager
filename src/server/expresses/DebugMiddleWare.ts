
import * as mung from 'express-mung';
import { Response, Request } from 'express';

function appendDebugInfo(body: any, req: Request, res: Response) {
    return body;
}
export const debugMiddleWare = mung.json(appendDebugInfo);
