import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Plant, SearchField } from '../types';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  doc, 
  setDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

interface PlantContextData {
  plants: Plant[];
  addPlant: (plant: Omit<Plant, 'id' | 'dataCadastro'>) => Promise<void>;
  updatePlant: (plant: Plant) => Promise<void>;
  deletePlant: (id: string) => Promise<void>;
  getPlantById: (id: string) => Plant | undefined;
  searchPlants: (query: string, field: SearchField) => Plant[];
}

const PlantContext = createContext<PlantContextData>({} as PlantContextData);

export const PlantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plants, setPlants] = useState<Plant[]>([]);

  useEffect(() => {
    // Configurar listener em tempo real para as plantas
    const plantsQuery = query(collection(db, 'plants'), orderBy('dataCadastro', 'desc'));
    
    const unsubscribe = onSnapshot(plantsQuery, (snapshot) => {
      const plantsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Plant[];
      setPlants(plantsData);
    }, (error) => {
      console.error('Erro ao observar plantas:', error);
    });

    return () => unsubscribe();
  }, []);

  const addPlant = async (plantData: Omit<Plant, 'id' | 'dataCadastro'>) => {
    try {
      const newPlant = {
        ...plantData,
        dataCadastro: new Date().toISOString(),
      };
      
      const docRef = await addDoc(collection(db, 'plants'), newPlant);
      const plantWithId = { ...newPlant, id: docRef.id } as Plant;
      
      await setDoc(doc(db, 'plants', docRef.id), plantWithId);
      return plantWithId;
    } catch (error) {
      console.error('Erro ao adicionar planta:', error);
      throw error;
    }
  };

  const updatePlant = async (updatedPlant: Plant) => {
    try {
      const plantRef = doc(db, 'plants', updatedPlant.id);
      await setDoc(plantRef, updatedPlant);
    } catch (error) {
      console.error('Erro ao atualizar planta:', error);
      throw error;
    }
  };

  const deletePlant = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'plants', id));
    } catch (error) {
      console.error('Erro ao deletar planta:', error);
      throw error;
    }
  };

  const getPlantById = (id: string) => {
    return plants.find(plant => plant.id === id);
  };

  const searchPlants = (query: string, field: SearchField) => {
    if (!query.trim()) return plants;
    
    const normalizedQuery = query.toLowerCase().trim();
    
    return plants.filter(plant => {
      const value = plant[field].toLowerCase();
      return value.includes(normalizedQuery);
    });
  };

  return (
    <PlantContext.Provider
      value={{
        plants,
        addPlant,
        updatePlant,
        deletePlant,
        getPlantById,
        searchPlants,
      }}
    >
      {children}
    </PlantContext.Provider>
  );
};

export const usePlants = () => useContext(PlantContext);