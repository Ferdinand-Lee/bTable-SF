import { PropsWithChildren, createContext, useState } from 'react';

export type User = {
  username: string
  email: string
  serverUrl: string
  accessToken: string
}

export const UserContext = createContext<{
  user?: User,
  setUser: (user: User) => void
}>({ user: undefined, setUser: (user) => { } });

export default function UserProvider(props: PropsWithChildren) {

  const [user, setUser] = useState<User | undefined>()

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {props.children}
    </UserContext.Provider>
  )
}