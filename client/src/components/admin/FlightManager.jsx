import React, { useEffect, useState } from 'react';
import { flightApi } from '../../api/flightApi';
import { aircraftApi } from '../../api/aircraftApi';
import { airportApi } from '../../api/airportApi';
import Modal from '../common/Modal';

export default function FlightManager(){
  const [list,setList]=useState([]);
  const [loading,setLoading]=useState(false);
  const [aircrafts,setAircrafts]=useState([]);
  const [airports,setAirports]=useState([]);
  const [form,setForm]=useState({ flightNumber:'', aircraftId:null, departureAirportId:null, arrivalAirportId:null, departureTime:'', arrivalTime:'', status:'SCHEDULED' });
  const [editingId,setEditingId]=useState(null);
  const [showModal,setShowModal]=useState(false);

  const load = async ()=>{
    setLoading(true);
    try{
      setAircrafts(await aircraftApi.getAll());
      setAirports(await airportApi.getAll());
      const data = await flightApi.getAll();
      setList(data);
    }catch(err){ console.error(err); alert('Lỗi tải chuyến bay'); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ load(); },[]);

  const openCreate = ()=>{ setEditingId(null); setForm({ flightNumber:'', aircraftId:null, departureAirportId:null, arrivalAirportId:null, departureTime:'', arrivalTime:'', status:'SCHEDULED' }); setShowModal(true); };
  const openEdit = (f)=>{ setEditingId(f.id); setForm({ flightNumber:f.flightNumber, aircraftId:f.aircraftId, departureAirportId:f.departureAirportId, arrivalAirportId:f.arrivalAirportId, departureTime:f.departureTime, arrivalTime:f.arrivalTime, status:f.status }); setShowModal(true); };

  const submit = async (e)=>{
    e && e.preventDefault();
    if (!form.flightNumber) return alert('Số hiệu chuyến là bắt buộc');
    try{
      if(editingId) await flightApi.update(editingId, form);
      else await flightApi.create(form);
      setForm({ flightNumber:'', aircraftId:null, departureAirportId:null, arrivalAirportId:null, departureTime:'', arrivalTime:'', status:'SCHEDULED' });
      setEditingId(null);
      setShowModal(false);
      load();
    }catch(err){ console.error(err); alert('Lỗi lưu chuyến bay'); }
  };

  const remove = async (id)=>{ if(!confirm('Xác nhận xóa?')) return; try{ await flightApi.delete(id); load(); }catch(err){ console.error(err); alert('Lỗi xóa'); } };

  const delayFlight = async (f)=>{
    const newTime = prompt('Nhập giờ khởi hành mới (ISO hoặc "YYYY-MM-DDTHH:mm")', f.departureTime);
    if(!newTime) return;
    try{
      await flightApi.update(f.id, { ...f, departureTime: newTime });
      load();
    }catch(err){ console.error(err); alert('Lỗi cập nhật thời gian'); }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Quản lý chuyến bay</h3>
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={openCreate}>Tạo chuyến</button>
      </div>

      <div>
        {loading ? <div>Đang tải...</div> : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b"><th>Số hiệu</th><th>Máy bay</th><th>From → To</th><th>Departure</th><th>Status</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {list.map(f => (
                <tr key={f.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{f.flightNumber}</td>
                  <td>{f.aircraft?.name || f.aircraft?.code || f.aircraftId}</td>
                  <td>{f.departureAirport?.iataCode || '-'} → {f.arrivalAirport?.iataCode || '-'}</td>
                  <td>{new Date(f.departureTime).toLocaleString()}</td>
                  <td>{f.status}</td>
                  <td className="py-2">
                    <button className="mr-2 text-blue-600" onClick={()=>openEdit(f)}>Sửa</button>
                    <button className="mr-2 text-orange-600" onClick={()=>delayFlight(f)}>Delay</button>
                    <button className="text-red-600" onClick={()=>remove(f.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal title={editingId ? 'Sửa chuyến bay' : 'Tạo chuyến bay'} open={showModal} onClose={()=>setShowModal(false)} footer={(
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={()=>setShowModal(false)}>Hủy</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={submit}>{editingId ? 'Cập nhật' : 'Tạo'}</button>
        </div>
      )}>
        <form className="space-y-2" onSubmit={submit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input className="p-2 border rounded" placeholder="Số hiệu chuyến" value={form.flightNumber} onChange={(e)=>setForm({...form, flightNumber:e.target.value})} required />
            <select className="p-2 border rounded" value={form.aircraftId || ''} onChange={(e)=>setForm({...form, aircraftId: e.target.value || null })}>
              <option value="">-- Chọn tàu bay --</option>
              {aircrafts.map(a => <option key={a.id} value={a.id}>{a.code || a.name} - {a.manufacturer}</option>)}
            </select>
            <select className="p-2 border rounded" value={form.departureAirportId || ''} onChange={(e)=>setForm({...form, departureAirportId: e.target.value || null })}>
              <option value="">-- Chọn sân bay đi --</option>
              {airports.map(a => <option key={a.id} value={a.id}>{a.iataCode} - {a.city || a.name}</option>)}
            </select>
            <select className="p-2 border rounded" value={form.arrivalAirportId || ''} onChange={(e)=>setForm({...form, arrivalAirportId: e.target.value || null })}>
              <option value="">-- Chọn sân bay đến --</option>
              {airports.map(a => <option key={a.id} value={a.id}>{a.iataCode} - {a.city || a.name}</option>)}
            </select>
            <input className="p-2 border rounded" type="datetime-local" value={form.departureTime?.slice(0,16) || ''} onChange={(e)=>setForm({...form, departureTime:e.target.value})} />
            <input className="p-2 border rounded" type="datetime-local" value={form.arrivalTime?.slice(0,16) || ''} onChange={(e)=>setForm({...form, arrivalTime:e.target.value})} />
            <select className="p-2 border rounded" value={form.status || 'SCHEDULED'} onChange={(e)=>setForm({...form, status:e.target.value})}>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="DELAYED">DELAYED</option>
              <option value="DEPARTED">DEPARTED</option>
              <option value="ARRIVED">ARRIVED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}