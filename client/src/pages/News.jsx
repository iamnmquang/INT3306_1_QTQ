import React, { useEffect, useState } from 'react'
import { newsApi } from '../api/newsApi'
import { useNavigate } from 'react-router-dom'

export default function News() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await newsApi.getAll()
        // show only published
        setList((data || []).filter(n => n.isPublished))
      } catch (err) {
        console.error('Load news error', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const preview = (content) => {
    if (!content) return ''
    return content.length > 150 ? content.slice(0, 147) + '...' : content
  }

  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-6">Bài viết & Khuyến mại</h1>

        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {list.map(n => (
              <div key={n.id} className="bg-white rounded-lg shadow overflow-hidden">
                {n.thumbnailUrl && (
                  <div className="h-48 bg-cover bg-center" style={{backgroundImage: `url(${n.thumbnailUrl})`}} />
                )}
                <div className="p-4">
                  <div className="text-sm text-gray-400 mb-1">{new Date(n.createdAt).toLocaleDateString()}</div>
                  <h2 className="text-lg font-semibold mb-2 cursor-pointer hover:text-blue-600" onClick={()=>navigate(`/news/${n.id}`)}>{n.title}</h2>
                  <p className="text-sm text-gray-600">{preview(n.content)}</p>
                  <div className="mt-3">
                    <button onClick={()=>navigate(`/news/${n.id}`)} className="text-blue-600 text-sm">Xem chi tiết →</button>
                  </div>
                </div>
              </div>
            ))}
            {list.length === 0 && <div className="text-gray-500">Không có bài viết nào.</div>}
          </div>
        )}
      </div>
    </div>
  )
}
