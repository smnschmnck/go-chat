import { NextApiRequest, NextApiResponse } from 'next';
import { getProxy } from '../../../helpers/proxyWithAuth';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { chatID } = req.query;
  return getProxy(req, res, `/oneOnOneChatParticipant/${chatID}`);
};

export default handler;