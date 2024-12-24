import React, { useState, useEffect } from 'react';
import { View,Dimensions, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { ScrollView } from 'react-native';
import DatePicker from '@/components/DateTimePicker';

interface User{
    id:string;
    email: string;
}
const { height } = Dimensions.get('window');

export default function AddBloodTest(){
    const [age, setAge] = useState('');
    const [igG, setIgG] = useState('');
    const [igA, setIgA] = useState('')
    const [igM, setIgM] = useState('');
    const [igG1, setIG1] = useState('');
    const [igG2, setIG2] = useState('');
    const [igG3, setIG3] = useState('');
    const [igG4, setIG4] = useState('');

    const [tetanusToxoid, setTetanusToxoid] = useState('');
    const [prp, setPrp] = useState('');
    const [pheumococcus, setPneumococcus] = useState('');
    const [antiA, setAntiA] = useState('');
    const [antiB, setAntiB] = useState('');
   
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(true);
   
    useEffect(() => {
        const fetchUsers = async () => {
          try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const usersList: User[] = querySnapshot.docs.map(doc => ({
              id: doc.id,
              email: doc.data().email,
            }));
            setUsers(usersList);
            console.log('Fetched users:', usersList); // Debugging log
          } catch (error) {
            console.error('Error fetching users:', error);
            Alert.alert('Error', 'Failed to fetch users.');
          } finally {
            setIsFetching(false);
          }
        };
    
        fetchUsers();
      }, []);
      
      if (isFetching) {
        return <Text>Loading...</Text>; // Veriler yüklenirken bir mesaj göstermek
      }


      const handleAddTest = async () => {
        // Boş alanları kontrol etmek için bir dizi oluşturuyoruz
        const emptyFields = [];
        if (!age.trim()) emptyFields.push("Age");
        if (!igG.trim()) emptyFields.push("IgG");
        if (!igA.trim()) emptyFields.push("IgA");
        if (!igM.trim()) emptyFields.push("IgM");
        if (!igG1.trim()) emptyFields.push("IgG1");
        if (!igG2.trim()) emptyFields.push("IgG2");
        if (!igG3.trim()) emptyFields.push("IgG3");
        if (!igG4.trim()) emptyFields.push("IgG4");
        if (!tetanusToxoid.trim()) emptyFields.push("Tetanus Toxoid");
        if (!prp.trim()) emptyFields.push("PRP");
        if (!pheumococcus.trim()) emptyFields.push("Pneumococcus");
        if (!antiA.trim()) emptyFields.push("Anti A");
        if (!antiB.trim()) emptyFields.push("Anti B");
        if (!date.trim()) emptyFields.push("Date");
        if (!selectedUserId) emptyFields.push("Selected User");
    
        // Eğer boş alan varsa uyarı mesajı gösteriyoruz
        if (emptyFields.length > 0) {
            Alert.alert(
                "Error",
                `Please fill out the following fields:\n${emptyFields.join(", ")}`
            );
            return;
        }
    
        setLoading(true);
    
        try {
            // Kan tahlilini Firestore'a ekle
            await addDoc(collection(db, "bloodTests"), {
                userId: selectedUserId, // Seçilen kullanıcının ID'si
                age,
                igG,
                igA,
                igM,
                igG1,
                igG2,
                igG3,
                igG4,
                tetanusToxoid,
                prp,
                pheumococcus,
                antiA,
                antiB,
                date,
            });
            
            Alert.alert("Success", "Blood test added successfully.");
    
            // Formu sıfırlamak
            setAge("");
            setIgG("");
            setIgA("");
            setIgM("");
            setIG1("");
            setIG2("");
            setIG3("");
            setIG4("");
            setTetanusToxoid("");
            setPrp("");
            setPneumococcus("");
            setAntiA("");
            setAntiB("");
            setDate("");
            setSelectedUserId(null);
        } catch (error) {
            console.error("Error adding blood test:", error);
            Alert.alert("Error", "Failed to add blood test.");
        } finally {
            setLoading(false);
        }
    };
    
    return(
        
        <View style={styles.container}>
           <Text style={styles.title}>Add Blood Test</Text>
           {/*Kullanıcı seçimi*/}
           {/*Kullanıcı*/}
           {/* FlatList'i sınırlandırıyoruz */}
            <View style={styles.flatListContainer}>
            <FlatList
                data={users} // Verinin dolu olduğundan emin olun
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                <TouchableOpacity
                    style={[
                        styles.userItem,
                        selectedUserId === item.id && styles.selectedUser,
                    ]}
                    onPress={() => setSelectedUserId(item.id)}
                >
                <Text style={styles.userText}>{item.email}</Text>
                </TouchableOpacity>
                )}
             />
           </View>
        <ScrollView>
            {/* Form alanları */}
            <TextInput
                style={styles.input}
                placeholder="Age"
                value={age}
                onChangeText={setAge}
                placeholderTextColor="#888"
            />
            <TextInput
                style={styles.input}
                placeholder="IgG(mg/dl)"
                value={igG}
                onChangeText={setIgG}
                placeholderTextColor="#888"
            />
            <TextInput
                style={styles.input}
                placeholder="IgA(mg/dl)"
                value={igA}
                onChangeText={setIgA}
                placeholderTextColor="#888"
            />
            <TextInput
                style={styles.input}
                placeholder="IgM(mg/dl)"
                value={igM}
                onChangeText={setIgM}
                placeholderTextColor="#888"
            />
            <TextInput
                style={styles.input}
                placeholder="IgG1(mg/dl)"
                value={igG1}
                onChangeText={setIG1}
                placeholderTextColor="#888"
            />
             <TextInput
                style={styles.input}
                placeholder="IgG2(mg/dl)"
                value={igG2}
                onChangeText={setIG2}
                placeholderTextColor="#888"
            />
              <TextInput
                style={styles.input}
                placeholder="IgG3(mg/dl)"
                value={igG3}
                onChangeText={setIG3}
                placeholderTextColor="#888"
            />
             <TextInput
                style={styles.input}
                placeholder="IgG4(mg/dl)"
                value={igG4}
                onChangeText={setIG4}
                placeholderTextColor="#888"
            />
            <TextInput
                style={styles.input}
                placeholder="Tetanus Toxois(IU/ml)"
                value={tetanusToxoid}
                onChangeText={setTetanusToxoid}
                placeholderTextColor="#888"
            />
            <TextInput
                style={styles.input}
                placeholder="PRP(HIB)(ng/ml)"
                value={prp}
                onChangeText={setPrp}
                placeholderTextColor="#888"
            />
            <TextInput
                style={styles.input}
                placeholder="Pneumococcus(ng/ml)"
                value={pheumococcus}
                onChangeText={setPneumococcus}
                placeholderTextColor="#888"
            />
            <TextInput
                style={styles.input}
                placeholder="Isohemagglutinin Titert Anti A"
                value={antiA}
                onChangeText={setAntiA}
                placeholderTextColor="#888"
            />
            <TextInput
                style={styles.input}
                placeholder="Isohemagglutinin Titert Anti B"
                value={antiB}
                onChangeText={setAntiB}
                placeholderTextColor="#888"
            />

                {/* Date Picker kullanımı */}
            <DatePicker value={date} onChange={setDate} />

            <View style={styles.buttonContainer}>
               <TouchableOpacity style={styles.button} onPress={handleAddTest} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Adding...' : 'Add Test'}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>    
        </View>
    
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#fff',
      justifyContent: 'center',
    },
    title: {
      fontSize: 21,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop:25,
      marginBottom: 10,
      color: '#333',
    },
    input: {
      height: 50,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 10,
      marginBottom: 12,
      fontSize: 16,
      color: '#333',
    },
    buttonContainer:{
    flex: 1, // Sayfanın kalan alanını doldur
    justifyContent: 'center', // Dikey merkezleme
    alignItems: 'center', // Yatay merkezleme
    maxHeight:50
    },
    button: {
        backgroundColor: 'navy',
        padding: 10,
        borderRadius: 30,
        alignItems: 'center',
        width: 300,
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    flatListContainer: {
    maxHeight: 250, // FlatList'in yüksekliğini sınırlıyoruz
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9', // Arka plan rengini açıyoruz
    padding: 10, // İçeriği birazcık dolayarak daha temiz görünmesini sağlıyoruz
  },
  userItem: {
    padding: 15, // Daha geniş alan sağlıyoruz
    borderBottomWidth: 1,
    borderBottomColor: '#ddd', // Ayrım çizgisi
    marginBottom: 10, // Elemanlar arasına boşluk ekliyoruz
    borderRadius: 8, // Yuvarlatılmış köşeler
    backgroundColor: '#f0f0f0', // Hafif gri arka plan rengi
  },
  selectedUser: {
    backgroundColor: '#7f44ff', // Seçilen öğeye özel renk
  },
  userText: {
    fontSize: 18,
    color: '#333', // Yazı rengi
    fontWeight: '500', // Orta kalınlıkta font
  },
    
  });