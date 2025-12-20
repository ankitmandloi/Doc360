import { Request, Response } from 'express';
export declare const betController: {
    placeBet: (req: Request, res: Response) => Response<any, Record<string, any>>;
    updateBet: (req: Request, res: Response) => Response<any, Record<string, any>>;
    removeBet: (req: Request, res: Response) => Response<any, Record<string, any>>;
    getUserBets: (req: Request, res: Response) => Response<any, Record<string, any>>;
    getCurrentBet: (req: Request, res: Response) => Response<any, Record<string, any>>;
    getCurrentBets: (req: Request, res: Response) => Response<any, Record<string, any>>;
    getAllBets: (req: Request, res: Response) => Response<any, Record<string, any>>;
    getTopWinners: (req: Request, res: Response) => Response<any, Record<string, any>>;
};
//# sourceMappingURL=bet.controller.d.ts.map