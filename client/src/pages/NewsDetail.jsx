import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { newsApi } from '../api/newsApi'

export default function NewsDetail(){
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(()=>{
    const load = async ()=>{
      setLoading(true)
      try{
        const data = await newsApi.getById(id)
        setItem(data)
      }catch(err){ console.error(err); }
      finally{ setLoading(false) }
    }
    load()
  },[id])

  if(loading) return <div className="p-6">Đang tải...</div>
  if(!item) return <div className="p-6">Bài viết không tìm thấy</div>

  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <button className="text-sm text-blue-600 mb-4" onClick={()=>navigate(-1)}>← Quay lại</button>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {item.thumbnailUrl && <div className="h-64 bg-cover bg-center" style={{backgroundImage:`url(${item.thumbnailUrl})`}} />}
          <div className="p-6">
            <div className="text-sm text-gray-400 mb-2">{new Date(item.createdAt).toLocaleString()}</div>
            <h1 className="text-2xl font-bold mb-4">{item.title}</h1>
            <div className="prose max-w-none text-gray-700">
              {/* If content contains HTML, render it; otherwise show text */}
              {item.content ? (
                <div dangerouslySetInnerHTML={{__html: item.content}} />
              ) : (
                <div>Không có nội dung</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}