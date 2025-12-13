import { useEffect, useMemo, useState } from "react";
import { onBookingsSnapshot, markProcessed, removeBooking, auth } from "../firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

function formatCreated(createdAt) {
  try {
    if (!createdAt) return "-";
    if (createdAt.toDate) return createdAt.toDate().toLocaleString();
    return new Date(
      createdAt.seconds ? createdAt.seconds * 1000 : createdAt
    ).toLocaleString();
  } catch {
    return String(createdAt);
  }
}

export default function Admin() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Success is handled by onAuthStateChanged
    } catch (err) {
      console.error(err);
      setError("Ошибка входа: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState([]);

  const pageSize = 20;

  useEffect(() => {
    if (!user) return;
    const unsub = onBookingsSnapshot((data) => setBookings(data));
    return () => unsub && unsub();
  }, [user]);

  const services = useMemo(() => {
    const s = new Set();
    bookings.forEach((b) => b.service && s.add(b.service));
    return [...s];
  }, [bookings]);

  const dates = useMemo(() => {
    const s = new Set();
    bookings.forEach((b) => b.date && s.add(b.date));
    return [...s].sort();
  }, [bookings]);


  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return bookings.filter((b) => {
      if (dateFilter && b.date !== dateFilter) return false;
      if (serviceFilter && b.service !== serviceFilter) return false;

      if (!q) return true;

      return (
        b.name.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q) ||
        String(b.service).toLowerCase().includes(q) ||
        String(b.id).toLowerCase().includes(q)
      );
    });
  }, [bookings, search, dateFilter, serviceFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let A = sortField === "createdAt" ? a.createdAt?.seconds || 0 : a[sortField];
      let B = sortField === "createdAt" ? b.createdAt?.seconds || 0 : b[sortField];

      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const toggleSort = (field) => {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const toggleProcessed = async (id, current) => {
    await markProcessed(id, !current);
  };

  const doRemove = async (id) => {
    if (!confirm("Удалить запись?")) return;

    setDeleting((p) => [...p, id]);

    try {
      await removeBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert("Ошибка удаления");
    }

    setDeleting((p) => p.filter((x) => x !== id));
  };

  if (authLoading) return <div style={{ padding: 20, color: '#fff' }}>Загрузка...</div>;

  if (!user) {
    return (
      <div className="admin-login">
        <h2>Админ вход</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email (Admin)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </button>

          {error && <div style={{ color: '#e53935', marginTop: 10 }}>{error}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="admin">
      <div className="admin-top">
        <h2>Записи ({user.email})</h2>
        <button onClick={handleLogout}>Выйти</button>
      </div>

      <div className="filters">
        <input
          placeholder="Поиск"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          onChange={(e) => setDateFilter(e.target.value)}
          value={dateFilter}
        >
          <option value="">Все даты</option>
          {dates.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <select
          onChange={(e) => setServiceFilter(e.target.value)}
          value={serviceFilter}
        >
          <option value="">Все услуги</option>
          {services.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort("name")}>Имя</th>
              <th onClick={() => toggleSort("phone")}>Телефон</th>
              <th>Услуга</th>
              <th onClick={() => toggleSort("date")}>Дата</th>
              <th onClick={() => toggleSort("time")}>Время</th>
              <th onClick={() => toggleSort("createdAt")}>Создано</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {paged.map((b) => (
              <tr key={b.id} className={!b.processed ? "row-unprocessed" : ""}>
                <td data-label="Имя">{b.name}</td>
                <td data-label="Телефон">{b.phone}</td>
                <td data-label="Услуга">{b.service}</td>
                <td data-label="Дата">{b.date}</td>
                <td data-label="Время">{b.time}</td>
                <td data-label="Создано">{formatCreated(b.createdAt)}</td>

                <td data-label="Статус">
                  {b.processed ? (
                    <span className="chip ok">Готово</span>
                  ) : (
                    <span className="chip danger">Нет</span>
                  )}
                </td>

                <td>
                  <button
                    onClick={() => toggleProcessed(b.id, b.processed)}
                  >
                    {b.processed ? "Отметить" : "Готово"}
                  </button>

                  <button
                    className="danger"
                    onClick={() => doRemove(b.id)}
                    disabled={deleting.includes(b.id)}
                  >
                    {deleting.includes(b.id) ? "..." : "Удалить"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button disabled={page === 0} onClick={() => setPage(0)}>
          « Первая
        </button>

        <button
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          ‹ Prev
        </button>

        <span>
          {page + 1} / {totalPages || 1}
        </span>

        <button
          disabled={page >= totalPages - 1}
          onClick={() => setPage((p) => p + 1)}
        >
          Next ›
        </button>

        <button
          disabled={page >= totalPages - 1}
          onClick={() => setPage(totalPages - 1)}
        >
          Последняя »
        </button>
      </div>
    </div>
  );
}
