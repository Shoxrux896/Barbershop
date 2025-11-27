import { useState, useEffect } from 'react'
import { addBooking, fetchBookingsByDate } from '../firebase'

const BookingForm = () => {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [service, setService] = useState('')
    const [date, setDate] = useState('')
    const [days, setDays] = useState([])
    const [bookedTimes, setBookedTimes] = useState([])
    const [time, setTime] = useState('')
    const [message, setMessage] = useState(null)
    const [loading, setLoading] = useState(false)

    // Simple rate-limit: one booking per 30 seconds per browser
    const canSubmit = () => {
        const last = localStorage.getItem('lastBookingTime')
        if (!last) return true
        return (Date.now() - Number(last)) > 30_000
    }

    const notifyBrowser = (title, body) => {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(title, { body })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Honeypot field to avoid bots
        const form = e.target
        const hp = form.querySelector('input[name="website"]')
        if (hp && hp.value) {
            // suspicious
            setMessage({ type: 'error', text: 'Ошибка отправки.' })
            return
        }

        if (!canSubmit()) {
            setMessage({ type: 'error', text: 'Пожалуйста, подождите несколько секунд перед новой записью.' })
            return
        }

        if (!name || !phone || !service || !date || !time) {
            setMessage({ type: 'error', text: 'Пожалуйста, заполните все поля.' })
            return
        }

        // Double-check slot availability just before submitting
        try {
            const current = await fetchBookingsByDate(date)
            const timesNow = current.map(r => r.time)
            if (timesNow.includes(time)) {
                // refresh bookedTimes and try to pick nearest free slot automatically
                setBookedTimes(timesNow)
                const allSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
                const free = allSlots.filter(s => !timesNow.includes(s))
                if (free.length) {
                    setTime(free[0])
                    setMessage({ type: 'info', text: `Выбран ближайший свободный слот: ${free[0]}` })
                    return
                } else {
                    setMessage({ type: 'error', text: 'Извините, на выбранную дату нет свободных слотов. Выберите другую дату.' })
                    return
                }
            }
        } catch (err) {
            console.warn('Не удалось проверить текущие брони', err)
            // proceed anyway — server-side check is recommended
        }

        setLoading(true)
        setMessage(null)
        try {
            const newId = await addBooking({ name, phone, service, date, time })
            localStorage.setItem('lastBookingTime', String(Date.now()))
            setMessage({ type: 'success', text: 'Запись принята. Спасибо!' })
            console.log('Booking created, id=', newId)
            // refresh booked times so UI reflects new booking
            try {
                const refreshed = await fetchBookingsByDate(date)
                setBookedTimes(refreshed.map(r => r.time))
            } catch (e) { console.warn('refresh failed', e) }
            // try browser notification
            if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
                Notification.requestPermission().then(p => { if (p === 'granted') notifyBrowser('Новая запись', `Запись от ${name} на ${date} ${time}`) })
            } else {
                notifyBrowser('Новая запись', `Запись от ${name} на ${date} ${time}`)
            }
            // reset
            setName('')
            setPhone('')
            setService('')
            setDate('')
            setTime('')
        } catch (err) {
            console.error(err)
            setMessage({ type: 'error', text: 'Не удалось отправить. Попробуйте позже.' })
        } finally {
            setLoading(false)
        }
    }

    // prepare next 14 days for easy selection (set once)
    const getNextDays = (count = 14) => {
        const out = []
        const names = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
        for (let i = 0; i < count; i++) {
            const d = new Date()
            d.setDate(d.getDate() + i)
            const yyyy = d.getFullYear()
            const mm = String(d.getMonth() + 1).padStart(2, '0')
            const dd = String(d.getDate()).padStart(2, '0')
            const dayName = names[d.getDay()]
            out.push({ value: `${yyyy}-${mm}-${dd}`, label: `${dayName} ${dd}.${mm}.${yyyy}` })
        }
        return out
    }

    useEffect(() => {
        const d = getNextDays(14)
        // initialize days with basic info
        const init = d.map(x => ({ ...x, taken: 0, total: 11 }))
        setDays(init)
        if (!date && init.length) setDate(init[0].value)

        // fetch booked counts for these days to show availability
        let mounted = true
            ; (async () => {
                try {
                    const promises = init.map(day => fetchBookingsByDate(day.value).catch(() => []))
                    const results = await Promise.all(promises)
                    if (!mounted) return
                    const updated = init.map((day, i) => {
                        const taken = Array.isArray(results[i]) ? results[i].filter(r => r.time).length : 0
                        return { ...day, taken, total: 11 }
                    })
                    setDays(updated)
                    // if current selected date is fully booked, choose next free
                    const cur = updated.find(d => d.value === date) || updated[0]
                    if (cur && cur.taken >= cur.total) {
                        const nextFree = updated.find(d => d.taken < d.total)
                        if (nextFree) setDate(nextFree.value)
                    }
                } catch (e) {
                    console.warn('Failed to load availability for dates', e)
                    const s = String(e).toLowerCase()
                    if (s.includes('permission') || s.includes('missing or insufficient')) {
                        setMessage({ type: 'error', text: 'Не удалось загрузить доступность. Возможно, правила Firestore запрещают чтение или запросы блокируются расширениями.' })
                    }
                }
            })()

        return () => { mounted = false }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // load booked times when date changes
    useEffect(() => {
        if (!date) return
        let mounted = true
        const load = async () => {
            try {
                const results = await fetchBookingsByDate(date)
                console.debug('fetchBookingsByDate ->', date, results)
                if (!mounted) return
                const times = results.map(r => (r.time ? String(r.time).trim() : '')).filter(Boolean)
                setBookedTimes(times)
            } catch (e) {
                console.error('Failed to load bookings for date', e)
                const s = String(e).toLowerCase()
                if (s.includes('permission') || s.includes('missing or insufficient')) {
                    setMessage({ type: 'error', text: 'Нет доступа к данным бронирований. Проверьте правила Firestore или откройте сайт без блокировщиков.' })
                }
            }
        }
        load()
        return () => { mounted = false }
    }, [date])

    return (
        <section id="booking">
            <h2>Онлайн запись</h2>
            <div className="booking-form">
                <form onSubmit={handleSubmit}>
                    {/* Honeypot field (hidden for users) */}
                    <input name="website" type="text" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

                    <div className="form-group">
                        <label>Ваше имя</label>
                        <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Введите ваше имя" required />
                    </div>
                    <div className="form-group">
                        <label>Телефон</label>
                        <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="+998 90 123 45 67" required />
                    </div>
                    <div className="form-group">
                        <label>Услуга</label>
                        <select value={service} onChange={e => setService(e.target.value)} required>
                            <option value="">Выберите услугу</option>
                            <option>Классическая стрижка - 1500₽</option>
                            <option>Фейд - 2000₽</option>
                            <option>Стрижка бороды - 1000₽</option>
                            <option>Комплекс - 3500₽</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Дата</label>
                        <select value={date} onChange={e => setDate(e.target.value)} required>
                            {days.map(d => (
                                <option key={d.value} value={d.value} disabled={d.taken >= (d.total || 11)}>
                                    {d.label} {typeof d.taken === 'number' ? `(${d.taken}/${d.total} занято)` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Время</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map(slot => {
                                const taken = bookedTimes.includes(slot)
                                const isSelected = time === slot
                                return (
                                    <button
                                        key={slot}
                                        type="button"
                                        onClick={() => { if (!taken) setTime(slot) }}
                                        disabled={taken}
                                        aria-disabled={taken}
                                        title={taken ? 'Занято' : `Выбрать ${slot}`}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: 6,
                                            border: isSelected ? '2px solid #0066ff' : '1px solid #ccc',
                                            background: taken ? '#f5f5f5' : (isSelected ? '#e6f0ff' : '#fff'),
                                            color: taken ? '#888' : '#000',
                                            cursor: taken ? 'not-allowed' : 'pointer',
                                            position: 'relative'
                                        }}
                                    >
                                        <span>{slot}</span>
                                        {taken && (
                                            <span style={{ marginLeft: 8, fontSize: 12, color: '#b00020' }}>Занято</span>
                                        )}
                                        {isSelected && !taken && (
                                            <span style={{ marginLeft: 8, fontSize: 12, color: '#0066ff' }}>Выбрано</span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                    <button disabled={loading} type="submit" className="btn" style={{ width: '100%', cursor: 'pointer', border: 'none' }}>{loading ? 'Отправляется...' : 'Записаться'}</button>
                    {message && (
                        <div style={{ marginTop: 12, color: message.type === 'error' ? '#b00020' : '#0a0' }}>{message.text}</div>
                    )}
                </form>
            </div>
        </section>
    );
}
export default BookingForm;