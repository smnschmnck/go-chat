import { NextApiRequest, NextApiResponse } from 'next';
import { BACKEND_HOST } from '../../helpers/globals';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const sessionID = req.cookies.SESSIONID;
  if (!sessionID) {
    return res.status(401).send('NOT AUTHORIZED');
  }

  const resp = await fetch(BACKEND_HOST + '/logout', {
    headers: { authorization: `Bearer ${sessionID}` },
  });
  if (!resp.ok) {
    return res.status(500).send('SOMETHING WENT WRONG');
  }

  res.writeHead(200, {
    'Set-Cookie': `SESSIONID=; HttpOnly; path=/; max-age=0`,
  });
  res.end();
};

export default handler;
