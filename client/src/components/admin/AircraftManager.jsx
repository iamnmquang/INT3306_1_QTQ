import React, { useEffect, useState } from 'react';
import { aircraftApi } from '../../api/aircraftApi';
import Modal from '../common/Modal';

export default function AircraftManager(){
  const [list, setList] = useState([]);
  const [loading,setLoading]=useState(false);
  const [form,setForm]=useState({ code:'', manufacturer:'', seats:[] });
  const [editingId,setEditingId]=useState(null);
  const [showModal,setShowModal]=useState(false);

  const load = async ()=>{
    setLoading(true);
    try{
      const data = await aircraftApi.getAll();
      setList(data);
    }catch(err){ console.error(err); alert('Lỗi tải danh sách máy bay'); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ load(); },[]);

  const openCreate = ()=>{ setEditingId(null); setForm({ code:'', manufacturer:'', seats:[] }); setShowModal(true); };
  const openEdit = (a)=>{ setEditingId(a.id); setForm({ code:a.code || a.name || '', manufacturer:a.manufacturer || '', seats:a.seats || [] }); setShowModal(true); };

  const submit = async (e)=>{
    e && e.preventDefault();
    if (!form.code || !form.manufacturer) return alert('Mã và hãng là bắt buộc');
    try{
      if(editingId) await aircraftApi.update(editingId, form);
      else await aircraftApi.create(form);
      setForm({ code:'', manufacturer:'', seats:[] });
      setEditingId(null);
      setShowModal(false);
      load();
    }catch(err){ console.error(err); alert('Lỗi lưu máy bay'); }
  };

  const addSeatRow = () => setForm(prev => ({ ...prev, seats: [...(prev.seats||[]), { seatNumber: '', class: 'ECONOMY' }] }));
  const updateSeat = (idx, key, value) => setForm(prev => ({ ...prev, seats: prev.seats.map((s,i)=> i===idx ? ({ ...s, [key]: value }) : s) }));
  const removeSeat = (idx) => setForm(prev => ({ ...prev, seats: prev.seats.filter((_,i)=>i!==idx) }));

  const remove = async (id)=>{ if(!confirm('Xác nhận xóa?')) return; try{ await aircraftApi.delete(id); load(); }catch(err){ console.error(err); alert('Lỗi xóa'); } };

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Quản lý tàu bay</h3>
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={openCreate}>Thêm tàu bay</button>
      </div>

      <div>
        {loading ? <div>Đang tải...</div> : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b"><th>Mã</th><th>Hãng</th><th>Seats</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {list.map(a=> (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{a.code || a.name}</td>
                  <td>{a.manufacturer}</td>
                  <td>{(a.seats||[]).length}</td>
                  <td className="py-2"><button className="mr-2 text-blue-600" onClick={()=>openEdit(a)}>Sửa</button><button className="text-red-600" onClick={()=>remove(a.id)}>Xóa</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal title={editingId ? 'Sửa tàu bay' : 'Tạo tàu bay'} open={showModal} onClose={()=>setShowModal(false)} footer={(
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={()=>setShowModal(false)}>Hủy</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={submit}>{editingId ? 'Cập nhật' : 'Tạo'}</button>
        </div>
      )}>
        <form className="space-y-2" onSubmit={submit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input className="p-2 border rounded" placeholder="Mã / Tên" value={form.code} onChange={(e)=>setForm({...form, code:e.target.value})} required />
            <input className="p-2 border rounded" placeholder="Hãng sản xuất" value={form.manufacturer} onChange={(e)=>setForm({...form, manufacturer:e.target.value})} required />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Seats</div>
              <button type="button" className="text-sm px-2 py-1 bg-gray-100 rounded" onClick={addSeatRow}>Thêm ghế</button>
            </div>

            <div className="space-y-2">
              {(form.seats || []).map((s, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input className="p-2 border rounded flex-1" placeholder="Seat number" value={s.seatNumber} onChange={(e)=>updateSeat(idx,'seatNumber',e.target.value)} />
                  <select className="p-2 border rounded" value={s.class} onChange={(e)=>updateSeat(idx,'class',e.target.value)}>
                    <option value="ECONOMY">Economy</option>
                    <option value="BUSINESS">Business</option>
                    <option value="FIRST_CLASS">First</option>
                  </select>
                  <button type="button" className="text-red-600" onClick={()=>removeSeat(idx)}>Xóa</button>
                </div>
              ))}
              {(form.seats || []).length === 0 && <div className="text-sm text-gray-400">Chưa có ghế nào</div>}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}