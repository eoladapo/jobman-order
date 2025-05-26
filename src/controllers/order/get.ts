import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { IOrderDocument } from '@eoladapo/jobman-shared';
import { getOrdersByBuyerId, getOrdersByOrderId, getOrdersBySellersId } from '@order/services/order.service';

const order = async (req: Request, res: Response): Promise<void> => {
  const order: IOrderDocument = await getOrdersByOrderId(req.params.orderId);
  res.status(StatusCodes.OK).json({ message: 'Order by order id', order });
};

const sellerOrders = async (req: Request, res: Response): Promise<void> => {
  const orders: IOrderDocument[] = await getOrdersBySellersId(req.params.sellerId);
  res.status(StatusCodes.OK).json({ message: 'Seller orders', orders });
};

const buyerOrders = async (req: Request, res: Response): Promise<void> => {
  const orders: IOrderDocument[] = await getOrdersByBuyerId(req.params.buyerId);
  res.status(StatusCodes.OK).json({ message: 'Seller orders', orders });
};

export { order, sellerOrders, buyerOrders };
