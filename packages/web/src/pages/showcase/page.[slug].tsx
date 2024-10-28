import { Button } from '@web-archive/shared/components/button'
import { useKeyPress, useRequest } from 'ahooks'
import { ArrowLeft, ArrowRight, House } from 'lucide-react'
import { useEffect } from 'react'
import PoweredBy from '~/components/powerd-by'
import { getNextShowcasePageId } from '~/data/showcase'
import { useNavigate, useParams } from '~/router'

async function getPageContent(pageId: string | undefined) {
  if (!pageId)
    return ''
  const url = `/api/showcase/content?pageId=${pageId}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/html',
    },
  })
  return await res.text()
}

function ShowcasePage() {
  const navigate = useNavigate()
  const { slug } = useParams('/showcase/page/:slug')
  useEffect(() => {
    if (!slug) {
      navigate('/showcase/folder')
    }
  })

  const { run: goNext, loading: getNextLoading } = useRequest(
    getNextShowcasePageId,
    {
      manual: true,
      onSuccess(nextId) {
        navigate('/showcase/page/:slug', {
          params: {
            slug: String(nextId),
          },
        })
      },
    },
  )

  const goBack = () => {
    window.history.back()
  }
  const goHome = () => {
    navigate('/showcase/folder')
  }

  useKeyPress('leftarrow', () => {
    goBack()
  })
  useKeyPress('rightarrow', () => {
    goNext(Number(slug))
  })

  const { slug: pageId } = useParams('/showcase/page/:slug')
  const { data: pageContentUrl, loading: pageLoading } = useRequest(async () => {
    const pageHtml = await getPageContent(slug)
    const objectUrl = URL.createObjectURL(new Blob([pageHtml], { type: 'text/html' }))
    return objectUrl
  }, {
    refreshDeps: [pageId],
  })
  useEffect(() => {
    return () => {
      pageContentUrl && URL.revokeObjectURL(pageContentUrl)
    }
  }, [pageContentUrl])

  return (
    <main className="min-h-screen flex flex-col">
      <div className="w-screen z-20 fixed flex justify-between items-center">
        <Button variant="ghost" onClick={goHome} className="m-2">
          <House className="w-8 h-8" />
        </Button>
        <PoweredBy />
      </div>
      <div className="flex flex-1 pt-20">
        <nav className="p-2 justify-between items-center hidden xl:flex">
          <Button variant="ghost" size="sm" onClick={goBack} className="h-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </nav>
        <div className="flex-1 p-4 pt-0">
          {
          (pageLoading || getNextLoading)
            ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="m-b-xl h-8 w-8 animate-spin border-4 border-t-transparent rounded-full border-primary"></div>
                <div>Loading...</div>
              </div>
              )
            : (
              <iframe
                src={pageContentUrl}
                className="w-full h-full bg-current"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
              )
        }
        </div>
        <nav className="p-2 justify-between items-center hidden xl:flex">
          <Button variant="ghost" size="sm" onClick={() => goNext(Number(slug))} className="h-full">
            <ArrowRight className="w-5 h-5" />
          </Button>
        </nav>
      </div>
    </main>
  )
}

export default ShowcasePage
