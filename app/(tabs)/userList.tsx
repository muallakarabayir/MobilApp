import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, View, TouchableOpacity, Image, Alert, ActivityIndicator, FlatList } from 'react-native';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import {Link} from "expo-router";
import { firebaseAuth } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import {db} from '../../firebaseConfig'
import { collection, doc, getDocs, query, where } from '@firebase/firestore';

type BloodTest = {
    id: string;
    userId: string;
    testName: string;
    result: string;
    date: string;
  };

export default function UserList() {
 const [bloodTests, setBloodTests] = useState<BloodTest[]>([]);
  const [loading, setLoading]= useState(true);

//   useEffect(() => {
//     const fetchBloodTests = async () => {
//       try {
//         // Tüm bloodTests koleksiyonunu çek
//         const bloodTestQuery = collection(db, "bloodTests");
//         const querySnapshot = await getDocs(bloodTestQuery);

//         // Çekilen dökümanları `BloodTest` tipine uygun şekilde haritala
//         const tests: BloodTest[] = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...(doc.data() as Omit<BloodTest, "id">),
//         }));

//         setBloodTests(tests);
//       } catch (error) {
//         console.error("Error fetching blood tests:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBloodTests();
//   }, []);

//   if(loading){
//     return <ActivityIndicator size="large" color="#0000ff"/>
//   }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blood Tests</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: "#fff",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
      color: "#333",
    },
    noDataText: {
      fontSize: 16,
      color: "#888",
      textAlign: "center",
    },
    testCard: {
      backgroundColor: "#f9f9f9",
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    testName: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#444",
    },
    testResult: {
      fontSize: 16,
      color: "#555",
      marginTop: 4,
    },
    testDate: {
      fontSize: 14,
      color: "#666",
      marginTop: 4,
    },
    testUserId: {
      fontSize: 12,
      color: "#888",
      marginTop: 4,
    },
  });