import React, { useState, useEffect } from 'react';
import { Button, Text, StyleSheet, FlatList, TouchableOpacity, Alert, View } from 'react-native';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc} from 'firebase/firestore';

const AdminAssign = () => {
  const [users, setUsers] = useState([]);  // Kullanıcıları tutacak state
  const [selectedUserId, setSelectedUserId] = useState(null);  // Seçilen kullanıcıyı tutacak state
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null); // Seçilen kullanıcı bilgisi

  const db = getFirestore();

  // Kullanıcıları Firestore'dan alıyoruz
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Fetched Users:', usersList); // Fetched user'ları konsola yazdır
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
        Alert.alert('Hata', 'Kullanıcılar alınırken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Admin atama işlemi
  const handleAssignAdmin = async () => {
    if (selectedUserId) {
      const user = users.find(user => user.id === selectedUserId); // Seçilen kullanıcıyı bul

      if (user) {
        if (user.isAdmin === false) { // Eğer kullanıcı admin değilse, admin yap
          try {
            const userRef = doc(db, 'users', selectedUserId); // Seçilen kullanıcıyı referans al
            await updateDoc(userRef, { isAdmin: true });  // isAdmin değerini true yap
            Alert.alert('Başarılı', 'Kullanıcı admin olarak atandı.');
            // Kullanıcıyı güncelledikten sonra listeyi de güncelle
            setUsers(prevUsers =>
              prevUsers.map(u =>
                u.id === selectedUserId ? { ...u, isAdmin: true } : u
              )
            );
          } catch (error) {
            console.error('Error updating user:', error);
            Alert.alert('Hata', 'Kullanıcı admin olarak atanırken bir hata oluştu.');
          }
        } else {
          Alert.alert('Bilgi', 'Bu kullanıcı zaten admin.');
        }
      }
    } else {
      Alert.alert('Hata', 'Lütfen bir kullanıcı seçin.');
    }
  };


  const takeAdminRole=async()=>{
    if (selectedUserId) {
      const user = users.find(user => user.id === selectedUserId); // Seçilen kullanıcıyı bul
  
      if (user) {
        try {
          const userRef = doc(db, 'users', selectedUserId); // Seçilen kullanıcıyı referans al
          if (user.isAdmin) { 
            // Kullanıcı zaten admin ise, adminlikten çıkar
            await updateDoc(userRef, { isAdmin: false }); 
            Alert.alert('Başarılı', 'Kullanıcı adminlikten çıkarıldı.');
          } else {
            // Kullanıcı admin değilse, admin yap
            await updateDoc(userRef, { isAdmin: true });
            Alert.alert('Başarılı', 'Kullanıcı admin olarak atandı.');
          }
  
          // Kullanıcıyı güncelledikten sonra listeyi de güncelle
          setUsers(prevUsers =>
            prevUsers.map(u =>
              u.id === selectedUserId ? { ...u, isAdmin: !u.isAdmin } : u
            )
          );
        } catch (error) {
          console.error('Error updating user:', error);
          Alert.alert('Hata', 'Kullanıcı rolü değiştirilirken bir hata oluştu.');
        }
      }
    } else {
      Alert.alert('Hata', 'Lütfen bir kullanıcı seçin.');
    }
  }

  const handleDeleteUser = async () => {
    if (selectedUserId) {
      try {
        const userRef = doc(db, 'users', selectedUserId);
        await deleteDoc(userRef);
        Alert.alert('Başarılı', 'Kullanıcı başarıyla silindi.');
        setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUserId));
        setSelectedUserId(null);
        setSelectedUser(null);
      } catch (error) {
        console.error('Error deleting user:', error);
        Alert.alert('Hata', 'Kullanıcı silinirken bir hata oluştu.');
      }
    } else {
      Alert.alert('Hata', 'Lütfen bir kullanıcı seçin.');
    }
  };

  // Kullanıcı listesi elemanını render etme
  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.userItem, selectedUserId === item.id && styles.selectedUserItem]} // Seçilen kullanıcıyı vurgulamak için stil
      onPress={() => {
        setSelectedUserId(item.id);  // Kullanıcı seçildiğinde ID'yi set et
        setSelectedUser(item);  // Seçilen kullanıcı bilgilerini de state'e set et
        console.log('Selected User:', item); // Seçilen kullanıcıyı konsola yazdır
      }}
    >



      <Text style={styles.userName}>
        {item.name} - {item.isAdmin ? 'Admin' : 'User'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <>
          <Text style={styles.subHeading}>Choose Users</Text>
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={renderUserItem}
            style={styles.userList}
          />

          <TouchableOpacity style={styles.assignButton} onPress={handleAssignAdmin}>
            <Text style={styles.assignButtonText}>Assign Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.assignButton} onPress={takeAdminRole}>
            <Text style={styles.assignButtonText}>Take admin role</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.assignButton} onPress={handleDeleteUser}>
            <Text style={styles.assignButtonText}>Delete User</Text>
          </TouchableOpacity>

          {selectedUser && (
            <View style={styles.selectedUserContainer}>
              <Text style={styles.selectedUserHeading}>Selected User Information</Text>
              <Text style={styles.selectedUserText}>Name: {selectedUser.name}</Text>
              <Text style={styles.selectedUserText}>Email: {selectedUser.email}</Text>
              <Text style={styles.selectedUserText}>Birthday: {selectedUser.birthDate}</Text>
              <Text style={styles.selectedUserText}>Admin: {selectedUser.isAdmin ? 'Yes' : 'No'}</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7',  // Arka plan rengini açık gri yap
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 15,
  },
  userList: {
    width: '100%',
    marginBottom: 30,
  },
  userItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  selectedUserItem: {
    borderColor: '#007BFF',
    backgroundColor: '#f0f8ff',
  },
  userName: {
    fontSize: 16,
    color: '#333',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#999',
  },
  assignButton: {
    backgroundColor: 'navy',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom:30,
    elevation: 3,
  },
  assignButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  selectedUserContainer: {
    marginTop: 25,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: '100%',
  },
  selectedUserHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  selectedUserText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
});

export default AdminAssign;
