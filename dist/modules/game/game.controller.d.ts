import { Request, Response } from 'express';
export declare const gameController: {
    getState: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
    getFairness: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
    getHistory: (req: Request, res: Response) => void;
    getConfig: (req: Request, res: Response) => void;
};
//# sourceMappingURL=game.controller.d.ts.map