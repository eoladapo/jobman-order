import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { getNotificationsById } from '@order/services/notification.service';
import { IOrderNotifcation } from '@eoladapo/jobman-shared';

const notifications = async (req: Request, res: Response): Promise<void> => {
  const notifications: IOrderNotifcation[] = await getNotificationsById(req.params.userTo);
  res.status(StatusCodes.OK).json({ message: 'Notifications retrieved successfully', notifications });
};

export { notifications };
