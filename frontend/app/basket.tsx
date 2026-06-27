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
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/api';

export default function BasketPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = "rose@gmail.com"; 

  // 1. Fetch Cart with integrated safety checks
  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart/${userId}`);
      const text = await response.text(); // Get raw text first to handle potential HTML errors
      
      try {
        const data = JSON.parse(text); 
        if (response.ok) {
          setCartItems(data);
        } else {
          console.error("Cart error:", data.error);
          Alert.alert("Error", data.error || "Failed to load cart");
        }
      } catch (parseError) {
        // This catches the HTML response and prevents the "<" character crash
        console.error("Server returned HTML instead of JSON in BasketPage");
        Alert.alert("Server Error", "Invalid response from server. Check backend routes.");
      }
    } catch (error) {
      console.error("Network error:", error);
      Alert.alert("Connection Error", "Check your server IP and Wi-Fi connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 2. Sync Quantity Changes with integrated safety checks
  const handleUpdate = async (productId: string, action: 'plus' | 'minus' | 'remove') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action }),
      });

      const text = await response.text();
      try {
        const updatedItems = JSON.parse(text);
        if (response.ok) {
          setCartItems(updatedItems); 
        } else {
          Alert.alert("Update Error", updatedItems.error || "Update failed.");
        }
      } catch (parseError) {
        // Prevents crash during updates if server fails
        Alert.alert("Server Error", "Backend returned an invalid response during update.");
      }
    } catch (error) {
      console.error("Cart update error:", error);
      Alert.alert("Network Error", "Check your connection.");
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#000C33" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={100} color="#888" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/home')}>
            <Text style={styles.shopBtnText}>SHOP NOW</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
             <TouchableOpacity onPress={() => router.back()}>
               <Ionicons name="arrow-back" size={24} color="black" />
             </TouchableOpacity>
             <Text style={styles.headerTitleText}>basket</Text>
          </View>
          <Text style={styles.mainTitle}>My Cart</Text>
          {cartItems.map((item) => (
            <View key={item.productId} style={styles.cartCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <View style={styles.titleRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <TouchableOpacity onPress={() => handleUpdate(item.productId, 'remove')}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemSubText}>Color: <Text style={{color:'#000'}}>Black</Text>  Size: <Text style={{color:'#000'}}>M</Text></Text>
                <View style={styles.quantityRow}>
                  <View style={styles.counter}>
                    <TouchableOpacity onPress={() => handleUpdate(item.productId, 'minus')} style={styles.qtyBtn}>
                      <Ionicons name="remove" size={20} color="#888" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => handleUpdate(item.productId, 'plus')} style={styles.qtyBtn}>
                      <Ionicons name="add" size={20} color="#888" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.priceText}>{item.price * item.quantity}$</Text>
                </View>
              </View>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total amount:</Text>
            <Text style={styles.totalValue}>{totalAmount}$</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/checkout')}>
            <Text style={styles.checkoutText}>CHECK OUT</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Ionicons name="home-outline" size={26} color="#002DFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/categories')}>
          <Ionicons name="list-outline" size={26} color="#002DFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/basket')}>
          <Ionicons name="basket" size={26} color="#002DFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <Ionicons name="person-outline" size={26} color="#002DFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D2B2AE' },
  scrollContent: { paddingHorizontal: '5%', paddingBottom: 160 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  headerTitleText: { fontSize: 18, marginLeft: 20, fontWeight: '500' },
  mainTitle: { fontSize: 34, fontWeight: 'bold', marginVertical: 30 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { fontSize: 18, color: '#888', marginTop: 20, fontWeight: '600' },
  shopBtn: { backgroundColor: '#000C33', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25, marginTop: 20 },
  shopBtnText: { color: '#fff', fontWeight: 'bold' },
  cartCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, height: 120, marginBottom: 20, overflow: 'hidden', elevation: 3 },
  itemImage: { width: 110, height: '100%' },
  itemDetails: { flex: 1, padding: 12, justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontSize: 18, fontWeight: 'bold' },
  itemSubText: { fontSize: 13, color: '#aaa' },
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  counter: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#eee' },
  qtyText: { marginHorizontal: 12, fontWeight: 'bold' },
  priceText: { fontWeight: 'bold', fontSize: 16 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  totalLabel: { fontSize: 16, color: '#555' },
  totalValue: { fontSize: 20, fontWeight: 'bold' },
  checkoutBtn: { backgroundColor: '#000C33', height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginTop: 30, width: '100%' },
  checkoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  navBar: { position: 'absolute', bottom: 20, left: 20, right: 20, height: 75, backgroundColor: '#fff', borderRadius: 40, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 10 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});
