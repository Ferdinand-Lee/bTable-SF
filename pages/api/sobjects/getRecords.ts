// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Connection, Record } from 'jsforce';
type Data = {
  records: Record
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const conn = new Connection({
    serverUrl: 'https://lark--devalfa.sandbox.my.salesforce.com/',
    sessionId: req.headers['authorization']
  })
  const records = await conn.sobject('Account').retrieve(req.body.ids as Array<string>, { fields: req.body.fields })

  res.status(200).json({ records })
}
