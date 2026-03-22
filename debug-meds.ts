import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase/config';

async function checkMeds() {
  try {
    const colRef = collection(db, 'medications');
    const snapshot = await getDocs(colRef);
    console.log(`Found ${snapshot.size} medications.`);
    snapshot.docs.forEach(d => console.log(`- ${d.data().name} (${d.id})`));
  } catch (e) {
    console.error(e);
  }
}

checkMeds();
