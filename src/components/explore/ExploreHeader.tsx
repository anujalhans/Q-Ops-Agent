import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../common/Button'
import Header from '../common/Header'

export default function ExploreHeader() {
  const navigate = useNavigate()
  return (
    <Header
      rightSlot={
        <Button variant="secondary" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/')}>
          Back to login
        </Button>
      }
    />
  )
}
