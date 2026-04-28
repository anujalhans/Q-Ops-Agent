import Button from '../common/Button'
import Header from '../common/Header'

type Props = {
  onLogin: () => void
}

export default function LandingHeader({ onLogin }: Props) {
  return (
    <Header
      rightSlot={
        <Button variant="primary" size="md" onClick={onLogin}>
          Login
        </Button>
      }
    />
  )
}
