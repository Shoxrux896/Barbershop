// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, getDocs, updateDoc, deleteDoc, doc, onSnapshot, where } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA85t7qgFAJiiIzVsVGpyWIzPxCzrDyAjQ",
  authDomain: "barbershop-c7b1e.firebaseapp.com",
  projectId: "barbershop-c7b1e",
  storageBucket: "barbershop-c7b1e.firebasestorage.app",
  messagingSenderId: "113177533174",
  appId: "1:113177533174:web:c6cd4c0140f3412d9caad7",
  measurementId: "G-EXBHXQ2MYT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Firestore and Auth
const db = getFirestore(app)
const auth = getAuth(app)

// Helper: add booking
async function addBooking(data){
  const col = collection(db, 'bookings')
  // normalize date/time strings to avoid mismatches (trim / ensure string)
  const safe = {
    ...data,
    date: data && data.date ? String(data.date) : '',
    time: data && data.time ? String(data.time).trim() : '',
  }
  const docRef = await addDoc(col, { ...safe, createdAt: serverTimestamp(), processed: false })
  return docRef.id
}

async function fetchBookings(){
  const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

async function fetchBookingsByDate(dateString){
  try{
    const q = query(collection(db, 'bookings'), where('date', '==', dateString), orderBy('createdAt','desc'))
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
  }catch(err){
    // If composite index isn't ready yet or required, fall back to simple where() without orderBy
    if(String(err).toLowerCase().includes('requires an index')){
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

function onBookingsSnapshot(cb){
  const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
  // provide error callback to surface permission/index issues
  return onSnapshot(q, snapshot => {
    cb(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
  }, err => {
    console.error('onBookingsSnapshot error', err)
    // notify caller that nothing could be loaded
    try { cb([]) } finally { /* ignore errors from callback */ }
  })
}

async function markProcessed(id, value=true){
  const d = doc(db, 'bookings', id)
  await updateDoc(d, { processed: value })
}

async function removeBooking(id){
  const d = doc(db, 'bookings', id)
  await deleteDoc(d)
}

async function signIn(email, password){
  return signInWithEmailAndPassword(auth, email, password)
}

async function signOut(){
  return fbSignOut(auth)
}

export { app, analytics, db, auth, addBooking, fetchBookings, fetchBookingsByDate, onBookingsSnapshot, markProcessed, removeBooking, signIn, signOut }