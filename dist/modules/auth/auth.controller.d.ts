import { Request, Response } from 'express';
export declare const authController: {
    sendOTP: (req: Request, res: Response) => Response<any, Record<string, any>>;
    verifyOTP: (req: Request, res: Response) => Response<any, Record<string, any>>;
    register: (req: Request, res: Response) => Response<any, Record<string, any>>;
    login: (req: Request, res: Response) => Response<any, Record<string, any>>;
    getProfile: (req: Request, res: Response) => Response<any, Record<string, any>>;
    verifyToken: (req: Request, res: Response) => Response<any, Record<string, any>>;
};
//# sourceMappingURL=auth.controller.d.ts.map