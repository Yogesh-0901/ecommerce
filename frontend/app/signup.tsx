import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/api';

export default function Signup() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // 1. Manual Signup Logic
  const handleSignup = async (): Promise<void> => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please fill in all fields");
      return;
    }

    const gmailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      Alert.alert("Invalid Email", "Only @gmail.com addresses are allowed.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, role: 'customer' }),
      });

      const text = await response.text();
      
      if (text.startsWith('<html')) {
        throw new Error("Server returned HTML error. Check routes.");
      }

      const data = JSON.parse(text);
      if (response.ok) {
        Alert.alert("Success", "Account Created!");
        router.replace('/home' as any); 
      } else {
        Alert.alert("Error", data.error || "Signup failed");
      }
    } catch (error) {
      Alert.alert("Connection Error", "Check your backend server.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Google Signup Logic (UI Only for now)
  const handleGoogleSignup = () => {
    Alert.alert(
      "Google Continue", 
      "This requires setting up Google Cloud Console credentials. Would you like to proceed with the UI?",
      [{ text: "OK" }]
    );
    
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.inner}>
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputBox}>
              <TextInput 
                style={styles.input} 
                placeholder="Full Name" 
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputBox}>
              <TextInput 
                style={styles.input} 
                placeholder="Email (@gmail.com only)" 
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputBox}>
              <TextInput 
                style={styles.input} 
                placeholder="Password" 
                secureTextEntry={true} 
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SIGN UP</Text>}
          </TouchableOpacity>

          {/* GOOGLE OPTION */}
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignup}>
            <Ionicons name="logo-google" size={22} color="#EA4335" />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/' as any)} style={styles.loginLink}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginBold}>Login</Text>
            </Text>
          </TouchableOpacity>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D2B2AE' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  inner: { paddingHorizontal: 35, paddingVertical: 40 },
  backButton: { marginBottom: 20 },
  title: { fontSize: 36, fontWeight: 'bold', marginBottom: 30, color: '#000' },
  inputGroup: { width: '100%' },
  inputBox: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    paddingHorizontal: 15,
    paddingVertical: 18, 
    marginBottom: 15,
    elevation: 2 
  },
  input: { fontSize: 16, color: '#000' },
  signupBtn: { 
    backgroundColor: '#000C33', 
    paddingVertical: 18, 
    borderRadius: 40, 
    marginTop: 10, 
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  orText: { marginHorizontal: 10, color: '#666', fontWeight: '600' },
  googleBtn: { 
    flexDirection: 'row',
    backgroundColor: '#fff', 
    paddingVertical: 16, 
    borderRadius: 40, 
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    elevation: 1
  },
  googleBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  loginLink: { marginTop: 25, alignItems: 'center' },
  loginText: { fontSize: 16, color: '#000' },
  loginBold: { fontWeight: 'bold', color: '#000C33' }
});
