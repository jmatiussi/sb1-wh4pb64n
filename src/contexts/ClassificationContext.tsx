import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Classification } from '../types';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

interface ClassificationContextData {
  classifications: Classification[];
  addClassification: (classification: Omit<Classification, 'id' | 'dataCriacao'>) => Promise<void>;
  updateClassification: (classification: Classification) => Promise<void>;
  deleteClassification: (id: string) => Promise<void>;
  getClassificationById: (id: string) => Classification | undefined;
}

const ClassificationContext = createContext<ClassificationContextData>({} as ClassificationContextData);

export const ClassificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [classifications, setClassifications] = useState<Classification[]>([]);

  useEffect(() => {
    const classificationsQuery = query(collection(db, 'classifications'), orderBy('dataCriacao', 'desc'));
    
    const unsubscribe = onSnapshot(classificationsQuery, (snapshot) => {
      const classificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Classification[];
      setClassifications(classificationsData);
    }, (error) => {
      console.error('Erro ao observar classificações:', error);
    });

    return () => unsubscribe();
  }, []);

  const addClassification = async (classificationData: Omit<Classification, 'id' | 'dataCriacao'>) => {
    try {
      const newClassification = {
        ...classificationData,
        dataCriacao: new Date().toISOString(),
      };
      
      const docRef = await addDoc(collection(db, 'classifications'), newClassification);
      const classificationWithId = { ...newClassification, id: docRef.id } as Classification;
      
      await setDoc(doc(db, 'classifications', docRef.id), classificationWithId);
      return classificationWithId;
    } catch (error) {
      console.error('Erro ao adicionar classificação:', error);
      throw error;
    }
  };

  const updateClassification = async (updatedClassification: Classification) => {
    try {
      const classificationRef = doc(db, 'classifications', updatedClassification.id);
      await setDoc(classificationRef, updatedClassification);
    } catch (error) {
      console.error('Erro ao atualizar classificação:', error);
      throw error;
    }
  };

  const deleteClassification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'classifications', id));
    } catch (error) {
      console.error('Erro ao deletar classificação:', error);
      throw error;
    }
  };

  const getClassificationById = (id: string) => {
    return classifications.find(classification => classification.id === id);
  };

  return (
    <ClassificationContext.Provider
      value={{
        classifications,
        addClassification,
        updateClassification,
        deleteClassification,
        getClassificationById,
      }}
    >
      {children}
    </ClassificationContext.Provider>
  );
};

export const useClassifications = () => useContext(ClassificationContext);