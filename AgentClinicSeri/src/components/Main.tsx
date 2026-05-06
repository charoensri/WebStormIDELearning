import { Child } from 'hono/jsx'

type Props = {
  children: Child
}

export function Main({ children }: Props) {
  return (
    <main>
      {children}
    </main>
  )
}
