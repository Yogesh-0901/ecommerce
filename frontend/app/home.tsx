import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons'; 
import { API_BASE_URL } from '../config/api';
// RECTIFIED: Corrected SafeAreaView import to stop terminal warnings
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomePage() {
  const router = useRouter(); 
  const { category } = useLocalSearchParams(); 
  
  const [products, setProducts] = useState<any[]>([]); 
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // 1. Fetch products logic using your verified IP
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`); 
      const text = await response.text();
      
      // Safety check to prevent crashing on HTML error pages
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        Alert.alert("Server Error", "Backend returned an error page. Check routes.");
        return;
      }

      const data = JSON.parse(text);
      if (response.ok) {
        setProducts(data);
        setFilteredProducts(data);
        fetchUserWishlist(); 
      }
    } catch (error) {
      Alert.alert("Connection Error", "Ensure your PC and Phone are on the same Wi-Fi.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserWishlist = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlist`);
      if (response.ok) {
        const data = await response.json();
        const favMap: { [key: string]: boolean } = {};
        data.forEach((item: any) => { favMap[item._id] = true; });
        setFavorites(favMap);
      }
    } catch (err) { console.error("Wishlist sync error", err); }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Filter products by category
  useEffect(() => {
    if (category) {
      const filtered = products.filter(item => 
        item.category && item.category.toLowerCase() === (category as string).toLowerCase()
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [category, products]);

  // 3. Search logic
  const handleSearch = (text: string) => {
    setSearch(text);
    const filtered = products.filter(item => 
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const toggleFavorite = async (productId: string) => {
    const isCurrentlyFavorite = favorites[productId];
    setFavorites(prev => ({ ...prev, [productId]: !prev[productId] }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productId,
          action: isCurrentlyFavorite ? 'remove' : 'add'
        }),
      });

      if (!response.ok) {
        setFavorites(prev => ({ ...prev, [productId]: isCurrentlyFavorite }));
      }
    } catch (error) {
      setFavorites(prev => ({ ...prev, [productId]: isCurrentlyFavorite }));
    }
  };

  const addToCart = async (product: any) => {
    const userId = "rose@gmail.com"; 
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          action: 'add' 
        }),
      });

      if (response.ok) {
        Alert.alert("Success", `${product.name} added to basket!`);
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not connect to the server.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#888" />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search product..." 
              value={search}
              onChangeText={handleSearch}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterBtn} 
            onPress={() => router.push('/categories' as any)}
          >
            <Ionicons name="options-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroRow}>
          <Text style={styles.heroText}>
            {category ? `${category} Collection` : "Modern Furniture"}
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000C33" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredProducts} 
          numColumns={2}
          keyExtractor={(item) => item._id} 
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity onPress={() => router.push({
                  pathname: '/product-details' as any,
                  params: { id: item._id }
                })}>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item.image }} style={styles.img} />
                  <TouchableOpacity 
                    style={styles.heart} 
                    onPress={() => toggleFavorite(item._id)}
                  >
                    <Ionicons 
                      name={favorites[item._id] ? "heart" : "heart-outline"} 
                      size={22} 
                      color={favorites[item._id] ? "#FF0000" : "#fff"} 
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.prodTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.prodPrice}>${item.price}</Text>
              </TouchableOpacity>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.cartBtn} onPress={() => addToCart(item)}>
                  <Ionicons name="cart-outline" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.buyBtn} onPress={() => router.push('/checkout')}>
                  <Text style={styles.buyBtnText}>Buy</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* FIXED NAVIGATION BAR */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Ionicons name="home" size={28} color="#002DFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/categories')}>
          <Ionicons name="list" size={28} color="#002DFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/basket')}>
          <Ionicons name="basket" size={28} color="#002DFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <Ionicons name="person" size={28} color="#002DFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D2B2AE' },
  header: { backgroundColor: '#000C33', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, paddingBottom: 25 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  searchBar: { flex: 1, backgroundColor: '#fff', height: 50, borderRadius: 25, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginRight: 15 },
  searchInput: { flex: 1, marginLeft: 10 },
  filterBtn: { backgroundColor: '#fff', padding: 12, borderRadius: 12 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  grid: { padding: 10, paddingBottom: 120 },
  card: { flex: 1, margin: 8, backgroundColor: '#fff', borderRadius: 20, padding: 10, elevation: 2 },
  imageContainer: { width: '100%', aspectRatio: 1, borderRadius: 15, overflow: 'hidden' },
  img: { width: '100%', height: '100%', resizeMode: 'cover' },
  heart: { position: 'absolute', top: 10, right: 10, zIndex: 1 },
  prodTitle: { fontWeight: 'bold', marginTop: 10, fontSize: 14 },
  prodPrice: { color: '#555', marginBottom: 5 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  cartBtn: { backgroundColor: '#002DFF', padding: 8, borderRadius: 10 },
  buyBtn: { backgroundColor: '#000C33', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  buyBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  navBar: { position: 'absolute', bottom: 20, left: 20, right: 20, height: 75, backgroundColor: '#fff', borderRadius: 40, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 10 },
  navItem: { flex: 1, alignItems: 'center' }
});
