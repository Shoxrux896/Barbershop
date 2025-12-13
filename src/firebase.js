import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, getDocs, updateDoc, deleteDoc, doc, onSnapshot, where, limit } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyA85t7qgFAJiiIzVsVGpyWIzPxCzrDyAjQ",
  authDomain: "barbershop-c7b1e.firebaseapp.com",
  projectId: "barbershop-c7b1e",
  storageBucket: "barbershop-c7b1e.firebasestorage.app",
  messagingSenderId: "113177533174",
  appId: "1:113177533174:web:c6cd4c0140f3412d9caad7",
  measurementId: "G-EXBHXQ2MYT"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app)
const auth = getAuth(app)

async function addBooking(data) {
  const col = collection(db, 'bookings')
  const safe = {
    ...data,
    date: data && data.date ? String(data.date) : '',
    time: data && data.time ? String(data.time).trim() : '',
  }
  const docRef = await addDoc(col, { ...safe, createdAt: serverTimestamp(), processed: false })
  return docRef.id
}

async function fetchBookings() {
  const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

async function fetchBookingsByDate(dateString) {
  try {
    const q = query(collection(db, 'bookings'), where('date', '==', dateString), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => {
      const data = d.data() || {}
      return ({
        id: d.id,
        ...data,
        date: data.date ? String(data.date) : '',
        time: data.time ? String(data.time).trim() : ''
      })
    })
  } catch (err) {

    if (String(err).toLowerCase().includes('requires an index')) {
      const q2 = query(collection(db, 'bookings'), where('date', '==', dateString))
      const snap2 = await getDocs(q2)
      return snap2.docs.map(d => {
        const data = d.data() || {}
        return ({
          id: d.id,
          ...data,
          date: data.date ? String(data.date) : '',
          time: data.time ? String(data.time).trim() : ''
        })
      })
    }
    throw err
  }
}

// ... (other imports remain handled by context, but for safety I will target the specific function block)

function onBookingsSnapshot(cb) {
  // Limit to 70 most recent bookings for performance
  const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(70))

  return onSnapshot(q, snapshot => {
    cb(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
  }, err => {
    console.error('onBookingsSnapshot error', err)

    try { cb([]) } finally { /* ignore errors from callback */ }
  })
}

async function markProcessed(id, value = true) {
  const d = doc(db, 'bookings', id)
  await updateDoc(d, { processed: value })
}

async function removeBooking(id) {
  const d = doc(db, 'bookings', id)
  await deleteDoc(d)
}

async function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

async function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
}

async function signOut() {
  return fbSignOut(auth)
}

export { app, analytics, db, auth, addBooking, fetchBookings, fetchBookingsByDate, onBookingsSnapshot, markProcessed, removeBooking, signIn, signUp, signOut, onAuthStateChanged }