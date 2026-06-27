import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  StatusBar, 
  TextInput,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../config/api';

export default function ProfilePage() {
  const router = useRouter();
  
  const BASE_URL = `${API_BASE_URL}/api`; 
  const userId = "rose@gmail.com"; 
  
  const [userRole, setUserRole] = useState<'customer' | 'seller'>('customer');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [selectedSection, setSelectedSection] = useState('women');
  const [selectedCategory, setSelectedCategory] = useState('Clothes');
  const [selectedImage, setSelectedImage] = useState<string | null>(null); 
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch Order History
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch(`${BASE_URL}/orders/${userId}`);
      const text = await response.text();
      if (text.startsWith('<html')) {
        setOrders([]);
        return;
      }
      const data = JSON.parse(text);
      if (response.ok) setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (userRole === 'customer') fetchOrders();
  }, [userRole]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  // Upload Product Logic
  const handleUploadProduct = async () => {
    if(!productName || !productPrice || !selectedImage) {
      Alert.alert("Error", "Please fill name, price, and photo");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('name', productName);
    formData.append('price', productPrice);
    formData.append('category', selectedCategory);
    formData.append('section', selectedSection);

    const uriParts = selectedImage.split('.');
    const fileType = uriParts[uriParts.length - 1];
    formData.append('image', {
      uri: selectedImage,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    try {
      const response = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        Alert.alert("Success", `Product added to ${selectedSection} > ${selectedCategory}`);
        setProductName('');
        setProductPrice('');
        setSelectedImage(null);
      }
    } catch (error) {
      Alert.alert("Error", "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // Logout Logic
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: () => router.replace('/') 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>User Dashboard</Text>

        <View style={styles.profileHeader}>
          <Image source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }} style={styles.profileImg} />
          <View style={styles.nameContainer}>
            <Text style={styles.userName}>Professor</Text>
            <Text style={styles.userEmail}>Role: {userRole.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.roleTab, userRole === 'customer' && styles.activeTab]} onPress={() => setUserRole('customer')}>
            <Ionicons name="people" size={20} color={userRole === 'customer' ? '#fff' : '#000'} />
            <Text style={[styles.tabText, userRole === 'customer' && styles.activeTabText]}>Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleTab, userRole === 'seller' && styles.activeTab]} onPress={() => setUserRole('seller')}>
            <Ionicons name="briefcase" size={20} color={userRole === 'seller' ? '#fff' : '#000'} />
            <Text style={[styles.tabText, userRole === 'seller' && styles.activeTabText]}>Seller</Text>
          </TouchableOpacity>
        </View>

        {userRole === 'customer' && (
          <View style={styles.listContainer}>
            
            {/* NEW WISHLIST NAVIGATION CARD */}
            <TouchableOpacity 
              style={styles.wishlistNavCard} 
              onPress={() => router.push('/wishlist' as any)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.wishlistIconContainer}>
                  <Ionicons name="heart" size={22} color="#fff" />
                </View>
                <Text style={styles.wishlistNavText}>My Wishlist</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>My Orders ({orders.length})</Text>
            {orders.length === 0 ? (
               <Text style={styles.emptyText}>No orders yet.</Text>
            ) : orders.map((order) => (
              <View key={order._id} style={styles.optionCard}>
                <Text style={styles.optionTitle}>Order ID: ...{order._id.slice(-5)}</Text>
                <Text style={styles.orderSubText}>${order.totalAmount} • {order.status}</Text>
              </View>
            ))}
          </View>
        )}

        {userRole === 'seller' && (
          <View style={styles.sellerSection}>
            <Text style={styles.sectionTitle}>Upload New Product</Text>
            <TouchableOpacity style={styles.imageUploadPlaceholder} onPress={pickImage}>
              {selectedImage ? <Image source={{ uri: selectedImage }} style={styles.selectedPreview} /> : <Ionicons name="cloud-upload-outline" size={40} color="#888" />}
            </TouchableOpacity>
            <TextInput style={styles.input} placeholder="Product Name" value={productName} onChangeText={setProductName} />
            <TextInput style={styles.input} placeholder="Price" keyboardType="numeric" value={productPrice} onChangeText={setProductPrice} />
            <Text style={styles.label}>Section:</Text>
            <View style={styles.selectorRow}>
              {['women', 'men', 'kids'].map((sec) => (
                <TouchableOpacity key={sec} style={[styles.chip, selectedSection === sec && styles.activeChip]} onPress={() => setSelectedSection(sec)}>
                  <Text style={[styles.chipText, selectedSection === sec && styles.activeChipText]}>{sec.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Category:</Text>
            <View style={styles.selectorRow}>
              {['Clothes', 'Shoes', 'Accessories', 'Watches'].map((cat) => (
                <TouchableOpacity key={cat} style={[styles.chip, selectedCategory === cat && styles.activeChip]} onPress={() => setSelectedCategory(cat)}>
                  <Text style={[styles.chipText, selectedCategory === cat && styles.activeChipText]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadProduct} disabled={isUploading}>
              {isUploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.uploadBtnText}>POST PRODUCT</Text>}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D2B2AE' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 20, marginBottom: 20 },
  profileImg: { width: 60, height: 60, borderRadius: 30 },
  nameContainer: { marginLeft: 15 },
  userName: { fontSize: 18, fontWeight: 'bold' },
  userEmail: { fontSize: 14, color: '#666' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 30, padding: 5, marginBottom: 20 },
  roleTab: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 25 },
  activeTab: { backgroundColor: '#000C33' },
  tabText: { marginLeft: 8, fontWeight: '600' },
  activeTabText: { color: '#fff' },
  
  // Wishlist Nav Styles
  wishlistNavCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 20, 
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  wishlistIconContainer: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 10,
  },
  wishlistNavText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginLeft: 15, 
    color: '#333' 
  },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  listContainer: { width: '100%' },
  optionCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10 },
  optionTitle: { fontWeight: 'bold' },
  orderSubText: { color: '#666', marginTop: 5 },
  emptyText: { textAlign: 'center', color: '#888', marginVertical: 10 },
  sellerSection: { backgroundColor: '#fff', padding: 20, borderRadius: 20 },
  imageUploadPlaceholder: { height: 120, borderStyle: 'dashed', borderWidth: 1, borderColor: '#aaa', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 15, overflow: 'hidden' },
  selectedPreview: { width: '100%', height: '100%' },
  input: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  label: { fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
  selectorRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#ccc', marginRight: 8, marginBottom: 8 },
  activeChip: { backgroundColor: '#000C33', borderColor: '#000C33' },
  chipText: { fontSize: 12 },
  activeChipText: { color: '#fff' },
  uploadBtn: { backgroundColor: '#002DFF', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  uploadBtnText: { color: '#fff', fontWeight: 'bold' },
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 15, 
    marginTop: 20, 
    borderWidth: 1, 
    borderColor: '#FF3B30' 
  },
  logoutText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});
