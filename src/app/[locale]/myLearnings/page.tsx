import { auth } from '@/auth'
import {AddLearningButton} from '@/components/addLearningDialogue'
import React from 'react'

const MyLearnings = async () => {
  const session = await auth()
  return (
    <div>
        <AddLearningButton userId={session?.user?.id} />
    </div>
  )
}

export default MyLearnings