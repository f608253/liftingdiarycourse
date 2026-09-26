import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <Link href="/" className="text-xl font-bold">
        Lifting Diary
      </Link>
      <nav className="flex items-center gap-4">
        <Show when="signed-in">
          <Link
            href="/dashboard"
            className="text-sm font-medium hover:underline text-zinc-700 dark:text-zinc-300"
          >
            Dashboard
          </Link>
          <UserButton />
        </Show>
        <Show when="signed-out">
          <SignInButton />
          <SignUpButton />
        </Show>
      </nav>
    </header>
  )
}
