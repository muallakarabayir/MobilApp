import React, { useState, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore'; // Import Firestore functions

const CreateGuide = () => {
  const [guideName, setGuideName] = useState('');   // Kılavuz adı
  const [selectedTest, setSelectedTest] = useState(''); // Seçilen test
  const [status, setStatus] = useState(''); // Durum mesajı

  // Testler
  const tests = [
    'igg', 'igga', 'iggm', 'igg1', 'igg2', 'igg3', 'igg4', 'tetanustoxoid', 'prp', 'pneumococcus', 'antia', 'antib'
  ];

  // Test bilgilerini saklama
  const [testData, setTestData] = useState({
    'igg': [],
    'igga': [],
    'iggm': [],
    'igg1': [],
    'igg2': [],
    'igg3': [],
    'igg4': [],
    'tetanustoxoid': [],
    'prp': [],
    'pneumococcus': [],
    'antia': [],
    'antib': [],
  });

  // Yaş aralığı, düşük değer ve yüksek değeri için state'ler
  const [ageRange, setAgeRange] = useState(''); // Yaş aralığı
  const [lowValue, setLowValue] = useState('');  // Low değeri
  const [highValue, setHighValue] = useState(''); // High değeri

  // Ref'leri oluştur
  const ageRangeRef = useRef(null);
  const lowValueRef = useRef(null);
  const highValueRef = useRef(null);

  // Yaş Aralığı, Low ve High Değerlerini ekleme
  const handleAddTestValue = () => {
    if (!selectedTest || !ageRange || !lowValue || !highValue) {
      setStatus('Lütfen tüm alanları doldurun.');
      return;
    }
  
    const newTestValue = {
      ageRange,
      low: parseFloat(lowValue),
      high: parseFloat(highValue)
    };
  
    // Seçilen testin altında bu veriyi saklayacağız
    setTestData(prevData => {
      const updatedData = { ...prevData };
      updatedData[selectedTest] = [...updatedData[selectedTest], newTestValue];
      console.log('Updated Test Data:', updatedData);
      return updatedData;
    });
  
    setAgeRange('');
    setLowValue('');
    setHighValue('');
    setStatus('Yaş Aralığı ve Değerler başarıyla eklendi!');
  };

  // Function to add the guide data to Firestore
  const addGuideDocuments = async (guideName, testData) => {
    try {
      const db = getFirestore();

      // Reference to the "ranges" collection and the document for the guide
      const guideRef = doc(db, 'ranges', guideName); // Guide name is the document name

      // Set the initial guide document (can include metadata, or leave empty)
      await setDoc(guideRef, { guideName });

      // Loop through the testData and create subcollections for each test
      for (const [testName, values] of Object.entries(testData)) {
        if (values.length > 0) {
          // Create a subcollection for each test under the guide document
          const testRef = collection(guideRef, testName);

          // Loop through each value for the test and create a document for each age range
          for (const item of values) {
            const { ageRange, high, low } = item;

            // Define a document for each ageRange under the corresponding test collection
            const ageRangeDocRef = doc(testRef, ageRange); // Document name is the ageRange

            // Set the data for each age range
            await setDoc(ageRangeDocRef, { ageRange, high, low });
            console.log(`Added document for ${guideName} - ${testName} - ${ageRange}`);
          }
        }
      }

      // After successful data submission, show an alert
      Alert.alert("Başarıyla Kaydedildi", "Kılavuz başarıyla kaydedildi!");
    } catch (error) {
      console.error("Error adding documents: ", error);
      Alert.alert("Hata", "Kılavuz kaydedilirken bir hata oluştu.");
    }
  };

  // Function to submit the guide to Firebase
  const submitToFirebase = async () => {
    if (!guideName) {
      setStatus('Lütfen bir kılavuz adı girin.');
      return;
    }

    try {
      // Call the function to add the guide and its tests to Firestore
      await addGuideDocuments(guideName, testData);
      // Reset status as it will no longer be used for feedback
      setStatus('');
    } catch (error) {
      console.error('Error saving guide data to Firestore:', error);
      setStatus('Kılavuz kaydedilirken bir hata oluştu.');
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      {Object.entries(testData).map(([test, values]) => (
        values.length > 0 && (
          <View key={test} style={styles.card}>
            <Text style={styles.cardTitle}>{test}</Text>
            {values.map((value, idx) => (
              <Text key={idx} style={styles.cardText}>
                Yaş Aralığı: {value.ageRange}, Low: {value.low}, High: {value.high}
              </Text>
            ))}
          </View>
        )
      ))}

      <TextInput
        placeholder="Kılavuz Adı"
        value={guideName}
        onChangeText={setGuideName}
        style={styles.input}
        returnKeyType="next"
        onSubmitEditing={() => ageRangeRef.current.focus()}
      />

      {tests.map((test, index) => (
        <View key={index} style={styles.testField}>
          <TouchableOpacity
            style={selectedTest === test ? styles.selectedTestButton : styles.testButton}
            onPress={() => setSelectedTest(test)}
          >
            <Text style={selectedTest === test ? styles.selectedTestText : styles.testText}>
              {test}
            </Text>
          </TouchableOpacity>

          {selectedTest === test && (
            <View style={styles.testInputs}>
              <View style={styles.inputField}>
                <Text style={styles.label}>Yaş Aralığı (örn. 0-3)</Text>
                <TextInput
                  ref={ageRangeRef}
                  placeholder="Yaş Aralığı"
                  value={ageRange}
                  onChangeText={setAgeRange}
                  style={styles.input}
                  returnKeyType="next"
                  onSubmitEditing={() => lowValueRef.current.focus()}
                />
              </View>

              <View style={styles.inputField}>
                <Text style={styles.label}>En Düşük Değer</Text>
                <TextInput
                  ref={lowValueRef}
                  placeholder="En Düşük Değer"
                  value={lowValue}
                  onChangeText={setLowValue}
                  keyboardType="numeric"
                  style={styles.input}
                  returnKeyType="next"
                  onSubmitEditing={() => highValueRef.current.focus()}
                />
              </View>

              <View style={styles.inputField}>
                <Text style={styles.label}>En Yüksek Değer</Text>
                <TextInput
                  ref={highValueRef}
                  placeholder="En Yüksek Değer"
                  value={highValue}
                  onChangeText={setHighValue}
                  keyboardType="numeric"
                  style={styles.input}
                  returnKeyType="done"
                />
              </View>

              <TouchableOpacity style={styles.addButton} onPress={handleAddTestValue}>
                <Text style={styles.addButtonText}>Değeri Ekle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={submitToFirebase}>
        <Text style={styles.addButtonText}>Firebase'e Gönder</Text>
      </TouchableOpacity>

      {/* Remove status text as we are using alerts */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f7f7',
    flex: 1,
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#9C7EC9',
    marginBottom: 15,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  testButton: {
    backgroundColor: '#9C7EC9', // Light purple color
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  selectedTestButton: {
    backgroundColor: '#B79DE7', // Slightly lighter purple for selected
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  testText: {
    fontSize: 16,
    color: '#fff',
  },
  selectedTestText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  inputField: {
    marginBottom: 15,
  },
  testInputs: {
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#8f8f8f', // Light purple color
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#8f8f8f',
  },
  cardText: {
    fontSize: 14,
    color: '#8f8f8f',
  },
});

export default CreateGuide;
