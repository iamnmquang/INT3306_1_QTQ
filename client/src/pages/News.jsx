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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Bài viết & Khuyến mại
          </h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-slate-500 font-medium">
              Đang tải nội dung…
            </div>
          </div>
        ) : (
          <>
            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {list.map(n => (
                <div
                  key={n.id}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition overflow-hidden"
                >
                  {/* Thumbnail */}
                  {n.thumbnailUrl && (
                    <div
                      className="h-52 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${n.thumbnailUrl})` }}
                    />
                  )}

                  {/* Content */}
                  <div className="p-5 flex flex-col h-full">
                    <div className="text-xs text-slate-400 mb-2">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </div>

                    <h2
                      className="text-lg font-semibold mb-2 cursor-pointer group-hover:text-indigo-600 transition"
                      onClick={() => navigate(`/news/${n.id}`)}
                    >
                      {n.title}
                    </h2>

                    <p className="text-sm text-slate-600 line-clamp-3">
                      {preview(n.content)}
                    </p>

                    <div className="mt-4">
                      <button
                        onClick={() => navigate(`/news/${n.id}`)}
                        className="text-indigo-600 text-sm font-medium hover:underline"
                      >
                        Xem chi tiết →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty */}
            {list.length === 0 && (
              <div className="text-center py-24 text-slate-500">
                Không có bài viết nào.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

}
