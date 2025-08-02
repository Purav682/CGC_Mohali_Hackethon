import IssueDetailPage from "@/components/issues/issue-detail-page"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function IssuePage({ params }: PageProps) {
  const { id } = await params
  return <IssueDetailPage issueId={id} />
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  // In a real app, fetch issue data to generate proper metadata
  return {
    title: `Issue #${id} - CivicTrack`,
    description: `View details and status history for civic issue #${id}`,
  }
}
