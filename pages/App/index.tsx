'use client'
import { bitable, IFieldMeta, IOpenCellValue, IOpenSegmentType } from "@lark-base-open/js-sdk";
import { Button, Toast, Spin, Select } from '@douyinfe/semi-ui';
import { useCallback, useContext, useState } from 'react';
import styles from './index.module.css';
import { User, UserContext } from "../../src/contexts/user";
import { Connection } from "jsforce";
import _ from 'lodash';

const envList = [
  { value: 'login.salesforce.com', label: 'Production', otherKey: 0 },
  { value: 'test.salesforce.com', label: 'Sandbox', otherKey: 0 },
]

function UserInfo({ user }: { user?: User }) {
  if (!user) return
  return (
    <div>
      <span>{user.username}</span>
    </div>
  )
}

export default function App() {
  const { user, setUser } = useContext(UserContext)

  const [conn, setConn] = useState(new Connection({}))

  const [env, setEnv] = useState<any>(envList[0].value)

  const [loading, setLoading] = useState(false)

  const handleAuth = useCallback(function() {
    const win = window.open(`/oauth2/auth?env=${env}`, 'sf_oauth_flow', 'popup=yes,directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,left=100,top=100,width=360,height=640')
    function onConnect(event: MessageEvent) {
      const { type, payload } = event.data
      if (type === 'oauth2' && payload) {
        setUser(payload)
        setConn(new Connection({
          serverUrl: payload.serverUrl,
          accessToken: payload.accessToken,
        }))
        win?.close()
        window.removeEventListener('message', onConnect)
      }
    }
    window.addEventListener('message', onConnect)
  }, [setUser, env])

  const handleExecute = useCallback(async function() {
    setLoading(true)
    const { id } = await bitable.base.getActiveTable()
    const table = await bitable.base.getTableById(id)
    const objectApiName = await table.getName()
    const fields: Record<string, IFieldMeta> = {}
    for (const field of await table.getFieldMetaList()) {
      fields[field.name] = field
    }

    const recordIds = await table.getRecordIdList()

    const ids = Object.fromEntries(await Promise.all(recordIds.map(id => Promise.all([table.getCellString(fields['Id'].id, id), id]))))

    // const rawResponse = await fetch('/api/sobjects/getRecords', {
    //   method: 'POST',
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json',
    //     'Authorization': user!.accessToken
    //   },
    //   body: JSON.stringify({ ids: Object.keys(ids), fields: Object.keys(fields) })
    // });
    // const { records } = await rawResponse.json();

    try {
      for (const batchIds of _.chunk(Object.keys(ids), parseInt(process.env.NEXT_PUBLIC_SF_RECORD_BATCH_SIZE || '200'))) {
        const records = await conn.sobject(objectApiName).retrieve(batchIds, { fields: Object.keys(fields) })
        const rows = records.map((record: Record<string, any>) => {
          return {
            recordId: ids[record.Id],
            fields: Object.values(fields).reduce<Record<string, IOpenCellValue>>((r, field) => {
              r[field.id] = [{ type: IOpenSegmentType.Text, text: record[field.name] }]
              return r
            }, {})
          }
        })
        await table.setRecords(rows)
      }
      Toast.success('获取成功😄')
    } catch (error: any) {
      if (error.errorCode === 'ERROR_HTTP_400' && error.message === 'Access Declined') {
        Toast.error(`请配置CROS:${window.location.protocol}//${window.location.host}`)
      } else {
        Toast.error(error.message)
      }
    } finally {
      setLoading(false)
    }
  }, [conn])

  return (
    <main className={styles.main}>
      <UserInfo user={user} />
      {
        user
          ? loading ? <Spin></Spin> : <Button onClick={handleExecute}>执行</Button>
          : (
            <>
              <Select defaultValue={env} placeholder="Environment" optionList={envList} onChange={setEnv}></Select>
              <Button onClick={handleAuth}>授权</Button>
            </>
          )
      }

    </main >
  )
}