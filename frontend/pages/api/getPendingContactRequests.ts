import { NextApiRequest, NextApiResponse } from 'next';
import { getProxy } from '../../helpers/proxyWithAuth';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return getProxy(req, res, '/pendingContactRequests');
};

export default handler;
