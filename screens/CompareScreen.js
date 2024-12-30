import React, { useState } from 'react';
import { View, Text, TextInput, Modal, TouchableOpacity, Button, StyleSheet, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Picker'ı import ettik
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native'; // Yönlendirme için useNavigation

const CompareScreen = () => {
  const [dob, setDob] = useState(''); // Doğum tarihi
  const [bloodValue, setBloodValue] = useState(''); // Kan değeri
  const [selectedTest, setSelectedTest] = useState('igg'); // Seçilen test
  const [dobModalVisible, setDobModalVisible] = useState(false); // Doğum tarihi modal'ı için state
  const [year, setYear] = useState(''); // Yıl
  const [month, setMonth] = useState(''); // Ay
  const [day, setDay] = useState(''); // Gün

  const navigation = useNavigation(); // Yönlendirme için useNavigation hook'u

  // Yaşı ay cinsinden hesaplama
  const calculateAgeInMonths = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    
    let ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12; // Yılları aylara çevir
    ageInMonths -= birthDate.getMonth();
    ageInMonths += today.getMonth();

    if (today.getDate() < birthDate.getDate()) {
      ageInMonths--; // Eğer bu ayın günü doğum gününden önceyse, bir ay eksilt
    }
    
    return ageInMonths < 0 ? 0 : ageInMonths; // Eğer negatif bir değer dönüyorsa, 0 döndür
  };

  // Formu gönderme işlemi
  const handleSubmit = () => {
    if (!dob || !bloodValue) {
      alert("Lütfen doğum tarihi ve kan değerini giriniz.");
      return;
    }

    const ageInMonths = calculateAgeInMonths(dob); // Ay cinsinden yaş hesapla

    // Test sonuçları hesaplama işlemi ResultScreen'de yapılacak.
    navigation.navigate('Results', {
      dob,
      bloodValue,
      selectedTest,
      ageInMonths, // Yaş (ay olarak) bilgisi ResultScreen'e gönderiliyor
    });
  };

  const handleDateChange = () => {
    const parsedYear = parseInt(year, 10);
    const parsedMonth = parseInt(month, 10);
    const parsedDay = parseInt(day, 10);
  
    if (isNaN(parsedYear) || isNaN(parsedMonth) || isNaN(parsedDay)) {
      alert("Lütfen geçerli bir yıl, ay ve gün girin.");
      return;
    }
  
    if (parsedMonth < 1 || parsedMonth > 12) {
      alert("Ay 1 ile 12 arasında olmalıdır.");
      return;
    }
  
    const daysInMonth = new Date(parsedYear, parsedMonth, 0).getDate();
    if (parsedDay < 1 || parsedDay > daysInMonth) {
      alert("Geçerli bir gün girin.");
      return;
    }
  
    // Tarihi direkt string olarak oluştur
    setDob(`${parsedYear}-${String(parsedMonth).padStart(2, '0')}-${String(parsedDay).padStart(2, '0')}`);
    setDobModalVisible(false); // Modal'ı kapat
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={tw`h-1/5 items-center`}>
            {/* Doğum Tarihini Modal içinde alıyoruz */}
            <Text style={styles.label}>Doğum Tarihini seçin:</Text>
            <TouchableOpacity onPress={() => setDobModalVisible(true)} style={styles.button}>
              <Text style={styles.buttonText}>
                {dob ? `Doğum Tarihi: ${dob}` : 'Doğum Tarihi Seçin'}
              </Text>
            </TouchableOpacity>
          <View style={tw`mt-5`}>
            {/* Kan Değeri */}
            <Text style={styles.label}>Kan Değerini girin:</Text>
            <TextInput
              style={styles.input}
              value={bloodValue}
              onChangeText={setBloodValue}
              placeholder="Kan Değeri"
              keyboardType="numeric"
            />
            </View>
          </View>

          <View style={tw`h-1/5 mt-15 items-center `}>
            {/* Test Seçimi */}
            <Text style={styles.label}>Test Seçin:</Text>
            <Picker
              selectedValue={selectedTest}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedTest(itemValue)}
            >
              <Picker.Item label="IgG" value="igg" />
              <Picker.Item label="IgM" value="igm" />
              <Picker.Item label="IgA" value="iga" />
              <Picker.Item label="IgG1" value="igg1" />
              <Picker.Item label="IgG2" value="igg2" />
              <Picker.Item label="IgG3" value="igg3" />
              <Picker.Item label="IgG4" value="igg4" />
              <Picker.Item label="AntiA" value="antia" />
              <Picker.Item label="AntiB" value="antib" />
              <Picker.Item label="Pneumococcus" value="pheumococcus" />
              <Picker.Item label="PRP" value="prp" />
              <Picker.Item label="Tetanus Toxoid" value="tetanustoxoid" />
            </Picker>
          </View>

          <View style={tw`h-1/5 mt-25 items-center`}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>
                Sonucu Göster
              </Text>
            </TouchableOpacity>
          </View>

          {/* Doğum Tarihi Modal */}
          <Modal
            transparent={true}
            visible={dobModalVisible}
            animationType="slide"
            onRequestClose={() => setDobModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Doğum Tarihini Seçin</Text>
                <View style={styles.dateRow}>
                  <TextInput
                    style={[styles.dateInput, styles.smallInput]}
                    placeholder="YYYY"
                    placeholderTextColor="gray"
                    keyboardType="numeric"
                    value={year}
                    onChangeText={setYear}
                    maxLength={4}
                  />
                  <Text style={styles.separator}>-</Text>
                  <TextInput
                    style={[styles.dateInput, styles.smallInput]}
                    placeholder="MM"
                    placeholderTextColor="gray"
                    keyboardType="numeric"
                    value={month}
                    onChangeText={setMonth}
                    maxLength={2}
                  />
                  <Text style={styles.separator}>-</Text>
                  <TextInput
                    style={[styles.dateInput, styles.smallInput]}
                    placeholder="DD"
                    placeholderTextColor="gray"
                    keyboardType="numeric"
                    value={day}
                    onChangeText={setDay}
                    maxLength={2}
                  />
                </View>
                <View style={styles.modalButtons}>
                  <Button title="Cancel" onPress={() => setDobModalVisible(false)} />
                  <Button title="OK" onPress={handleDateChange} />
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  input: {
    marginVertical: 10,
    height: 40,
    width: 300,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    borderColor: 'gray',
    backgroundColor: 'white',
    color: 'black',
  },
  picker: {
    height: 40,
    width: '100%',
    marginBottom: 20,
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
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '60%',
    alignItems: 'center',
  },
  dateInput: {
    height: 40,
    width: 60,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginHorizontal: 5,
    textAlign: 'center',
  },
  smallInput: {
    width: 60,
  },
  separator: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default CompareScreen;
