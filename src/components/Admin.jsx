import { useEffect, useMemo, useState } from 'react'
import { onBookingsSnapshot, markProcessed, removeBooking } from '../firebase'

function formatCreated(createdAt){
  try{
    if(!createdAt) return '-'
    if(createdAt.toDate) return createdAt.toDate().toLocaleString()
    return new Date(createdAt.seconds ? createdAt.seconds * 1000 : createdAt).toLocaleString()
  }catch{ return String(createdAt) }
}

const Admin = ()=>{
  const [user, setUser] = useState(()=>{ try{ return sessionStorage.getItem('isAdmin') === '1' }catch{ return false } })
  const [password, setPassword] = useState('')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [deletingIds, setDeletingIds] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 20

  useEffect(()=>{
    if(!user) return
    const unsub = onBookingsSnapshot(setBookings)
    return ()=> unsub && unsub()
  }, [user])

  const handleLogin = (e)=>{
    e && e.preventDefault()
    setLoading(true)
    const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
    setTimeout(()=>{
      if(password === ADMIN_PASSWORD){
        try{ sessionStorage.setItem('isAdmin','1') }catch(err){ console.warn('sessionStorage set failed', err) }
        setUser(true)
      } else {
        alert('Неверный пароль')
      }
      setLoading(false)
    }, 250)
  }

  const handleLogout = ()=>{
    try{ sessionStorage.removeItem('isAdmin') }catch(err){ console.warn('sessionStorage remove failed', err) }
    setUser(false)
    setBookings([])
  }

  const dates = useMemo(()=>{
    const s = new Set()
    bookings.forEach(b=>{ if(b.date) s.add(b.date) })
    return Array.from(s).sort()
  }, [bookings])

  // debounce search term to avoid filtering on every keystroke
  useEffect(()=>{
    const t = setTimeout(()=> setQuery(searchTerm), 300)
    return ()=> clearTimeout(t)
  }, [searchTerm])

  const filtered = useMemo(()=>{
    const q = queryLower(query)
    return bookings.filter(b=>{
      if(dateFilter && b.date !== dateFilter) return false
      if(!q) return true
      return (String(b.name||'').toLowerCase().includes(q) || String(b.phone||'').toLowerCase().includes(q) || String(b.service||'').toLowerCase().includes(q))
    })
  }, [bookings, query, dateFilter])

  // reset page when filters change
  useEffect(()=>{ setPage(0) }, [query, dateFilter, bookings])

  function queryLower(v){ return String(v||'').toLowerCase() }

  const total = bookings.length
  const unprocessed = bookings.filter(b=>!b.processed).length
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = useMemo(()=> filtered.slice(page * pageSize, (page+1) * pageSize), [filtered, page])

  const doExport = ()=>{
    if(filtered.length===0) return alert('Нет записей для экспорта')
    const rows = [['ID','Имя','Телефон','Услуга','Дата','Время','Создано','Обработано']]
    filtered.forEach(b=> rows.push([b.id, b.name||'', b.phone||'', b.service||'', b.date||'', b.time||'', formatCreated(b.createdAt), b.processed ? 'Да' : 'Нет']))
    const csv = rows.map(r=> r.map(c=> '"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bookings.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleProcessed = async (id, current)=>{
    try{ await markProcessed(id, !current) }catch(e){ console.error(e); alert('Ошибка') }
  }

  const doRemove = async (id)=>{
    if(!confirm('Удалить запись?')) return
    setDeletingIds(s=>[...s, id])
    try{
      await removeBooking(id)
     
      setBookings(prev => prev.filter(b => b.id !== id))
    }catch(e){ console.error(e); alert('Ошибка удаления') }
    finally{ setDeletingIds(s => s.filter(x => x !== id)) }
  }

  if(!user){
    return (
      <div className="admin-panel" style={{ padding: 20 }}>
        <h2>Админ — вход</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 8 }}>
            <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Пароль администратора" type="password" required />
          </div>
          <button className="btn" disabled={loading} type="submit">Войти</button>
        </form>
        <p style={{ marginTop: 12 }}></p>
      </div>
    )
  }

  return (
    <div className="admin-panel" style={{ padding: 20 }}>
      <div className="admin-header" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Админка — записи</h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="chip">Всего: {total}</div>
          <div className="chip chip--danger">Непроверенные: {unprocessed}</div>
          <button className="btn" onClick={doExport}>Экспорт CSV</button>
          <button className="btn" onClick={handleLogout}>Выйти</button>
        </div>
      </div>

      <div className="admin-controls" style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <input placeholder="Поиск по имени/тел/услуге" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
        <select value={dateFilter} onChange={e=>setDateFilter(e.target.value)}>
          <option value="">Все даты</option>
          {dates.map(d=> <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="admin-table-wrap">
        {filtered.length === 0 ? (
          <div>Нет записей</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Телефон</th>
                <th>Услуга</th>
                <th>Дата</th>
                <th>Время</th>
                <th>Создано</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(b=> (
                <tr key={b.id} className={b.processed ? 'row--processed' : ''}>
                  <td>{b.name}</td>
                  <td>{b.phone}</td>
                  <td>{b.service}</td>
                  <td>{b.date}</td>
                  <td>{b.time}</td>
                  <td>{formatCreated(b.createdAt)}</td>
                  <td>{b.processed ? <span className="chip">Обработано</span> : <span className="chip chip--danger">Непр.</span>}</td>
                  <td>
                    <button className="btn btn--small" onClick={()=>toggleProcessed(b.id, b.processed)}>{b.processed ? 'Отметить' : 'Готово'}</button>
                    <button
                      className="btn btn--small btn--danger"
                      onClick={()=>doRemove(b.id)}
                      style={{ marginLeft: 8 }}
                      disabled={deletingIds.includes(b.id)}
                      aria-busy={deletingIds.includes(b.id)}
                    >
                      {deletingIds.includes(b.id) ? 'Удаляю...' : 'Удалить'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <div className="pagination">
          <button className="page-btn" onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page<=0}>‹ Prev</button>
          <span className="page-info">{page+1} / {totalPages}</span>
          <button className="page-btn" onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1}>Next ›</button>
        </div>
      </div>
    </div>
  )
}

export default Admin
