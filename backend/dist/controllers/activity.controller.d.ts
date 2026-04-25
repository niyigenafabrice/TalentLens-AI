import { Request, Response } from "express";
export declare const logActivity: (req: Request, res: Response) => Promise<void>;
export declare const getAllActivities: (req: Request, res: Response) => Promise<void>;
export declare const getActivitiesByUser: (req: Request, res: Response) => Promise<void>;
export declare const getActivitiesByEntity: (req: Request, res: Response) => Promise<void>;
export declare const getRecentActivities: (req: Request, res: Response) => Promise<void>;
export declare const getActivitySummary: (req: Request, res: Response) => Promise<void>;
export declare const deleteOldActivities: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=activity.controller.d.ts.map