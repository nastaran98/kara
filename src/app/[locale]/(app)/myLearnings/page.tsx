import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { auth } from '@/auth'
import {AddLearningButton} from '@/components/addLearningDialogue'
import React from 'react'

const MyLearnings = async () => {
  const session = await auth()
  const locale = await getLocale()

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  return (
    <div>
        <AddLearningButton userId={session.user.id} />
    </div>
  )
}

export default MyLearnings