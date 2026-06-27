import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/api';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [userInputCaptcha, setUserInputCaptcha] = useState<string>('');

  // 1. Captcha Logic
  const generateCaptcha = () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setUserInputCaptcha('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // 2. Updated Login Logic
  const handleLogin = async (): Promise<void> => {
    const gmailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    // Frontend Validations
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your email.');
      return;
    }
    if (!gmailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Only @gmail.com addresses are allowed.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    
    // Captcha Check
    if (userInputCaptcha !== captchaCode) {
      Alert.alert('Invalid Captcha', 'Please enter the correct code.');
      generateCaptcha();
      return;
    }

    // 3. Connect to Backend (Corrected URL with /api/auth/)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // Safely check the response type before parsing
      const responseText = await response.text();
      
      try {
        const data = JSON.parse(responseText);

        if (response.ok) {
          Alert.alert('Success', 'Logging in...');
          router.replace('/home' as any); 
        } else {
          Alert.alert('Login Failed', data.error || "Invalid Credentials");
          generateCaptcha();
        }
      } catch (parseError) {
        // This prevents the "<" crash by catching HTML responses (like 404 or 500 pages)
        console.error("Server returned non-JSON response:", responseText);
        Alert.alert('Server Error', 'Received an invalid response from server. Please check if the backend is running properly.');
      }

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Server not responding";
      Alert.alert('Network Error', 'Could not connect to the server. Ensure your phone and PC are on the same Wi-Fi.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.inner}>
        <Text style={styles.title}>Login</Text>
        
        <View style={styles.inputGroup}>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Email (must be @gmail.com)"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => router.push('/forgot-password' as any)}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* CAPTCHA SECTION */}
          <View style={styles.captchaRow}>
            <View style={styles.captchaDisplay}>
              <Text style={styles.captchaText}>{captchaCode}</Text>
            </View>
            <TouchableOpacity onPress={generateCaptcha} style={styles.refreshBtn}>
              <Ionicons name="refresh" size={26} color="#E07A5F" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Enter Captcha"
              placeholderTextColor="#aaa"
              value={userInputCaptcha}
              onChangeText={setUserInputCaptcha}
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => router.push('/signup' as any)}
        >
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D2B2AE' },
  inner: { flex: 1, paddingHorizontal: 35, justifyContent: 'center' },
  title: { fontSize: 42, fontWeight: 'bold', marginBottom: 40, color: '#000' },
  inputGroup: { width: '100%' },
  inputBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 15,
    elevation: 3,
  },
  input: { fontSize: 16, color: '#000' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotText: { color: '#000C33', fontWeight: '600', fontSize: 14 },
  captchaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  captchaDisplay: {
    backgroundColor: '#000C33',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captchaText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 4,
    fontStyle: 'italic',
  },
  refreshBtn: { marginLeft: 15 },
  button: {
    backgroundColor: '#000C33',
    paddingVertical: 18,
    borderRadius: 40,
    marginTop: 10,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  signupLink: { marginTop: 25, alignItems: 'center' },
  signupText: { fontSize: 16, color: '#000' },
  signupBold: { fontWeight: 'bold', color: '#000C33', textDecorationLine: 'underline' },
});
