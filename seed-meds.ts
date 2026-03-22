import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from './firebase/config';

const INITIAL_SEED_DATA = [
  { name: 'Amoxicillin 500mg', category: 'Antibiotic', stock: 240, minStock: 50, unit: 'capsules' },
  { name: 'Metformin 500mg', category: 'Anti-diabetic', stock: 120, minStock: 60, unit: 'tablets' },
  { name: 'Amlodipine 5mg', category: 'Antihypertensive', stock: 30, minStock: 40, unit: 'tablets' },
  { name: 'Omeprazole 20mg', category: 'PPI', stock: 15, minStock: 30, unit: 'capsules' },
  { name: 'Paracetamol 500mg', category: 'Analgesic', stock: 500, minStock: 100, unit: 'tablets' },
  { name: 'Ibuprofen 400mg', category: 'NSAID', stock: 80, minStock: 50, unit: 'tablets' },
  { name: 'Salbutamol Inhaler', category: 'Bronchodilator', stock: 8, minStock: 10, unit: 'inhalers' },
  { name: 'Ciprofloxacin 500mg', category: 'Antibiotic', stock: 60, minStock: 30, unit: 'tablets' },
  { name: 'Atorvastatin 10mg', category: 'Statin', stock: 90, minStock: 40, unit: 'tablets' },
  { name: 'Losartan 50mg', category: 'ARB', stock: 45, minStock: 30, unit: 'tablets' },
  { name: 'Doxycycline 100mg', category: 'Antibiotic', stock: 10, minStock: 20, unit: 'capsules' },
  { name: 'Fluconazole 150mg', category: 'Antifungal', stock: 25, minStock: 15, unit: 'tablets' },
  { name: 'Ceftriaxone 1g', category: 'Antibiotic', stock: 40, minStock: 10, unit: 'vials' },
  { name: 'Insulin Glargine', category: 'Antidiabetic', stock: 20, minStock: 5, unit: 'pens' },
  { name: 'Warfarin 5mg', category: 'Anticoagulant', stock: 100, minStock: 20, unit: 'tablets' },
];

async function seed() {
  console.log("Checking for existing medications...");
  const colRef = collection(db, 'medications');
  const snapshot = await getDocs(colRef);
  
  if (!snapshot.empty) {
    console.log(`Found ${snapshot.size} existing medications. Skipping seed to avoid duplicates.`);
    return;
  }

  console.log("Seeding medication inventory...");
  for (const item of INITIAL_SEED_DATA) {
    await addDoc(colRef, {
      ...item,
      createdAt: serverTimestamp()
    });
    console.log(`- Added ${item.name}`);
  }
  console.log("Seeding complete! ✅");
}

seed().catch(console.error);
