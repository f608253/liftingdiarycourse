import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs'

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="text-xl font-bold">Lifting Diary</div>
      <nav>
        <Show when="signed-out">
          <SignInButton />
          <SignUpButton />
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </nav>
    </header>
  )
}
