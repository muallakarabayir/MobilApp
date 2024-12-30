import React, { useState, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { getDatabase, ref, set } from 'firebase/database'; // Firebase import

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
      
      // Log the updated testData to console
      console.log('Updated Test Data:', updatedData);
      
      return updatedData;
    });
  
    setAgeRange('');
    setLowValue('');
    setHighValue('');
    setStatus('Yaş Aralığı ve Değerler başarıyla eklendi!');
  };
  

  const submitToFirebase = async () => {
    if (!guideName) {
      setStatus('Lütfen bir kılavuz adı girin.');
      return;
    }
  
    const db = getDatabase();
    const guideRef = ref(db, `guides/${guideName}`);
  
    // Structuring the data as required (filter out empty arrays)
    const formattedData = Object.entries(testData).reduce((acc, [testName, values]) => {
      if (values.length > 0) {
        acc[testName] = values.map(value => ({
          ageRange: value.ageRange,
          low: value.low,
          high: value.high
        }));
      }
      return acc;
    }, {});
  
    console.log('Formatted Data:', formattedData);  // Log the formatted data
    console.log('Guide Name:', guideName);  // Log the guide name to check if it's being passed
  
    try {
      await set(guideRef, formattedData); // Sending the data to Firebase
      setStatus('Kılavuz başarıyla kaydedildi!');
    } catch (error) {
      console.error('Firebase Error:', error);  // Log error details
      setStatus('Kılavuz kaydedilirken bir hata oluştu.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Eklenen değerlerin kart şeklinde gösterimi */}
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

      {/* Kılavuz adı */}
      <TextInput
        placeholder="Kılavuz Adı"
        value={guideName}
        onChangeText={setGuideName}
        style={styles.input}
        returnKeyType="next"
        onSubmitEditing={() => ageRangeRef.current.focus()}
      />

      {/* Testler için her bir input */}
      {tests.map((test, index) => (
        <View key={index} style={styles.testField}>
          <TouchableOpacity
            style={selectedTest === test ? styles.selectedTestButton : styles.testButton}
            onPress={() => setSelectedTest(test)} // Test seçimi
          >
            <Text style={selectedTest === test ? styles.selectedTestText : styles.testText}>
              {test}
            </Text>
          </TouchableOpacity>

          {selectedTest === test && (
            <View style={styles.testInputs}>
              {/* Yaş Aralığı */}
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

              {/* Düşük Değer */}
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

              {/* Yüksek Değer */}
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

              {/* Yaş Aralığı ve Değerleri ekleme butonu */}
              <TouchableOpacity style={styles.addButton} onPress={handleAddTestValue}>
                <Text style={styles.addButtonText}>Değeri Ekle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}

      {/* Gönder butonu */}
      <TouchableOpacity style={styles.addButton} onPress={submitToFirebase}>
        <Text style={styles.addButtonText}>Firebase'e Gönder</Text>
      </TouchableOpacity>

      {status ? <Text style={styles.statusText}>{status}</Text> : null}
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
    borderBottomColor: '#4CAF50',
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
    backgroundColor: '#4CAF50',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  selectedTestButton: {
    backgroundColor: '#8BC34A',
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
    backgroundColor: '#4CAF50',
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
  statusText: {
    marginTop: 20,
    color: '#28a745',
    fontWeight: 'bold',
    fontSize: 16,
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
    color: '#4CAF50',
  },
  cardText: {
    fontSize: 14,
    color: '#333',
  },
});

export default CreateGuide;
