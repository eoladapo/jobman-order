import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { markNotificationAsRead } from '@order/services/notification.service';
import { IOrderNotifcation } from '@eoladapo/jobman-shared';

const markSingleNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  const { notificationId } = req.body;
  const notification: IOrderNotifcation = await markNotificationAsRead(notificationId);
  res.status(StatusCodes.OK).json({ message: 'Notifications updated successfully', notification });
};

export { markSingleNotificationAsRead };
