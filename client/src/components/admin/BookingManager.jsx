import React, { useEffect, useState } from 'react';
import { ticketApi } from '../../api/ticketApi';
import Modal from '../common/Modal';

export default function BookingManager(){
  const [list,setList]=useState([]);
  const [loading,setLoading]=useState(false);
  const [viewItem,setViewItem]=useState(null);

  const load = async ()=>{
    setLoading(true);
    try{
      const data = await ticketApi.getAll();
      setList(data);
    }catch(err){ console.error(err); alert('Lỗi tải booking'); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ load(); },[]);

  const cancelTicket = async (t)=>{
    if(!confirm('Xác nhận hủy vé?')) return;
    try{
      await ticketApi.update(t.id, { isCancelled: true });
      load();
      setViewItem(null);
    }catch(err){ console.error(err); alert('Lỗi hủy vé'); }
  };

  const sendETicket = async (t)=>{
    try{
      await ticketApi.sendETicket(t.bookingReference);
      alert('E-ticket đã được gửi');
    }catch(err){ console.error(err); alert('Lỗi gửi e-ticket'); }
  };

  const remove = async (id)=>{ if(!confirm('Xác nhận xóa?')) return; try{ await ticketApi.delete(id); load(); }catch(err){ console.error(err); alert('Lỗi xóa vé'); } };

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Xem & Thống kê đặt vé</h3>
      </div>

      <div className="mb-4">
        <strong>Tổng vé: </strong> {list.length}
      </div>

      <div>
        {loading ? <div>Đang tải...</div> : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b"><th>BookingRef</th><th>Ticket#</th><th>Flight</th><th>Seat</th><th>Passenger</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {list.map(t => (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{t.bookingReference}</td>
                  <td>{t.ticketNumber}</td>
                  <td>{t.flight?.flightNumber}</td>
                  <td className="py-2">{t.seatNumber || t.seatDetail?.seatNumber || (t.flightSeat ? `${t.flightSeat.seatClass || ''}` : '—')}</td>
                  <td>{t.passenger?.fullName || t.passengerName || t.bookedBy?.name || '—'}</td>
                  <td className="py-2">
                    <button className="mr-2 text-blue-600" onClick={()=>setViewItem(t)}>Xem</button>
                    <button className="mr-2 text-orange-600" onClick={()=>sendETicket(t)}>Gửi E-ticket</button>
                    <button className="text-red-600" onClick={()=>remove(t.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal title={viewItem ? `Booking ${viewItem?.bookingReference}` : 'Booking'} open={!!viewItem} onClose={()=>setViewItem(null)} footer={viewItem && (
        <div className="flex justify-end gap-2">
          {!viewItem.isCancelled && <button className="px-4 py-2 bg-orange-600 text-white rounded" onClick={()=>cancelTicket(viewItem)}>Hủy vé</button>}
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={()=>setViewItem(null)}>Đóng</button>
        </div>
      )}>
        {viewItem && (
          <div>
            <div><strong>Ticket#:</strong> {viewItem.ticketNumber}</div>
            <div><strong>BookingRef:</strong> {viewItem.bookingReference}</div>
            <div><strong>Flight:</strong> {viewItem.flight?.flightNumber}</div>
            <div><strong>Seat:</strong> {viewItem.seatNumber || viewItem.seatDetail?.seatNumber || (viewItem.flightSeat ? `${viewItem.flightSeat.seatClass || ''}` : '—')}</div>
            <div><strong>Passenger:</strong> {viewItem.passenger?.fullName || viewItem.passengerName || viewItem.bookedBy?.name || '—'}</div>
            <div><strong>Booked at:</strong> {new Date(viewItem.bookedAt).toLocaleString()}</div>
            <div><strong>Cancelled:</strong> {viewItem.isCancelled ? 'Yes' : 'No'}</div>
          </div>
        )}
      </Modal>
    </div>
  );
}