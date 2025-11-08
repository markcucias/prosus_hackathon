import { useState } from 'react'

export function useAuth(){
  const [user, setUser] = useState<{ email?: string, tz?: string } | null>(null)

  function login(email: string){
    setUser({ email, tz: Intl.DateTimeFormat().resolvedOptions().timeZone })
  }
  function logout(){ setUser(null) }
  return { user, login, logout }
}
